import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = auth();
    
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

    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    // Get dashboard statistics
    const [
      totalBookings,
      upcomingBookings,
      activeBookings,
      thisYearBookings,
      totalSpent,
      savedDogs,
      recentActivity
    ] = await Promise.all([
      // Total bookings count
      prisma.booking.count({
        where: { userId: user.id }
      }),
      
      // Upcoming bookings
      prisma.booking.findMany({
        where: {
          userId: user.id,
          checkIn: { gte: now }
        },
        include: {
          dog: {
            select: { name: true, breed: true }
          }
        },
        orderBy: { checkIn: 'asc' },
        take: 3
      }),
      
      // Active bookings (currently happening)
      prisma.booking.findMany({
        where: {
          userId: user.id,
          AND: [
            { checkIn: { lte: now } },
            { checkOut: { gte: now } }
          ]
        },
        include: {
          dog: {
            select: { name: true, breed: true }
          }
        }
      }),
      
      // This year's bookings count
      prisma.booking.count({
        where: {
          userId: user.id,
          checkIn: { gte: startOfYear }
        }
      }),
      
      // Total amount spent (sum of paid bookings)
      prisma.booking.aggregate({
        where: { 
          userId: user.id,
          OR: [
            { depositPaid: true },
            { balancePaid: true }
          ]
        },
        _sum: { totalPrice: true }
      }),
      
      // Saved dogs count
      prisma.savedDog.count({
        where: { userId: user.id }
      }),
      
      // Recent activity (last 5 bookings)
      prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          dog: {
            select: { name: true, breed: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate average stay duration
    const allBookings = await prisma.booking.findMany({
      where: { userId: user.id },
      select: { totalDays: true }
    });
    
    const avgStayDuration = allBookings.length > 0
      ? Math.round(allBookings.reduce((sum, b) => sum + b.totalDays, 0) / allBookings.length)
      : 0;

    // Format upcoming bookings
    const formattedUpcoming = upcomingBookings.map(booking => ({
      id: booking.id,
      dogName: booking.dog.name,
      dogBreed: booking.dog.breed,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalDays: booking.totalDays,
      totalPrice: booking.totalPrice,
      status: booking.status
    }));

    // Format active bookings
    const formattedActive = activeBookings.map(booking => ({
      id: booking.id,
      dogName: booking.dog.name,
      dogBreed: booking.dog.breed,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalDays: booking.totalDays,
      daysRemaining: Math.ceil((booking.checkOut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Format recent activity
    const formattedActivity = recentActivity.map(booking => ({
      id: booking.id,
      type: 'booking',
      dogName: booking.dog.name,
      checkIn: booking.checkIn,
      status: booking.status,
      createdAt: booking.createdAt
    }));

    // Calculate next payment due
    const nextPaymentDue = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        balanceDueDate: { gte: now },
        balancePaid: false
      },
      orderBy: { balanceDueDate: 'asc' },
      select: {
        id: true,
        balanceAmount: true,
        balanceDueDate: true,
        dog: { select: { name: true } }
      }
    });

    return NextResponse.json({
      stats: {
        totalBookings,
        thisYearBookings,
        totalSpent: totalSpent._sum.totalPrice || 0,
        savedDogs,
        avgStayDuration
      },
      upcomingBookings: formattedUpcoming,
      activeBookings: formattedActive,
      recentActivity: formattedActivity,
      nextPaymentDue: nextPaymentDue ? {
        bookingId: nextPaymentDue.id,
        dogName: nextPaymentDue.dog.name,
        amount: nextPaymentDue.balanceAmount,
        dueDate: nextPaymentDue.balanceDueDate
      } : null
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}