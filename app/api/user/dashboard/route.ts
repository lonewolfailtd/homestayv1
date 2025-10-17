import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Clerk user to access email
    const { currentUser } = await import('@clerk/nextjs/server');
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;

    // Get user from database first, create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!user) {
      // Create user record if it doesn't exist (webhook might have failed)
      try {
        user = await prisma.user.create({
          data: {
            clerkId: clerkUserId,
            email: 'temp@example.com', // Will be updated when user completes profile
            firstName: null,
            lastName: null,
            phone: null,
          }
        });
        console.log('Created missing user record for:', clerkUserId);
      } catch (error) {
        console.error('Error creating user record:', error);
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }
    }

    // Get customer record by email from Clerk user or clerkUserId
    const customer = await prisma.customer.findFirst({
      where: { 
        OR: [
          { clerkUserId: clerkUserId },
          { email: userEmail }
        ]
      }
    });

    // If no customer exists, return empty dashboard data
    if (!customer) {
      return NextResponse.json({
        stats: {
          totalBookings: 0,
          thisYearBookings: 0,
          totalSpent: 0,
          savedDogs: 0,
          avgStayDuration: 0
        },
        upcomingBookings: [],
        activeBookings: [],
        recentActivity: [],
        nextPaymentDue: null
      });
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
        where: { customerId: customer.id }
      }),
      
      // Upcoming bookings
      prisma.booking.findMany({
        where: {
          customerId: customer.id,
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
          customerId: customer.id,
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
          customerId: customer.id,
          checkIn: { gte: startOfYear }
        }
      }),
      
      // Total amount spent (sum of paid bookings)
      prisma.booking.aggregate({
        where: { 
          customerId: customer.id,
          OR: [
            { depositPaid: true },
            { balancePaid: true }
          ]
        },
        _sum: { totalPrice: true }
      }),
      
      // Saved dogs count (use customer's dogs)
      prisma.dog.count({
        where: { customerId: customer.id }
      }),
      
      // Recent activity (last 5 bookings)
      prisma.booking.findMany({
        where: { customerId: customer.id },
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
      where: { customerId: customer.id },
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
        customerId: customer.id,
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