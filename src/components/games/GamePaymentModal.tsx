"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { recordGamePayment } from "@/lib/services/game-service"
import { useDAppConnector } from "@/components/client-providers"

interface GamePaymentModalProps {
    isOpen: boolean
    onClose: () => void
    gamePath: string
    gameName: string
}

// Game entry fee in REALM tokens
const GAME_ENTRY_FEE = 10;

export function GamePaymentModal({ isOpen, onClose, gamePath, gameName }: GamePaymentModalProps) {
    const router = useRouter()
    const dAppContext = useDAppConnector()
    const userAccountId = dAppContext?.userAccountId
    const isConnected = !!userAccountId
    const [isPaying, setIsPaying] = useState(false)
    const [redirecting, setRedirecting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const gameId = gamePath.split('/').pop() || ""

    // Handle payment
    const handlePayment = async () => {
        if (!address) return

        setIsPaying(true)

        try {
            await writeContract({
                address: TOKEN_CONTRACT_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'transfer',
                args: [PLATFORM_WALLET, parseUnits('1', 18)], // Assuming 18 decimals for the token
            })
        } catch (err) {
            console.error("Payment failed:", err)
            setIsPaying(false)
        }
    }

    // Redirect to game page after successful payment
    useEffect(() => {
        if (isConfirmed && !redirecting) {
            // Record the transaction
            if (address) {
                recordGamePayment({
                    gameId: gameId,
                    txHash: hash || "",
                    amount: 1,
                    address: address,
                }).catch(err => {
                    console.error("Failed to record payment:", err)
                })
            }

            setRedirecting(true)
            router.push(gamePath)
            onClose()
        }
    }, [isConfirmed, redirecting, router, gamePath, onClose, hash, gameId, address])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#202020] border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Play {gameName}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        To play this game, you need to pay 1 REALM token for each play session.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col space-y-4 py-4">
                    <div className="bg-[#151515] p-4 rounded-md">
                        <p className="text-sm text-gray-400 mb-2">Payment details:</p>
                        <div className="flex justify-between">
                            <span>Game play fee</span>
                            <span className="font-semibold">1 REALM Token</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">
                            Note: Each play session requires a separate payment
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-800 p-3 rounded-md text-red-300 text-sm">
                            {error.message || "Transaction failed. Please try again."}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    {!isConnected ? (
                        <div className="w-full flex justify-center">
                            <ConnectButton />
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                                disabled={isPending || isConfirming}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePayment}
                                className="bg-[#98ee2c] text-black hover:bg-[#7bc922] font-bold"
                                disabled={isPending || isConfirming}
                            >
                                {isPending || isConfirming ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isPending ? "Confirm in Wallet" : "Processing..."}
                                    </>
                                ) : (
                                    "Pay & Play Now"
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 