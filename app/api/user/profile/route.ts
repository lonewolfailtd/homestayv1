import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse preferences JSON
    const preferences = user.preferences as any || {};

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        preferences: {
          notifications: preferences.notifications || {
            email: true,
            sms: true,
            bookingReminders: true,
            paymentReminders: true,
          },
          emergencyContact: preferences.emergencyContact || {
            name: '',
            phone: '',
            relation: '',
          },
          specialRequests: preferences.specialRequests || '',
          communicationPreference: preferences.communicationPreference || 'email',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, preferences } = body;

    // Validate required fields
    if (!firstName) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate preferences structure
    if (preferences) {
      const validPreferences = {
        notifications: preferences.notifications || {},
        emergencyContact: preferences.emergencyContact || {},
        specialRequests: preferences.specialRequests || '',
        communicationPreference: preferences.communicationPreference || 'email',
      };

      // Validate communication preference
      if (validPreferences.communicationPreference && 
          !['email', 'sms', 'phone'].includes(validPreferences.communicationPreference)) {
        return NextResponse.json(
          { error: 'Invalid communication preference' },
          { status: 400 }
        );
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          firstName,
          lastName,
          phone,
          preferences: validPreferences,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          preferences: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          ...updatedUser,
          preferences: validPreferences,
        },
      });
    }

    // Update basic profile without preferences
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        preferences: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}