import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
    try {
        const address = req.nextUrl.searchParams.get("address") || req.nextUrl.searchParams.get("accountId")

        if (!address) {
            return NextResponse.json(
                { error: "Wallet address or account ID is required" },
                { status: 400 }
            )
        }

        const user = await db.user.findUnique({
            where: { walletAddress: address },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const transactions = await db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ transactions })
    } catch (error) {
        console.error("Error fetching transactions:", error)
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const address = req.nextUrl.searchParams.get("address") || req.nextUrl.searchParams.get("accountId")

        if (!address) {
            return NextResponse.json(
                { error: "Wallet address or account ID is required" },
                { status: 400 }
            )
        }

        // Find or create user by wallet address
        let user = await db.user.findUnique({
            where: { walletAddress: address },
        })

        if (!user) {
            // Create a new user if they don't exist
            user = await db.user.create({
                data: {
                    walletAddress: address,
                },
            })
        }

        const data = await req.json()
        const { type, amount, txHash, status, description, tokenSymbol = "HBAR" } = data

        const transaction = await db.transaction.create({
            data: {
                userId: user.id,
                type,
                amount,
                txHash,
                status,
                description,
                tokenSymbol,
            },
        })

        return NextResponse.json({ transaction })
    } catch (error) {
        console.error("Error creating transaction:", error)
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        )
    }
} 