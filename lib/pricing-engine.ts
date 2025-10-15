import { prisma } from './db';

// NZ Public Holiday Peak Periods 2025
export const PEAK_PERIODS_2025 = [
  {
    name: "New Year's Period",
    startDate: new Date('2024-12-28'),
    endDate: new Date('2025-01-05'),
    surchargePercent: 20,
    minDays: null,
  },
  {
    name: "Auckland Anniversary Day",
    startDate: new Date('2025-01-25'),
    endDate: new Date('2025-01-27'),
    surchargePercent: 20,
    minDays: null,
  },
  {
    name: "Waitangi Day",
    startDate: new Date('2025-02-07'),
    endDate: new Date('2025-02-09'),
    surchargePercent: 20,
    minDays: null,
  },
  {
    name: "Easter Weekend",
    startDate: new Date('2025-04-18'),
    endDate: new Date('2025-04-21'),
    surchargePercent: 20,
    minDays: null,
  },
  {
    name: "ANZAC Day",
    startDate: new Date('2025-04-25'),
    endDate: new Date('2025-04-27'),
    surchargePercent: 20,
    minDays: null,
  },
  {
    name: "King's Birthday",
    startDate: new Date('2025-05-31'),
    endDate: new Date('2025-06-02'),
    surchargePercent: 20,
    minDays: null,
  },
  {
    name: "Matariki",
    startDate: new Date('2025-06-20'),
    endDate: new Date('2025-06-22'),
    surchargePercent: 20,
    minDays: null,
  },
  {
    name: "Labour Day",
    startDate: new Date('2025-10-25'),
    endDate: new Date('2025-10-27'),
    surchargePercent: 20,
    minDays: null,
  },
  {
    name: "Christmas/Boxing Day",
    startDate: new Date('2025-12-20'),
    endDate: new Date('2025-12-28'),
    surchargePercent: 20,
    minDays: 7, // Christmas minimum 7 days
  },
];

// Base daily rates from pricing sheet
export const DAILY_RATES = {
  SHORT_STAY: { minDays: 1, maxDays: 4, rate: 85 },    // 4 days or less: $85/day
  STANDARD_STAY: { minDays: 5, maxDays: 30, rate: 80 }, // 5-30 days: $80/day  
  LONG_STAY: { minDays: 31, maxDays: null, rate: 75 },  // 1 month+: $75/day
};

// Additional services with prerequisites
export const ADDITIONAL_SERVICES = {
  // Grooming Services
  FULL_WASH: { name: "Full Wash & Conditioner", price: 40, unit: "per_service", category: "grooming" },
  NAIL_CLIP: { name: "Nails Clipped", price: 10, unit: "per_service", category: "grooming" },
  
  // Walk Services (require assessment)
  PACK_WALK: { 
    name: "Adventure Pack Walks", 
    price: 30, 
    unit: "per_walk", 
    category: "walks",
    requiresPrereq: true,
    prerequisite: "WALK_ASSESSMENT"
  },
  WALK_ASSESSMENT: { 
    name: "Pre Walk Assessment x 2", 
    price: 60, 
    unit: "per_service", 
    category: "assessment"
  },
  
  // Training Services
  RECALL_TRAINING: { name: "Recall Training", price: 150, unit: "per_service", category: "training" },
  OBEDIENCE_TRAINING: { name: "Obedience Training", price: 150, unit: "per_service", category: "training" },
  
  // Food Services
  RAW_MEAL: { name: "Balanced Raw Meal", price: 5, unit: "per_meal", category: "food" },
  
  // Dog Condition Surcharges
  ENTIRE_DOG: { name: "Entire Dog Surcharge", price: 5, unit: "per_day", category: "surcharge" },
};

interface PricingCalculationParams {
  checkInDate: Date;
  checkOutDate: Date;
  isEntireDog?: boolean;
  selectedServices?: string[];
  numberOfMeals?: number;
  numberOfWalks?: number;
}

interface PricingResult {
  totalDays: number;
  baseDailyRate: number;
  baseSubtotal: number;
  peakSurcharge: number;
  dogSurcharges: number;
  serviceCharges: number;
  totalPrice: number;
  isPeakPeriod: boolean;
  peakPeriodName?: string;
  breakdown: {
    baseStay: number;
    peakSurcharge: number;
    entireDogSurcharge: number;
    services: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  };
  warnings: string[];
}

