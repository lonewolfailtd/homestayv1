import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: userId, // Ensure user can only access their own bookings
      },
      include: {
        modifications: {
          orderBy: {
            requestedDate: 'desc',
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Parse customer and dog data
    const customer = JSON.parse(booking.customerData || '{}');
    const dog = JSON.parse(booking.dogData || '{}');
    const services = JSON.parse(booking.services || '[]');

    // Format the response
    const response = {
      id: booking.id,
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      totalDays: booking.totalDays,
      totalPrice: booking.totalPrice,
      status: booking.status,
      customer: {
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address,
        emergencyContact: customer.emergencyContact,
        emergencyPhone: customer.emergencyPhone,
      },
      dog: {
        name: dog.name || '',
        breed: dog.breed || '',
        age: dog.age || 0,
        sex: dog.sex || '',
        weight: dog.weight || 0,
        specialNeeds: dog.specialNeeds,
        dietaryRequirements: dog.dietaryRequirements,
        behaviorNotes: dog.behaviorNotes,
      },
      isPeakPeriod: booking.isPeakPeriod,
      peakPeriodName: booking.peakPeriodName,
      services: services,
      depositPaid: booking.depositPaid,
      balancePaid: booking.balancePaid,
      depositAmount: booking.depositAmount,
      balanceAmount: booking.balanceAmount,
      balanceDueDate: booking.balanceDueDate?.toISOString(),
      paymentMethod: booking.paymentMethod,
      depositInvoiceId: booking.depositInvoiceId,
      balanceInvoiceId: booking.balanceInvoiceId,
      createdAt: booking.createdAt.toISOString(),
      modifications: booking.modifications.map(mod => ({
        id: mod.id,
        type: mod.type,
        status: mod.status,
        requestedDate: mod.requestedDate.toISOString(),
        processedDate: mod.processedDate?.toISOString(),
        reason: mod.reason,
        newCheckIn: mod.newCheckIn?.toISOString(),
        newCheckOut: mod.newCheckOut?.toISOString(),
        cancellationFee: mod.cancellationFee,
        refundAmount: mod.refundAmount,
      })),
      isCancelled: booking.isCancelled,
      cancellationDate: booking.cancellationDate?.toISOString(),
      cancellationReason: booking.cancellationReason,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}
