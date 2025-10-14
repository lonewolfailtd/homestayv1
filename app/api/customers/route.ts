import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        dogs: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        dogs: customer.dogs,
      },
    });
  } catch (error) {
    console.error('Error checking customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}