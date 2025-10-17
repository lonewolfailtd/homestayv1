import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const rebookSchema = z.object({
  dogId: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  services: z.record(z.string(), z.number()),
  specialRequests: z.string().optional(),
  totalPrice: z.number()
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = rebookSchema.parse(body);

    const checkIn = new Date(validatedData.checkInDate);
    const checkOut = new Date(validatedData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }

    // Check if user exists first
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's customer record
    const customer = await prisma.customer.findFirst({
      where: { clerkUserId: userId },
      include: { dogs: true }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found - please complete a booking first' }, { status: 404 });
    }

    // Verify the dog belongs to this customer
    const dog = customer.dogs.find(d => d.id === validatedData.dogId);
    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        dogId: validatedData.dogId,
        checkIn: checkIn,
        checkOut: checkOut,
        totalDays: nights,
        totalPrice: validatedData.totalPrice,
        dailyRate: 80, // Default rate
        serviceCharges: 0,
        boardingType: 'standard',
        services: Object.keys(validatedData.services).filter(serviceId => validatedData.services[serviceId] > 0),
        status: 'confirmed'
      },
      include: {
        customer: true,
        dog: true
      }
    });

    // TODO: Integrate with Xero for invoice creation
    // TODO: Send confirmation email
    // TODO: Update GoHighLevel contact

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Rebook API error:', error);
    
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

function _getServicePrice(serviceId: string): number {
  const servicePrices: { [key: string]: number } = {
    'grooming': 85,
    'training': 120,
    'walks': 45,
    'meals': 25
  };
  
  return servicePrices[serviceId] || 0;
}