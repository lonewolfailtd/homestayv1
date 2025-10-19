/**
 * Booking Modification Business Logic
 * Handles eligibility checks, refund calculations, and price recalculations
 */

import { Booking } from '@prisma/client';
import { calculateAdvancedPricing } from './pricing-engine';

export interface ModificationEligibility {
  allowed: boolean;
  reason?: string;
  daysUntilCheckIn?: number;
}

export interface RefundBreakdown {
  totalPaid: number;
  depositFee: number;
  eligibleForRefund: number;
  refundAmount: number;
  timeline: string;
}

export interface PriceComparison {
  oldPrice: number;
  newPrice: number;
  difference: number;
  oldPricing: {
    checkIn: Date;
    checkOut: Date;
    totalDays: number;
    isPeakPeriod: boolean;
    peakPeriodName?: string | null;
  };
  newPricing: {
    totalDays: number;
    baseDailyRate: number;
    baseSubtotal: number;
    peakSurcharge: number;
    dogSurcharges: number;
    serviceCharges: number;
    totalPrice: number;
    isPeakPeriod: boolean;
    peakPeriodName?: string;
  };
}

/**
 * Check if booking dates can be modified
 */
export function canModifyDates(booking: Booking): ModificationEligibility {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.floor(
    (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Already cancelled
  if (booking.isCancelled) {
    return {
      allowed: false,
      reason: 'Booking has been cancelled',
      daysUntilCheckIn,
    };
  }

  // Check-in has passed
  if (daysUntilCheckIn < 0) {
    return {
      allowed: false,
      reason: 'Check-in date has already passed',
      daysUntilCheckIn: 0,
    };
  }

  // Within 7-day modification window
  if (daysUntilCheckIn < 7) {
    return {
      allowed: false,
      reason: 'Modifications not allowed within 7 days of check-in. Please contact us directly.',
      daysUntilCheckIn,
    };
  }

  // Balance payment due soon
  if (booking.balanceDueDate) {
    const balanceDueDate = new Date(booking.balanceDueDate);
    const daysUntilBalanceDue = Math.floor(
      (balanceDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (!booking.balancePaid && daysUntilBalanceDue <= 0) {
      return {
        allowed: false,
        reason: 'Balance payment is overdue. Please complete payment before modifying.',
        daysUntilCheckIn,
      };
    }
  }

  return {
    allowed: true,
    daysUntilCheckIn,
  };
}

/**
 * Check if booking can be cancelled
 */
export function canCancelBooking(booking: Booking): ModificationEligibility {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.floor(
    (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Already cancelled
  if (booking.isCancelled) {
    return {
      allowed: false,
      reason: 'Booking has already been cancelled',
      daysUntilCheckIn,
    };
  }

  // Check-in has passed
  if (daysUntilCheckIn < 0) {
    return {
      allowed: false,
      reason: 'Check-in date has passed. Please contact us for assistance.',
      daysUntilCheckIn: 0,
    };
  }

  return {
    allowed: true,
    daysUntilCheckIn,
  };
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefund(booking: Booking): {
  refundAmount: number;
  breakdown: RefundBreakdown;
} {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.floor(
    (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalPrice = parseFloat(booking.totalPrice.toString());
  const depositAmount = parseFloat(booking.depositAmount.toString());
  const balanceAmount = parseFloat(booking.balanceAmount.toString());

  let totalPaid = 0;
  if (booking.depositPaid) {
    totalPaid += depositAmount;
  }
  if (booking.balancePaid) {
    totalPaid += balanceAmount;
  }

  let refundAmount = 0;
  let timeline = '';

  const breakdown: RefundBreakdown = {
    totalPaid,
    depositFee: depositAmount, // Deposit is always non-refundable
    eligibleForRefund: 0,
    refundAmount: 0,
    timeline: '',
  };

  if (daysUntilCheckIn >= 7) {
    // 7+ days: Refund eligible minus deposit
    timeline = 'Cancelled 7+ days before check-in';

    if (booking.balancePaid) {
      // If balance was paid, refund it
      breakdown.eligibleForRefund = balanceAmount;
      refundAmount = balanceAmount;
    } else if (booking.depositPaid) {
      // Only deposit paid, no refund (deposit is non-refundable)
      breakdown.eligibleForRefund = 0;
      refundAmount = 0;
    }
  } else {
    // Less than 7 days: No refund
    timeline = 'Cancelled less than 7 days before check-in';
    breakdown.eligibleForRefund = 0;
    refundAmount = 0;
  }

  breakdown.refundAmount = refundAmount;
  breakdown.timeline = timeline;

  return { refundAmount, breakdown };
}

/**
 * Recalculate booking price with new dates
 */
export async function recalculateBookingPrice(
  booking: Booking,
  newCheckIn: Date,
  newCheckOut: Date
): Promise<PriceComparison> {
  // Parse selected services from booking
  let selectedServices: string[] = [];
  let numberOfMeals = 0;
  let numberOfWalks = 0;

  try {
    if (booking.selectedServices) {
      const servicesData = JSON.parse(booking.selectedServices as string);
      if (Array.isArray(servicesData)) {
        selectedServices = servicesData.map((s: any) => s.name || s);
      } else if (typeof servicesData === 'object') {
        // Extract service names and quantities
        selectedServices = Object.keys(servicesData).filter(
          (key) => servicesData[key] > 0
        );
        numberOfMeals = servicesData.RAW_MEAL || 0;
        numberOfWalks = servicesData.PACK_WALK || 0;
      }
    }
  } catch (error) {
    console.error('Error parsing selected services:', error);
  }

  // Determine if dog is entire (has surcharge)
  const isEntireDog = parseFloat(booking.dogSurcharges.toString()) > 0;

  // Calculate new pricing
  const newPricing = await calculateAdvancedPricing({
    checkInDate: newCheckIn,
    checkOutDate: newCheckOut,
    isEntireDog,
    selectedServices,
    numberOfMeals,
    numberOfWalks,
  });

  const oldPrice = parseFloat(booking.totalPrice.toString());
  const newPrice = newPricing.totalPrice;
  const difference = newPrice - oldPrice;

  return {
    oldPrice,
    newPrice,
    difference,
    oldPricing: {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalDays: booking.totalDays,
      isPeakPeriod: booking.isPeakPeriod,
      peakPeriodName: booking.peakPeriodName,
    },
    newPricing,
  };
}

/**
 * Check if services can be modified
 */
export function canModifyServices(booking: Booking): ModificationEligibility {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.floor(
    (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Already cancelled
  if (booking.isCancelled) {
    return {
      allowed: false,
      reason: 'Booking has been cancelled',
      daysUntilCheckIn,
    };
  }

  // Check-in has passed
  if (daysUntilCheckIn < 0) {
    return {
      allowed: false,
      reason: 'Check-in date has already passed',
      daysUntilCheckIn: 0,
    };
  }

  // Within 3-day modification window for services
  if (daysUntilCheckIn < 3) {
    return {
      allowed: false,
      reason: 'Service modifications not allowed within 3 days of check-in',
      daysUntilCheckIn,
    };
  }

  return {
    allowed: true,
    daysUntilCheckIn,
  };
}

/**
 * Validate new booking dates
 */
export function validateNewDates(
  newCheckIn: Date,
  newCheckOut: Date
): { valid: boolean; error?: string } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Check-in must be in the future
  if (newCheckIn < now) {
    return { valid: false, error: 'Check-in date must be in the future' };
  }

  // Check-out must be after check-in
  if (newCheckOut <= newCheckIn) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }

  // Calculate stay duration
  const totalDays = Math.ceil(
    (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  // Maximum stay length (1 year)
  if (totalDays > 365) {
    return { valid: false, error: 'Maximum booking length is 365 days' };
  }

  // Minimum stay length (1 day)
  if (totalDays < 1) {
    return { valid: false, error: 'Minimum booking length is 1 day' };
  }

  return { valid: true };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format date for display (NZ format)
 */
export function formatDateNZ(date: Date): string {
  return date.toLocaleDateString('en-NZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get modification timeline message
 */
export function getModificationTimeline(daysUntilCheckIn: number): {
  canModify: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
} {
  if (daysUntilCheckIn < 0) {
    return {
      canModify: false,
      message: 'Check-in date has passed',
      severity: 'error',
    };
  }

  if (daysUntilCheckIn < 7) {
    return {
      canModify: false,
      message: `Only ${daysUntilCheckIn} days until check-in. Modifications not allowed within 7 days. Please contact us.`,
      severity: 'error',
    };
  }

  if (daysUntilCheckIn < 14) {
    return {
      canModify: true,
      message: `${daysUntilCheckIn} days until check-in. You can still modify your booking.`,
      severity: 'warning',
    };
  }

  return {
    canModify: true,
    message: `${daysUntilCheckIn} days until check-in. Feel free to modify your booking.`,
    severity: 'info',
  };
}
