import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists, create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'temp@example.com',
          firstName: null,
          lastName: null,
          phone: null,
        }
      });
    }

    // Get or create customer record
    let customer = await prisma.customer.findFirst({
      where: { clerkUserId: userId }
    });

    if (!customer) {
      // For direct dog creation, we need basic customer info
      // This will be updated when they complete their first booking
      customer = await prisma.customer.create({
        data: {
          clerkUserId: userId,
          email: user.email,
          firstName: user.firstName || 'Customer',
          lastName: user.lastName || '',
          phone: user.phone || '',
          address: '',
          city: '',
          postalCode: '',
          emergencyName: '',
          emergencyPhone: '',
          emergencyRelation: ''
        }
      });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.age || !body.breed || !body.sex) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, age, breed, and sex are required' 
      }, { status: 400 });
    }

    // Create the dog record
    const dog = await prisma.dog.create({
      data: {
        customerId: customer.id,
        name: body.name,
        age: parseInt(body.age),
        sex: body.sex,
        breed: body.breed,
        vaccinated: body.vaccinated || 'yes',
        neutered: body.neutered || 'yes',
        vetClinic: body.vetClinic || null,
        vetPhone: body.vetPhone || null,
        medications: body.medications || null,
        medicalConditions: body.medicalConditions || null,
        crateTrained: body.crateTrained || 'yes',
        socialLevel: body.socialLevel || 'social',
        peopleBehavior: body.peopleBehavior || 'friendly',
        behavioralIssues: body.behavioralIssues || '',
        farmAnimalReactive: body.farmAnimalReactive || 'no',
        biteHistory: body.biteHistory || 'no',
        additionalNotes: body.additionalNotes || null,
      }
    });

    return NextResponse.json({
      success: true,
      dog: {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        sex: dog.sex
      }
    });

  } catch (error) {
    console.error('Error creating dog:', error);
    return NextResponse.json(
      { error: 'Failed to create dog profile' },
      { status: 500 }
    );
  }
}