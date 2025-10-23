import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const guild = await prisma.guild.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            contribution: true,
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        tournaments: {
          orderBy: {
            startDate: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    return NextResponse.json({ guild });
  } catch (error) {
    console.error('Error fetching guild:', error);
    return NextResponse.json({ error: 'Failed to fetch guild' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { name, description, imageUrl, bannerUrl, isPublic } = body;

    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const guild = await prisma.guild.update({
      where: {
        slug: params.slug,
      },
      data: updateData,
    });

    return NextResponse.json({ guild });
  } catch (error) {
    console.error('Error updating guild:', error);
    return NextResponse.json({ error: 'Failed to update guild' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.guild.delete({
      where: {
        slug: params.slug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guild:', error);
    return NextResponse.json({ error: 'Failed to delete guild' }, { status: 500 });
  }
}
