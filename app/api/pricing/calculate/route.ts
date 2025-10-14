import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { checkIn, checkOut, boardingType, services } = await request.json();

    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: 'Check-in and check-out dates required' }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date' }, { status: 400 });
    }

    // Calculate total days
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Get daily rates from environment or use defaults
    const rates = {
      standard: parseFloat(process.env.DAILY_BOARDING_RATE || '50'),
      luxury: parseFloat(process.env.LUXURY_BOARDING_RATE || '75'),
      daycare: parseFloat(process.env.DAILY_BOARDING_RATE || '50') * 0.6, // 60% of boarding rate
    };

    const dailyRate = rates[boardingType as keyof typeof rates] || rates.standard;

    // Calculate service charges
    const serviceRates = {
      grooming: 30,
      training: 25,
      extraWalks: 15,
      medicationAdmin: 10,
    };

    let serviceCharges = 0;
    if (services && Array.isArray(services)) {
      services.forEach((service: string) => {
        if (service in serviceRates) {
          serviceCharges += serviceRates[service as keyof typeof serviceRates];
        }
      });
    }

    const subtotal = totalDays * dailyRate;
    const totalPrice = subtotal + serviceCharges;

    return NextResponse.json({
      totalDays,
      dailyRate,
      subtotal: subtotal.toFixed(2),
      serviceCharges: serviceCharges.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      breakdown: {
        boarding: `${totalDays} days × $${dailyRate} = $${subtotal.toFixed(2)}`,
        services: serviceCharges > 0 ? `Additional services: $${serviceCharges.toFixed(2)}` : null,
      },
    });
  } catch (error) {
    console.error('Error calculating pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}