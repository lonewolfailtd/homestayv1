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

    // Check if user exists first, create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      // Create user record if it doesn't exist (webhook might have failed)
      try {
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: 'temp@example.com', // Will be updated when user completes profile
            firstName: null,
            lastName: null,
            phone: null,
          }
        });
        console.log('Created missing user record for:', userId);
      } catch (error) {
        console.error('Error creating user record:', error);
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }
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