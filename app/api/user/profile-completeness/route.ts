import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkProfileCompleteness } from '@/lib/profileCompletion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const status = await checkProfileCompleteness(clerkUserId);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking profile completeness:', error);
    return NextResponse.json(
      { error: 'Failed to check profile completeness' },
      { status: 500 }
    );
  }
}
