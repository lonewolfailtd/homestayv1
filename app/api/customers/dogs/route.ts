import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists first
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's customer record and their dogs
    const customer = await prisma.customer.findFirst({
      where: { clerkUserId: userId },
      include: {
        dogs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // If no customer exists, return empty array (no dogs yet)
    if (!customer) {
      return NextResponse.json([]);
    }

    // Return the dogs data
    const dogs = customer.dogs.map(dog => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      sex: dog.sex,
      vaccinated: dog.vaccinated,
      neutered: dog.neutered,
      socialLevel: dog.socialLevel,
      medicalConditions: dog.medicalConditions || '',
      additionalNotes: dog.additionalNotes || ''
    }));

    return NextResponse.json(dogs);

  } catch (error) {
    console.error('Dogs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}