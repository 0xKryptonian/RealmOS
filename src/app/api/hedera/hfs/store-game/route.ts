import { NextRequest, NextResponse } from 'next/server';
import { HederaFileService } from '@/lib/hedera/file-service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/hedera/hfs/store-game
 * Store AI-generated game HTML on Hedera File Service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameHtml, gameName, gameSlug, gameId } = body;

    if (!gameHtml || !gameName) {
      return NextResponse.json(
        { error: 'gameHtml and gameName are required' },
        { status: 400 }
      );
    }

    // Store game HTML on HFS
    console.log(`📦 Storing game "${gameName}" on HFS...`);
    const hfsFile = await HederaFileService.storeGameOnHFS(gameHtml, gameName);

    // Store metadata on HFS
    const metadata = {
      name: gameName,
      slug: gameSlug || gameName.toLowerCase().replace(/\s+/g, '-'),
      description: `AI-generated game: ${gameName}`,
      createdAt: new Date().toISOString(),
      fileSize: hfsFile.size,
      contentType: hfsFile.contentType,
    };

    const metadataFile = await HederaFileService.createFile(
      JSON.stringify(metadata, null, 2),
      {
        contentType: 'application/json',
        description: `Metadata for ${gameName}`,
      }
    );

    // Update database if gameId provided
    if (gameId) {
      await prisma.game.update({
        where: { id: gameId },
        data: {
          hfsFileId: hfsFile.fileId,
          hfsMetadataId: metadataFile.fileId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        hfsFileId: hfsFile.fileId,
        hfsMetadataId: metadataFile.fileId,
        fileSize: hfsFile.size,
        fileUrl: HederaFileService.getFileUrl(hfsFile.fileId),
        metadataUrl: HederaFileService.getFileUrl(metadataFile.fileId),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to store game on HFS';
    console.error('Error storing game on HFS:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hedera/hfs/store-game
 * Retrieve game from HFS
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Validate file ID format
    if (!HederaFileService.isValidFileId(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID format' },
        { status: 400 }
      );
    }

    // Retrieve file from HFS
    const contents = await HederaFileService.getFileContentsAsString(fileId);

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        contents,
        fileUrl: HederaFileService.getFileUrl(fileId),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve game from HFS';
    console.error('Error retrieving game from HFS:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
