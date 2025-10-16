import { NextRequest, NextResponse } from 'next/server';
import { initializePeakPeriods, initializePricingTiers } from '@/lib/pricing-engine';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    // Initialize peak periods and pricing tiers
    await Promise.all([
      initializePeakPeriods(),
      initializePricingTiers()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Pricing system initialized successfully',
      data: {
        peakPeriods: 'NZ Public Holidays 2025 loaded',
        pricingTiers: 'Short/Standard/Long stay rates configured'
      }
    });

  } catch (error) {
    console.error('Error initializing pricing system:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize pricing system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET route to check current pricing configuration
export async function GET(_request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db');
    
    const [peakPeriods, pricingTiers] = await Promise.all([
      prisma.peakPeriod.findMany({
        where: { isActive: true },
        orderBy: { startDate: 'asc' }
      }),
      prisma.pricingTier.findMany({
        where: { isActive: true },
        orderBy: { minDays: 'asc' }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        peakPeriods: peakPeriods.map(p => ({
          name: p.name,
          dates: `${p.startDate.toISOString().split('T')[0]} to ${p.endDate.toISOString().split('T')[0]}`,
          surcharge: `${p.surchargePercent}%`,
          minDays: p.minDays || 'No minimum'
        })),
        pricingTiers: pricingTiers.map(t => ({
          name: t.name,
          range: `${t.minDays}-${t.maxDays || '∞'} days`,
          rate: `$${t.dailyRate}/day`,
          description: t.description
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching pricing configuration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch pricing configuration' 
      },
      { status: 500 }
    );
  }
}