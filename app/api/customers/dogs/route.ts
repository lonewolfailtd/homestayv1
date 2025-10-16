import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Return the dogs data
    const dogs = customer.dogs.map(dog => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      weight: dog.weight,
      temperament: dog.temperament,
      medicalNeeds: dog.medicalNeeds || '',
      specialInstructions: dog.specialInstructions || ''
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