import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Handshake, Award, Loader2, ExternalLink } from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import { GameStatus, PieceColor } from './ChessTypes';
import { GameSettings } from './GameFunctions';
import { useDAppConnector } from '@/components/client-providers';
import { TransferTransaction, Hbar, AccountId } from '@hashgraph/sdk';

// Define interface for component props
interface GameOverDialogProps {
    showGameOverModal: boolean;
    setShowGameOverModal: (show: boolean) => void;
    gameStatus: GameStatus;
    playerColor: PieceColor;
    result: string;
    fen: string;
    settings: GameSettings;
    resetGame: () => void;
    moves: string;
    opponent: string;
    moveCount: number;
}

// Winner reward in HBAR
const WINNER_REWARD_HBAR = 0.5;
const PLATFORM_ACCOUNT_ID = process.env.NEXT_PUBLIC_PLATFORM_ACCOUNT_ID || "0.0.1234";

const GameOverDialog: React.FC<GameOverDialogProps> = ({
    showGameOverModal,
    setShowGameOverModal,
    gameStatus,
    playerColor,
    result,
    fen,
    resetGame,
    moveCount
}) => {
    const [claimingReward, setClaimingReward] = useState(false);
    const [rewardClaimed, setRewardClaimed] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const dAppContext = useDAppConnector();
    const dAppConnector = dAppContext?.dAppConnector;
    const userAccountId = dAppContext?.userAccountId;

    const isWinner = gameStatus.winner && gameStatus.winner === playerColor;
    const isDraw = !gameStatus.winner && gameStatus.reason !== null;

    // Claim winner reward
    const claimReward = async () => {
        if (!userAccountId || !dAppConnector) {
            setError("Please connect your wallet first");
            return;
        }

        setClaimingReward(true);
        setError(null);

        try {
            // Create transfer transaction for reward
            const transaction = new TransferTransaction()
                .addHbarTransfer(AccountId.fromString(PLATFORM_ACCOUNT_ID), Hbar.fromString(`-${WINNER_REWARD_HBAR}`))
                .addHbarTransfer(AccountId.fromString(userAccountId), Hbar.fromString(`${WINNER_REWARD_HBAR}`))
                .setTransactionMemo(`Chess Win Reward - ${moveCount} moves`)
                .setNodeAccountIds([AccountId.fromString("0.0.3")]);

            // Freeze and convert to bytes
            const frozenTx = await transaction.freezeWithSigner(dAppConnector.signers[0]);
            const txBytes = Buffer.from(frozenTx.toBytes()).toString('base64');

            // Sign and execute
            const result = await dAppConnector.signAndExecuteTransaction({
                signerAccountId: userAccountId,
                transactionList: txBytes,
            });

            const transactionId = 'transactionId' in result ? result.transactionId : null;
            
            if (transactionId) {
                setTxId(String(transactionId));
                setRewardClaimed(true);
            }
        } catch (err) {
            console.error("Reward claim failed:", err);
            setError(err instanceof Error ? err.message : "Failed to claim reward");
        } finally {
            setClaimingReward(false);
        }
    };

    const handleClose = () => {
        setShowGameOverModal(false);
        setRewardClaimed(false);
        setTxId(null);
        setError(null);
    };

    const handlePlayAgain = () => {
        handleClose();
        resetGame();
    };

    return (
        <Dialog open={showGameOverModal} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl bg-[#202020] border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {isWinner && <Trophy className="text-yellow-500" />}
                        {isDraw && <Handshake className="text-blue-500" />}
                        {!isWinner && !isDraw && <Award className="text-gray-500" />}
                        {isWinner ? "Victory!" : isDraw ? "Draw!" : "Game Over"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {result}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Final board position */}
                    <div className="w-full max-w-md mx-auto">
                        <Chessboard
                            position={fen}
                            boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                            arePiecesDraggable={false}
                        />
                    </div>

                    {/* Game stats */}
                    <div className="bg-[#151515] p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Game Statistics</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-400">Total Moves:</span>
                                <span className="ml-2 font-semibold">{moveCount}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Your Color:</span>
                                <span className="ml-2 font-semibold capitalize">{playerColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Winner reward section */}
                    {isWinner && !rewardClaimed && (
                        <div className="bg-green-900/20 border border-green-800 p-4 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-green-300">🎉 Congratulations!</h3>
                                    <p className="text-sm text-gray-400">Claim your winner reward</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-[#98ee2c]">{WINNER_REWARD_HBAR} HBAR</div>
                                    <div className="text-xs text-gray-400">~$0.025</div>
                                </div>
                            </div>
                            <Button
                                onClick={claimReward}
                                disabled={claimingReward}
                                className="w-full bg-[#98ee2c] text-black hover:bg-[#7bc922] font-bold"
                            >
                                {claimingReward ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Claiming Reward...
                                    </>
                                ) : (
                                    "Claim Reward"
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Reward claimed success */}
                    {rewardClaimed && txId && (
                        <div className="bg-green-900/20 border border-green-800 p-4 rounded-md">
                            <h3 className="font-semibold text-green-300 mb-2">✓ Reward Claimed!</h3>
                            <p className="text-sm text-gray-400 mb-2">
                                {WINNER_REWARD_HBAR} HBAR has been sent to your wallet
                            </p>
                            <a
                                href={`https://hashscan.io/testnet/transaction/${txId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#98ee2c] hover:underline flex items-center gap-1"
                            >
                                View on HashScan <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-800 p-3 rounded-md text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handlePlayAgain}
                            className="flex-1 bg-[#98ee2c] text-black hover:bg-[#7bc922] font-bold"
                        >
                            Play Again
                        </Button>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GameOverDialog;