export async function calculateAdvancedPricing(params: PricingCalculationParams): Promise<PricingResult> {
  const { checkInDate, checkOutDate, isEntireDog = false, selectedServices = [], numberOfMeals = 0, numberOfWalks = 0 } = params;
  
  // Calculate total days
  const totalDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine base daily rate based on stay duration
  let baseDailyRate: number;
  if (totalDays <= DAILY_RATES.SHORT_STAY.maxDays) {
    baseDailyRate = DAILY_RATES.SHORT_STAY.rate;
  } else if (totalDays <= DAILY_RATES.STANDARD_STAY.maxDays) {
    baseDailyRate = DAILY_RATES.STANDARD_STAY.rate;
  } else {
    baseDailyRate = DAILY_RATES.LONG_STAY.rate;
  }
  
  const baseSubtotal = totalDays * baseDailyRate;
  
  // Check for peak periods
  const peakPeriod = checkPeakPeriod(checkInDate, checkOutDate);
  let peakSurcharge = 0;
  let isPeakPeriod = false;
  let peakPeriodName: string | undefined;
  
  if (peakPeriod) {
    isPeakPeriod = true;
    peakPeriodName = peakPeriod.name;
    peakSurcharge = baseSubtotal * (peakPeriod.surchargePercent / 100);
  }
  
  // Calculate dog surcharges
  let dogSurcharges = 0;
  if (isEntireDog) {
    dogSurcharges = totalDays * ADDITIONAL_SERVICES.ENTIRE_DOG.price;
  }
  
  // Calculate service charges
  let serviceCharges = 0;
  const serviceBreakdown: Array<{ name: string; quantity: number; unitPrice: number; total: number }> = [];
  
  // Process selected services
  for (const serviceKey of selectedServices) {
    const service = ADDITIONAL_SERVICES[serviceKey as keyof typeof ADDITIONAL_SERVICES];
    if (service) {
      let quantity = 1;
      let total = service.price;
      
      // Handle services with specific quantities
      if (service.unit === "per_meal" && numberOfMeals > 0) {
        quantity = numberOfMeals;
        total = service.price * quantity;
      } else if (service.unit === "per_walk" && numberOfWalks > 0) {
        quantity = numberOfWalks;
        total = service.price * quantity;
      } else if (service.unit === "per_day") {
        quantity = totalDays;
        total = service.price * quantity;
      }
      
      serviceCharges += total;
      serviceBreakdown.push({
        name: service.name,
        quantity,
        unitPrice: service.price,
        total
      });
    }
  }
  
  // Check for warnings and requirements
  const warnings: string[] = [];
  
  // Check Christmas minimum stay requirement
  if (peakPeriod?.name === "Christmas/Boxing Day" && totalDays < 7) {
    warnings.push("Christmas period requires a minimum 7-day stay");
  }
  
  // Check for service prerequisites
  if (selectedServices.includes('PACK_WALK') && !selectedServices.includes('WALK_ASSESSMENT')) {
    warnings.push("Adventure Pack Walks require a Pre Walk Assessment");
  }
  
  const totalPrice = baseSubtotal + peakSurcharge + dogSurcharges + serviceCharges;
  
  return {
    totalDays,
    baseDailyRate,
    baseSubtotal,
    peakSurcharge,
    dogSurcharges,
    serviceCharges,
    totalPrice,
    isPeakPeriod,
    peakPeriodName,
    breakdown: {
      baseStay: baseSubtotal,
      peakSurcharge,
      entireDogSurcharge: dogSurcharges,
      services: serviceBreakdown
    },
    warnings
  };
}

function checkPeakPeriod(checkIn: Date, checkOut: Date) {
  // Check if any part of the stay falls within a peak period
  for (const period of PEAK_PERIODS_2025) {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);
    
    // Check if dates overlap
    if (checkIn <= periodEnd && checkOut >= periodStart) {
      return period;
    }
  }
  return null;
}

// Initialize peak periods in database (run once)
export async function initializePeakPeriods() {
  try {
    // Clear existing 2025 peak periods
    await prisma.peakPeriod.deleteMany({
      where: { year: 2025 }
    });
    
    // Insert 2025 peak periods
    for (const period of PEAK_PERIODS_2025) {
      await prisma.peakPeriod.create({
        data: {
          name: period.name,
          startDate: period.startDate,
          endDate: period.endDate,
          surchargePercent: period.surchargePercent,
          minDays: period.minDays,
          year: 2025,
          isActive: true
        }
      });
    }
    
    console.log('Peak periods initialized successfully');
  } catch (error) {
    console.error('Error initializing peak periods:', error);
  }
}

// Initialize pricing tiers in database (run once)
export async function initializePricingTiers() {
  try {
    // Clear existing pricing tiers
    await prisma.pricingTier.deleteMany({});
    
    // Insert pricing tiers
    await prisma.pricingTier.createMany({
      data: [
        {
          name: "short_stay",
          minDays: 1,
          maxDays: 4,
          dailyRate: 85,
          description: "4 days or less: $85/day",
          isActive: true
        },
        {
          name: "standard_stay", 
          minDays: 5,
          maxDays: 30,
          dailyRate: 80,
          description: "5-30 days: $80/day",
          isActive: true
        },
        {
          name: "long_stay",
          minDays: 31,
          maxDays: null,
          dailyRate: 75,
          description: "1 month+: $75/day",
          isActive: true
        }
      ]
    });
    
    console.log('Pricing tiers initialized successfully');
  } catch (error) {
    console.error('Error initializing pricing tiers:', error);
  }
}