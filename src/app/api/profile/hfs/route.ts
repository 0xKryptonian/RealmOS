import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HederaFileService } from '@/lib/hedera/file-service';

// GET /api/profile/hfs?accountId=0.0.x
// Returns HFS-backed games the user has played
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    // Find user by Hedera account id
    const user = await prisma.user.findFirst({
      where: { hederaAccountId: accountId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Find games the user has played
    const plays = await prisma.gamePlay.findMany({
      where: { userId: user.id },
      select: { gameId: true },
    });

    const gameIds = Array.from(new Set(plays.map((p) => p.gameId)));

    if (gameIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const games = await prisma.game.findMany({
      where: {
        id: { in: gameIds },
        OR: [
          { hfsFileId: { not: null } },
          { hfsMetadataId: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        hfsFileId: true,
        hfsMetadataId: true,
        imagePath: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });

    const data = games.map((g) => ({
      ...g,
      fileUrl: g.hfsFileId ? HederaFileService.getFileUrl(g.hfsFileId) : null,
      metadataUrl: g.hfsMetadataId ? HederaFileService.getFileUrl(g.hfsMetadataId) : null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch HFS games';
    console.error('Error fetching HFS games:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
