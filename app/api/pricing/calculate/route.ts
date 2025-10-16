import { NextRequest, NextResponse } from 'next/server';
import { calculateAdvancedPricing } from '@/lib/pricing-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const { checkIn, checkOut } = formData;

    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: 'Check-in and check-out dates required' }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date' }, { status: 400 });
    }

    // Use advanced pricing engine
    const pricingResult = await calculateAdvancedPricing({
      checkInDate,
      checkOutDate,
      isEntireDog: formData.isEntireDog || false,
      selectedServices: formData.selectedServices || [],
      numberOfMeals: formData.numberOfMeals || 0,
      numberOfWalks: formData.numberOfWalks || 0,
    });

    return NextResponse.json({
      success: true,
      ...pricingResult,
      warnings: pricingResult.warnings // Peak period alerts, minimum stays
    });
  } catch (error) {
    console.error('Error calculating pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}