import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, username } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      // Check if it's the same user (by either field)
      const isSameUser = 
        existingUser.hederaAccountId === accountId || 
        existingUser.walletAddress === accountId;
      
      if (!isSameUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Find user by either hederaAccountId or walletAddress
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { hederaAccountId: accountId },
          { walletAddress: accountId },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: accountId,
          hederaAccountId: accountId,
          name: accountId,
          username,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    }

    return NextResponse.json({
      success: true,
      username: user.username,
      message: 'Username updated successfully',
    });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json(
      { error: 'Failed to update username', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { hederaAccountId: accountId },
          { walletAddress: accountId },
        ],
      },
      select: {
        username: true,
        name: true,
        hederaAccountId: true,
      },
    });

    return NextResponse.json({
      success: true,
      username: user?.username || null,
      displayName: user?.username || user?.name || accountId,
    });
  } catch (error) {
    console.error('Error fetching username:', error);
    return NextResponse.json(
      { error: 'Failed to fetch username', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
