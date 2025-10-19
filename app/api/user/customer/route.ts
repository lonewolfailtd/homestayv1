import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/customer
 * Fetches the authenticated user's customer record with all details
 * Used for auto-populating booking forms
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find customer record for this user
    const customer = await prisma.customer.findFirst({
      where: { clerkUserId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        emergencyName: true,
        emergencyPhone: true,
        emergencyRelation: true,
      },
    });

    if (!customer) {
      return NextResponse.json({
        exists: false,
        message: 'No customer record found'
      });
    }

    return NextResponse.json({
      exists: true,
      customer,
    });

  } catch (error) {
    console.error('Error fetching customer record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer record' },
      { status: 500 }
    );
  }
}
