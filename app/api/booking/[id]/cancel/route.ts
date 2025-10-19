import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import {
  canCancelBooking,
  calculateRefund,
} from '@/lib/booking-modifications';

export const dynamic = 'force-dynamic';

/**
 * GET /api/booking/[id]/cancel
 * Get cancellation information and refund calculation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get booking with customer details
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        dog: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.customer.email !== user.email) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this booking' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    const eligibility = canCancelBooking(booking);

    // Calculate refund
    const { refundAmount, breakdown } = calculateRefund(booking);

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        dogName: booking.dog.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalDays: booking.totalDays,
        totalPrice: booking.totalPrice.toString(),
        depositAmount: booking.depositAmount.toString(),
        balanceAmount: booking.balanceAmount.toString(),
        depositPaid: booking.depositPaid,
        balancePaid: booking.balancePaid,
        status: booking.status,
        isCancelled: booking.isCancelled,
      },
      eligibility,
      refund: {
        amount: refundAmount,
        breakdown,
      },
    });
  } catch (error) {
    console.error('Error getting cancellation info:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/booking/[id]/cancel
 * Process booking cancellation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reason, confirmed } = body;

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Cancellation must be confirmed' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        dog: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (booking.customer.email !== user.email) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this booking' },
        { status: 403 }
      );
    }

    // Check eligibility
    const eligibility = canCancelBooking(booking);
    if (!eligibility.allowed) {
      return NextResponse.json(
        { error: eligibility.reason || 'Cancellation not allowed' },
        { status: 400 }
      );
    }

    // Calculate refund
    const { refundAmount, breakdown } = calculateRefund(booking);

    // Create cancellation modification record
    const modification = await prisma.bookingModification.create({
      data: {
        bookingId: booking.id,
        modifiedBy: user.id,
        modificationType: 'cancellation',
        originalCheckIn: booking.checkIn,
        originalCheckOut: booking.checkOut,
        originalPrice: booking.totalPrice,
        refundAmount: refundAmount,
        refundReason: reason || 'Customer requested cancellation',
        cancellationFee: breakdown.depositFee,
        status: 'completed',
        processedAt: new Date(),
      },
    });

    // Update booking as cancelled
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        isCancelled: true,
        cancellationDate: new Date(),
        cancellationReason: reason || 'Customer requested cancellation',
        refundAmount: refundAmount,
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });

    // TODO: Create Xero credit note for refund
    // TODO: Process refund to original payment method
    // TODO: Send cancellation confirmation email
    // TODO: Remove calendar event

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      cancellation: {
        id: modification.id,
        bookingId: booking.id,
        refundAmount: refundAmount,
        refundBreakdown: breakdown,
        timeline: breakdown.timeline,
      },
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
