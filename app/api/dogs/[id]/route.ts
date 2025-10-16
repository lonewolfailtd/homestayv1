import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateDogSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0).max(25),
  sex: z.string().min(1),
  breed: z.string().min(1),
  vaccinated: z.string().min(1),
  neutered: z.string().min(1),
  vetClinic: z.string().optional(),
  vetPhone: z.string().optional(),
  medications: z.string().optional(),
  medicalConditions: z.string().optional(),
  crateTrained: z.string().optional(),
  socialLevel: z.string().optional(),
  peopleBehavior: z.string().optional(),
  behavioralIssues: z.string().optional(),
  farmAnimalReactive: z.string().optional(),
  biteHistory: z.string().optional(),
  additionalNotes: z.string().optional(),
  files: z.array(z.object({
    id: z.string(),
    originalName: z.string(),
    fileName: z.string(),
    filePath: z.string(),
    fileType: z.string(),
    fileSize: z.number()
  })).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dogId = params.id;

    // Get the dog data with customer verification
    const dog = await prisma.dog.findFirst({
      where: {
        id: dogId,
        customer: {
          clerkUserId: userId
        }
      },
      include: {
        files: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    return NextResponse.json(dog);

  } catch (error) {
    console.error('Get dog API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dogId = params.id;
    const body = await request.json();
    const validatedData = updateDogSchema.parse(body);

    // Verify the dog belongs to this user
    const existingDog = await prisma.dog.findFirst({
      where: {
        id: dogId,
        customer: {
          clerkUserId: userId
        }
      }
    });

    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Update the dog data
    const updatedDog = await prisma.dog.update({
      where: { id: dogId },
      data: {
        name: validatedData.name,
        age: validatedData.age,
        sex: validatedData.sex,
        breed: validatedData.breed,
        vaccinated: validatedData.vaccinated,
        neutered: validatedData.neutered,
        vetClinic: validatedData.vetClinic || '',
        vetPhone: validatedData.vetPhone || '',
        medications: validatedData.medications || '',
        medicalConditions: validatedData.medicalConditions || '',
        crateTrained: validatedData.crateTrained || '',
        socialLevel: validatedData.socialLevel || '',
        peopleBehavior: validatedData.peopleBehavior || '',
        behavioralIssues: validatedData.behavioralIssues || '',
        farmAnimalReactive: validatedData.farmAnimalReactive || '',
        biteHistory: validatedData.biteHistory || '',
        additionalNotes: validatedData.additionalNotes || ''
      }
    });

    // Add new files if provided
    if (validatedData.files && validatedData.files.length > 0) {
      const fileRecords = validatedData.files.map(file => ({
        dogId: dogId,
        fileName: file.originalName,
        storedFileName: file.fileName,
        filePath: file.filePath,
        fileType: file.fileType,
        fileSize: file.fileSize,
        fileCategory: 'other',
        uploadedBy: userId
      }));

      await prisma.dogFile.createMany({
        data: fileRecords
      });
    }

    return NextResponse.json({
      success: true,
      dog: updatedDog
    });

  } catch (error) {
    console.error('Update dog API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}