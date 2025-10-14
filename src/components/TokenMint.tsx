"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCwIcon, CheckCircleIcon, AlertCircleIcon, CoinsIcon } from "lucide-react";
import { useDAppConnector } from "@/components/client-providers";

function TokenMint() {
    const [amount, setAmount] = useState<number>(1);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [tokenBalance, setTokenBalance] = useState<string>("0");
    const [remainingAllowance, setRemainingAllowance] = useState<number>(0);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    const dAppContext = useDAppConnector();
    const userAccountId = dAppContext?.userAccountId;
    const isConnected = !!userAccountId;

    // Reset states when transaction completes
    const resetStates = () => {
        setTimeout(() => {
            setIsSuccess(false);
            setError(null);
            setTxHash(null);
        }, 5000);
    };

    // Fetch token balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (!userAccountId) return;
            
            try {
                setIsLoadingBalance(true);
                const response = await fetch(`/api/hedera/account/balance?accountId=${userAccountId}`);
                const data = await response.json();
                
                if (data.success && data.data.tokens) {
                    const realmTokenId = process.env.NEXT_PUBLIC_REALM_TOKEN_ID;
                    if (realmTokenId) {
                        const balance = data.data.tokens.get(realmTokenId) || "0";
                        setTokenBalance(balance);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch balance:', error);
            } finally {
                setIsLoadingBalance(false);
            }
        };

        fetchBalance();
    }, [userAccountId, isSuccess]);

    // Handle mint function
    const handleMint = async () => {
        try {
            setError(null);
            setIsPending(true);

            if (!userAccountId) {
                setError("Please connect your wallet first");
                return;
            }

            if (amount <= 0) {
                setError("Amount must be greater than 0");
                return;
            }

            // Call API to mint tokens
            const response = await fetch('/api/hedera/token/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: userAccountId,
                    amount: amount,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                setTxHash(data.data.txId);
                setAmount(1);
                resetStates();
            } else {
                setError(data.error || 'Failed to mint tokens');
            }
        } catch (err) {
            console.error("Error minting tokens:", err);
            setError(err instanceof Error ? err.message : "Failed to mint tokens");
        } finally {
            setIsPending(false);
        }
    };

    const isDisabled = !isConnected || isPending || remainingAllowance <= 0;

    return (
        <div className="container max-w-4xl py-12">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">
                Mint REALM Tokens
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <CoinsIcon className="mr-2 h-5 w-5" />
                            Token Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {isLoadingBalance ? "..." : parseFloat(tokenBalance).toFixed(2)}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">REALM</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Mint Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">Free</div>
                        <p className="text-sm text-slate-400 mt-1">Network fees only (~$0.0001)</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Remaining Allowance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{remainingAllowance}</div>
                        <p className="text-sm text-slate-400 mt-1">tokens available</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Mint Your Tokens</CardTitle>
                    <CardDescription>
                        Select the amount of REALM tokens you want to mint
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="amount" className="text-lg">
                                Amount to Mint
                            </Label>
                            <Badge variant="secondary" className="text-lg px-3 py-1">
                                {amount} REALM
                            </Badge>
                        </div>

                        <Slider
                            id="amount"
                            min={1}
                            max={100}
                            step={1}
                            value={[amount]}
                            onValueChange={(value: number[]) => setAmount(value[0])}
                            className="w-full"
                            disabled={isDisabled}
                        />

                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>1 token</span>
                            <span>100 tokens</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Amount:</span>
                            <span className="font-semibold">{amount} REALM</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Cost:</span>
                            <span className="font-semibold">Free</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Network Fee:</span>
                            <span className="font-semibold">~$0.0001</span>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {isSuccess && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Success!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Tokens minted successfully!{" "}
                                {txHash && (
                                    <a
                                        href={`https://hashscan.io/testnet/transaction/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline font-medium"
                                    >
                                        View on HashScan
                                    </a>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        size="lg"
                        onClick={handleMint}
                        disabled={isDisabled}
                    >
                        {isPending ? (
                            <>
                                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                                Minting...
                            </>
                        ) : (
                            <>Mint {amount} REALM Tokens</>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800">
                <div className="flex items-start">
                    <RefreshCwIcon className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                    <div>
                        <h4 className="font-medium mb-1">About REALM Tokens</h4>
                        <p className="text-sm">
                            REALM tokens are the native currency of HederaVerse. Use them to play games, 
                            participate in tournaments, and earn rewards. Tokens are minted on Hedera Token Service (HTS).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TokenMint;
