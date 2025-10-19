import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import {
  canModifyDates,
  recalculateBookingPrice,
  validateNewDates,
} from '@/lib/booking-modifications';

export const dynamic = 'force-dynamic';

/**
 * GET /api/booking/[id]/modify
 * Check if booking can be modified and get eligibility status
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

    // Verify user owns this booking (via email match)
    if (booking.customer.email !== user.email) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this booking' },
        { status: 403 }
      );
    }

    // Check eligibility
    const eligibility = canModifyDates(booking);

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalDays: booking.totalDays,
        totalPrice: booking.totalPrice.toString(),
        status: booking.status,
        isCancelled: booking.isCancelled,
      },
      eligibility,
    });
  } catch (error) {
    console.error('Error checking modification eligibility:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/booking/[id]/modify
 * Calculate price for proposed date modification
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
    const { newCheckIn, newCheckOut, action } = body;

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
        { error: 'You do not have permission to modify this booking' },
        { status: 403 }
      );
    }

    // If action is 'confirm', process the modification
    if (action === 'confirm') {
      // Check eligibility one more time
      const eligibility = canModifyDates(booking);
      if (!eligibility.allowed) {
        return NextResponse.json(
          { error: eligibility.reason || 'Modification not allowed' },
          { status: 400 }
        );
      }

      const checkInDate = new Date(newCheckIn);
      const checkOutDate = new Date(newCheckOut);

      // Validate new dates
      const dateValidation = validateNewDates(checkInDate, checkOutDate);
      if (!dateValidation.valid) {
        return NextResponse.json(
          { error: dateValidation.error },
          { status: 400 }
        );
      }

      // Recalculate pricing
      const priceComparison = await recalculateBookingPrice(
        booking,
        checkInDate,
        checkOutDate
      );

      // Create modification record
      const modification = await prisma.bookingModification.create({
        data: {
          bookingId: booking.id,
          modifiedBy: user.id,
          modificationType: 'date_change',
          originalCheckIn: booking.checkIn,
          originalCheckOut: booking.checkOut,
          originalPrice: booking.totalPrice,
          newCheckIn: checkInDate,
          newCheckOut: checkOutDate,
          newPrice: priceComparison.newPrice,
          priceDifference: priceComparison.difference,
          adjustmentReason: 'Customer requested date change',
          status: 'completed',
          processedAt: new Date(),
        },
      });

      // Update booking
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalDays: priceComparison.newPricing.totalDays,
          baseDailyRate: priceComparison.newPricing.baseDailyRate,
          peakSurcharge: priceComparison.newPricing.peakSurcharge,
          dogSurcharges: priceComparison.newPricing.dogSurcharges,
          serviceCharges: priceComparison.newPricing.serviceCharges,
          totalPrice: priceComparison.newPrice,
          isPeakPeriod: priceComparison.newPricing.isPeakPeriod,
          peakPeriodName: priceComparison.newPricing.peakPeriodName || null,
          updatedAt: new Date(),
        },
      });

      // TODO: Create Xero adjustment invoice if price increased
      // TODO: Create Xero credit note if price decreased
      // TODO: Send modification confirmation email
      // TODO: Update calendar event

      return NextResponse.json({
        success: true,
        message: 'Booking dates updated successfully',
        modification: {
          id: modification.id,
          oldCheckIn: modification.originalCheckIn,
          oldCheckOut: modification.originalCheckOut,
          newCheckIn: modification.newCheckIn,
          newCheckOut: modification.newCheckOut,
          priceDifference: modification.priceDifference.toString(),
        },
        priceComparison,
      });
    }

    // Default action: calculate proposed modification
    const checkInDate = new Date(newCheckIn);
    const checkOutDate = new Date(newCheckOut);

    // Validate new dates
    const dateValidation = validateNewDates(checkInDate, checkOutDate);
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      );
    }

    // Check eligibility
    const eligibility = canModifyDates(booking);
    if (!eligibility.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: eligibility.reason,
          eligibility,
        },
        { status: 400 }
      );
    }

    // Recalculate pricing
    const priceComparison = await recalculateBookingPrice(
      booking,
      checkInDate,
      checkOutDate
    );

    return NextResponse.json({
      success: true,
      priceComparison,
      eligibility,
      message: 'Price calculated successfully. Confirm to apply changes.',
    });
  } catch (error) {
    console.error('Error modifying booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
