"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoinsIcon, TrendingUpIcon, UsersIcon, ActivityIcon } from "lucide-react";
import { useDAppConnector } from "@/components/client-providers";

export default function TokenStats() {
    const [tokenBalance, setTokenBalance] = useState<string>("0");
    const [totalSupply, setTotalSupply] = useState<string>("0");
    const [holderCount, setHolderCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const dAppContext = useDAppConnector();
    const userAccountId = dAppContext?.userAccountId;

    // Fetch token stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!userAccountId) return;
            
            try {
                setIsLoading(true);
                
                // Fetch user balance
                const balanceResponse = await fetch(`/api/hedera/account/balance?accountId=${userAccountId}`);
                const balanceData = await balanceResponse.json();
                
                if (balanceData.success && balanceData.data.tokens) {
                    const realmTokenId = process.env.NEXT_PUBLIC_REALM_TOKEN_ID;
                    if (realmTokenId) {
                        const balance = balanceData.data.tokens.get(realmTokenId) || "0";
                        setTokenBalance(balance);
                    }
                }

                // Fetch token info
                const tokenResponse = await fetch(`/api/hedera/token/info?tokenId=${process.env.NEXT_PUBLIC_REALM_TOKEN_ID}`);
                const tokenData = await tokenResponse.json();
                
                if (tokenData.success) {
                    setTotalSupply(tokenData.data.totalSupply || "0");
                    setHolderCount(tokenData.data.holderCount || 0);
                }
            } catch (error) {
                console.error('Failed to fetch token stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [userAccountId]);

    const formattedBalance = parseFloat(tokenBalance).toFixed(2);
    const formattedSupply = parseFloat(totalSupply).toFixed(2);

    return (
        <div className="container max-w-4xl py-2">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">
                REALM Token Statistics
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <CoinsIcon className="mr-2 h-5 w-5" />
                            Your Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {isLoading ? "..." : formattedBalance}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">REALM</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <TrendingUpIcon className="mr-2 h-5 w-5" />
                            Total Supply
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {isLoading ? "..." : formattedSupply}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">REALM</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <UsersIcon className="mr-2 h-5 w-5" />
                            Holders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {isLoading ? "..." : holderCount}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">accounts</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <ActivityIcon className="mr-2 h-5 w-5" />
                            Network
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">Testnet</div>
                        <p className="text-sm text-slate-400 mt-1">Hedera</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Token Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600 font-medium">Token Name:</span>
                            <span className="font-semibold">REALM</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600 font-medium">Token Symbol:</span>
                            <span className="font-semibold">REALM</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600 font-medium">Token ID:</span>
                            <span className="font-mono text-sm">{process.env.NEXT_PUBLIC_REALM_TOKEN_ID || "Not set"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600 font-medium">Decimals:</span>
                            <span className="font-semibold">8</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-slate-600 font-medium">Network:</span>
                            <span className="font-semibold">Hedera Testnet</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 text-center">
                <a
                    href={`https://hashscan.io/testnet/token/${process.env.NEXT_PUBLIC_REALM_TOKEN_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    View on HashScan Explorer
                </a>
            </div>
        </div>
    );
}
