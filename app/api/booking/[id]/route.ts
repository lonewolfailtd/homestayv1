import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

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
        customer: {
          clerkUserId: userId, // Ensure user can only access their own bookings
        },
      },
      include: {
        customer: true,
        dog: true,
        modifications: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get services from the booking
    const services = typeof booking.selectedServices === 'string'
      ? JSON.parse(booking.selectedServices)
      : booking.selectedServices || [];

    // Format the response
    const response = {
      id: booking.id,
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      totalDays: booking.totalDays,
      totalPrice: booking.totalPrice,
      status: booking.status,
      customer: {
        firstName: booking.customer.firstName || '',
        lastName: booking.customer.lastName || '',
        email: booking.customer.email || '',
        phone: booking.customer.phone || '',
        address: booking.customer.address || '',
        emergencyName: booking.customer.emergencyName || '',
        emergencyPhone: booking.customer.emergencyPhone || '',
      },
      dog: {
        name: booking.dog.name || '',
        breed: booking.dog.breed || '',
        age: booking.dog.age || 0,
        sex: booking.dog.sex || '',
        vaccinated: booking.dog.vaccinated || '',
        neutered: booking.dog.neutered || '',
        socialLevel: booking.dog.socialLevel || '',
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
