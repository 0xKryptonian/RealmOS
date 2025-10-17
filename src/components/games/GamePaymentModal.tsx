"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2, Wallet } from "lucide-react"
import { recordGamePayment } from "@/lib/services/game-service"
import { useDAppConnector } from "@/components/client-providers"
import { TransferTransaction, Hbar, AccountId } from "@hashgraph/sdk"

interface GamePaymentModalProps {
    isOpen: boolean
    onClose: () => void
    gamePath: string
    gameName: string
}

// Game entry fee in HBAR (0.1 HBAR = ~$0.005)
const GAME_ENTRY_FEE_HBAR = 0.1;
const PLATFORM_ACCOUNT_ID = process.env.NEXT_PUBLIC_PLATFORM_ACCOUNT_ID || "0.0.1234";

export function GamePaymentModal({ isOpen, onClose, gamePath, gameName }: GamePaymentModalProps) {
    const router = useRouter()
    const dAppContext = useDAppConnector()
    const dAppConnector = dAppContext?.dAppConnector
    const userAccountId = dAppContext?.userAccountId
    const isConnected = !!userAccountId
    const [isPaying, setIsPaying] = useState(false)
    const [redirecting, setRedirecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [txId, setTxId] = useState<string | null>(null)

    const gameId = gamePath.split('/').pop() || ""

    // Handle payment with HBAR
    const handlePayment = async () => {
        if (!userAccountId || !dAppConnector) {
            setError("Please connect your wallet first")
            return
        }

        setIsPaying(true)
        setError(null)

        try {
            // Get the signer from dAppConnector
            const signer = dAppConnector.signers[0];
            if (!signer) {
                throw new Error("No signer available");
            }

            // Create and execute transfer transaction using signAndExecuteTransaction
            const transaction = new TransferTransaction()
                .addHbarTransfer(AccountId.fromString(userAccountId), new Hbar(-GAME_ENTRY_FEE_HBAR))
                .addHbarTransfer(AccountId.fromString(PLATFORM_ACCOUNT_ID), new Hbar(GAME_ENTRY_FEE_HBAR))
                .setTransactionMemo(`Game Entry: ${gameName}`)
                .setNodeAccountIds([AccountId.fromString("0.0.3")]);

            // Freeze with signer and convert to bytes
            const frozenTx = await transaction.freezeWithSigner(signer);
            const txBytes = Buffer.from(frozenTx.toBytes()).toString('base64');

            // Sign and execute via WalletConnect
            const result = await dAppConnector.signAndExecuteTransaction({
                signerAccountId: userAccountId,
                transactionList: txBytes,
            });

            const transactionId = 'transactionId' in result ? result.transactionId : null
            
            if (transactionId) {
                setTxId(String(transactionId))
                
                // Record payment in database
                await recordGamePayment({
                    gameId: gameId,
                    txHash: String(transactionId),
                    amount: GAME_ENTRY_FEE_HBAR,
                    address: userAccountId,
                })

                // Redirect to game
                setRedirecting(true)
                setTimeout(() => {
                    router.push(gamePath)
                    onClose()
                }, 1500)
            }
        } catch (err) {
            console.error("Payment failed:", err)
            setError(err instanceof Error ? err.message : "Payment failed. Please try again.")
            setIsPaying(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#202020] border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Play {gameName}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Pay {GAME_ENTRY_FEE_HBAR} HBAR to start playing. Low fees, instant confirmation!
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col space-y-4 py-4">
                    <div className="bg-[#151515] p-4 rounded-md">
                        <p className="text-sm text-gray-400 mb-2">Payment details:</p>
                        <div className="flex justify-between mb-2">
                            <span>Game entry fee</span>
                            <span className="font-semibold text-[#98ee2c]">{GAME_ENTRY_FEE_HBAR} HBAR</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">USD equivalent</span>
                            <span className="text-xs text-gray-400">~$0.005</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 italic">
                            ⚡ Instant confirmation on Hedera network
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-800 p-3 rounded-md text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {txId && (
                        <div className="bg-green-900/20 border border-green-800 p-3 rounded-md text-green-300 text-sm">
                            ✓ Payment successful! Redirecting to game...
                            <a 
                                href={`https://hashscan.io/testnet/transaction/${txId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs underline mt-1"
                            >
                                View on HashScan
                            </a>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    {!isConnected ? (
                        <div className="w-full flex flex-col items-center gap-2">
                            <p className="text-sm text-gray-400">Connect your Hedera wallet to continue</p>
                            <Button
                                onClick={() => dAppConnector?.openModal()}
                                className="bg-[#98ee2c] text-black hover:bg-[#7bc922] font-bold"
                            >
                                <Wallet className="mr-2 h-4 w-4" />
                                Connect Wallet
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                                disabled={isPaying || redirecting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePayment}
                                className="bg-[#98ee2c] text-black hover:bg-[#7bc922] font-bold"
                                disabled={isPaying || redirecting}
                            >
                                {isPaying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : redirecting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting...
                                    </>
                                ) : (
                                    <>
                                        Pay {GAME_ENTRY_FEE_HBAR} HBAR & Play
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 