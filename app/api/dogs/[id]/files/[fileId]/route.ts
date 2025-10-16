import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId, fileId } = params;

    // Verify the file belongs to a dog owned by this user
    const file = await prisma.dogFile.findFirst({
      where: {
        id: fileId,
        dogId: dogId,
        dog: {
          customer: {
            clerkUserId: userId
          }
        }
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete the file from the database
    await prisma.dogFile.delete({
      where: { id: fileId }
    });

    // Try to delete the physical file (don't fail if it doesn't exist)
    try {
      const filePath = join(process.cwd(), 'public', file.filePath);
      await unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete file API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}