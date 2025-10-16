import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, upcoming, past, active
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter conditions
    const now = new Date();
    let whereCondition: any = {
      userId: user.id
    };

    switch (filter) {
      case 'upcoming':
        whereCondition.checkIn = { gte: now };
        break;
      case 'past':
        whereCondition.checkOut = { lt: now };
        break;
      case 'active':
        whereCondition.AND = [
          { checkIn: { lte: now } },
          { checkOut: { gte: now } }
        ];
        break;
      // 'all' includes everything - no additional filter
    }

    // Fetch bookings with related data
    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        dog: {
          select: {
            name: true,
            breed: true,
            age: true,
            sex: true
          }
        }
      },
      orderBy: { checkIn: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.booking.count({
      where: whereCondition
    });

    // Format response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalDays: booking.totalDays,
      totalPrice: booking.totalPrice,
      status: booking.status,
      dog: booking.dog,
      customer: booking.customer,
      isPeakPeriod: booking.isPeakPeriod,
      peakPeriodName: booking.peakPeriodName,
      services: booking.services,
      selectedServices: booking.selectedServices,
      specialNotes: booking.specialNotes,
      depositPaid: booking.depositPaid,
      balancePaid: booking.balancePaid,
      balanceDueDate: booking.balanceDueDate,
      createdAt: booking.createdAt
    }));

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}