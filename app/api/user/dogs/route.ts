import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch saved dogs for the user
    const savedDogs = await prisma.savedDog.findMany({
      where: { userId: user.id },
      include: {
        dog: {
          include: {
            bookings: {
              select: {
                id: true,
                checkIn: true,
                checkOut: true,
                status: true
              },
              orderBy: { checkIn: 'desc' },
              take: 3 // Last 3 bookings for this dog
            }
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' }, // Default dogs first
        { createdAt: 'desc' }
      ]
    });

    // Format response
    const formattedDogs = savedDogs.map(savedDog => ({
      id: savedDog.id,
      isDefault: savedDog.isDefault,
      nickname: savedDog.nickname,
      notes: savedDog.notes,
      dog: {
        id: savedDog.dog.id,
        name: savedDog.dog.name,
        age: savedDog.dog.age,
        sex: savedDog.dog.sex,
        breed: savedDog.dog.breed,
        vaccinated: savedDog.dog.vaccinated,
        neutered: savedDog.dog.neutered,
        socialLevel: savedDog.dog.socialLevel,
        recentBookings: savedDog.dog.bookings
      }
    }));

    return NextResponse.json({ dogs: formattedDogs });

  } catch (error) {
    console.error('Error fetching user dogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { dogId, nickname, notes, isDefault } = await request.json();

    if (!dogId) {
      return NextResponse.json({ error: 'Dog ID is required' }, { status: 400 });
    }

    // Check if dog exists and user has access (through customer relationship)
    const dog = await prisma.dog.findFirst({
      where: {
        id: dogId,
        customer: {
          clerkUserId: user.clerkId
        }
      }
    });

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found or access denied' }, { status: 404 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.savedDog.updateMany({
        where: { 
          userId: user.id,
          isDefault: true 
        },
        data: { isDefault: false }
      });
    }

    // Create or update saved dog
    const savedDog = await prisma.savedDog.upsert({
      where: {
        userId_dogId: {
          userId: user.id,
          dogId: dogId
        }
      },
      update: {
        nickname,
        notes,
        isDefault: isDefault || false
      },
      create: {
        userId: user.id,
        dogId: dogId,
        nickname,
        notes,
        isDefault: isDefault || false
      },
      include: {
        dog: true
      }
    });

    return NextResponse.json({ savedDog });

  } catch (error) {
    console.error('Error saving dog:', error);
    return NextResponse.json(
      { error: 'Failed to save dog' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const savedDogId = searchParams.get('id');

    if (!savedDogId) {
      return NextResponse.json({ error: 'Saved dog ID is required' }, { status: 400 });
    }

    // Delete saved dog
    await prisma.savedDog.delete({
      where: {
        id: savedDogId,
        userId: user.id // Ensure user owns this saved dog
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting saved dog:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved dog' },
      { status: 500 }
    );
  }
}