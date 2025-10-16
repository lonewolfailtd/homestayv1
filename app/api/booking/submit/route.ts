import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createOrUpdateGHLContact } from '@/lib/gohighlevel';
import { createDepositInvoice, createBalanceInvoice } from '@/lib/xero';
import { sendBookingConfirmation } from '@/lib/email';
import { calculateAdvancedPricing } from '@/lib/pricing-engine';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId: clerkUserId } = await auth();
    let authenticatedUser = null;
    
    if (clerkUserId) {
      // Get user from our database
      authenticatedUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId }
      });
    }

    const formData = await request.json();
    
    const {
      customerType,
      // Customer data
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
      // Dog data
      dogName,
      dogAge,
      dogSex,
      dogBreed,
      vaccinated,
      neutered,
      vetClinic,
      vetPhone,
      medications,
      medicalConditions,
      crateTrained,
      socialLevel,
      peopleBehavior,
      behavioralIssues,
      farmAnimalReactive,
      biteHistory,
      additionalNotes,
      // Booking data
      checkIn,
      checkOut,
      boardingType,
      services,
      specialInstructions,
      // Enhanced pricing fields
      isEntireDog,
      selectedServices,
      numberOfMeals,
      numberOfWalks,
    } = formData;

    // Validate required fields
    if (!email || !dogName || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate pricing using advanced pricing engine
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const pricingResult = await calculateAdvancedPricing({
      checkInDate,
      checkOutDate,
      isEntireDog: isEntireDog || false,
      selectedServices: selectedServices || [],
      numberOfMeals: numberOfMeals || 0,
      numberOfWalks: numberOfWalks || 0,
    });

    const {
      totalDays,
      baseDailyRate,
      baseSubtotal,
      peakSurcharge,
      dogSurcharges,
      serviceCharges,
      totalPrice,
      isPeakPeriod,
      peakPeriodName,
      breakdown
    } = pricingResult;

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      let customer;
      let dog;

      // Always check if customer exists first (regardless of customerType)
      customer = await tx.customer.findUnique({
        where: { email },
        include: { dogs: true },
      });

      if (customer) {
        // Existing customer found - update their info if needed
        if (customerType === 'new') {
          // Update customer info with new data provided
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              firstName: firstName || customer.firstName,
              lastName: lastName || customer.lastName,
              phone: phone || customer.phone,
              address: address || customer.address,
              city: city || customer.city,
              postalCode: postalCode || customer.postalCode,
              emergencyName: emergencyName || customer.emergencyName,
              emergencyPhone: emergencyPhone || customer.emergencyPhone,
              emergencyRelation: emergencyRelation || customer.emergencyRelation,
            },
            include: { dogs: true },
          });
        }

        // Find or create dog for existing customer
        dog = customer.dogs.find(d => d.name.toLowerCase() === dogName.toLowerCase());
        
        if (!dog) {
          dog = await tx.dog.create({
            data: {
              customerId: customer.id,
              name: dogName,
              age: dogAge || 0,
              sex: dogSex || 'Unknown',
              breed: dogBreed || 'Mixed',
              vaccinated: vaccinated || 'Unknown',
              neutered: neutered || 'Unknown',
              vetClinic: vetClinic || '',
              vetPhone: vetPhone || '',
              medications: medications || '',
              medicalConditions: medicalConditions || '',
              crateTrained: crateTrained || 'Unknown',
              socialLevel: socialLevel || 'Unknown',
              peopleBehavior: peopleBehavior || '',
              behavioralIssues: behavioralIssues || 'None',
              farmAnimalReactive: farmAnimalReactive || 'Unknown',
              biteHistory: biteHistory || 'No',
              additionalNotes: additionalNotes || '',
            },
          });
        } else {
          // Update existing dog info
          dog = await tx.dog.update({
            where: { id: dog.id },
            data: {
              age: dogAge || dog.age,
              sex: dogSex || dog.sex,
              breed: dogBreed || dog.breed,
              vaccinated: vaccinated || dog.vaccinated,
              neutered: neutered || dog.neutered,
              vetClinic: vetClinic || dog.vetClinic,
              vetPhone: vetPhone || dog.vetPhone,
              medications: medications || dog.medications,
              medicalConditions: medicalConditions || dog.medicalConditions,
              crateTrained: crateTrained || dog.crateTrained,
              socialLevel: socialLevel || dog.socialLevel,
              peopleBehavior: peopleBehavior || dog.peopleBehavior,
              behavioralIssues: behavioralIssues || dog.behavioralIssues,
              farmAnimalReactive: farmAnimalReactive || dog.farmAnimalReactive,
              biteHistory: biteHistory || dog.biteHistory,
              additionalNotes: additionalNotes || dog.additionalNotes,
            },
          });
        }
      } else {
        // No existing customer - create new one
        if (customerType === 'existing') {
          throw new Error('Existing customer not found');
        }

        customer = await tx.customer.create({
          data: {
            email,
            firstName,
            lastName: lastName || '',
            phone,
            address,
            city,
            postalCode,
            emergencyName,
            emergencyPhone,
            emergencyRelation,
          },
        });

        // Create new dog
        dog = await tx.dog.create({
          data: {
            customerId: customer.id,
            name: dogName,
            age: dogAge,
            sex: dogSex,
            breed: dogBreed,
            vaccinated,
            neutered,
            vetClinic: vetClinic || '',
            vetPhone: vetPhone || '',
            medications: medications || '',
            medicalConditions: medicalConditions || '',
            crateTrained,
            socialLevel,
            peopleBehavior,
            behavioralIssues,
            farmAnimalReactive,
            biteHistory,
            additionalNotes: additionalNotes || '',
          },
        });
      }

      // Create booking with enhanced pricing data
      const booking = await tx.booking.create({
        data: {
          customerId: customer.id,
          dogId: dog.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          boardingType,
          services: services || [],
          totalDays,
          dailyRate: baseDailyRate,
          serviceCharges,
          totalPrice,
          specialNotes: specialInstructions || '',
          status: 'confirmed',
          // Enhanced pricing fields
          baseDailyRate,
          peakSurcharge: peakSurcharge || 0,
          dogSurcharges: dogSurcharges || 0,
          isPeakPeriod: isPeakPeriod || false,
          peakPeriodName: peakPeriodName || undefined,
          selectedServices: JSON.stringify(breakdown?.services || []),
        },
      });

      // If user is authenticated, save this dog to their profile for quick rebooking
      if (authenticatedUser) {
        await tx.savedDog.upsert({
          where: {
            userId_dogId: {
              userId: authenticatedUser.id,
              dogId: dog.id,
            },
          },
          update: {
            // Update last interaction
          },
          create: {
            userId: authenticatedUser.id,
            dogId: dog.id,
            isDefault: false,
          },
        });
      }

      return { customer, dog, booking };
    });

    const { customer, dog, booking } = result;

    // Create/Update GoHighLevel contact (non-blocking)
    const ghlPromise = createOrUpdateGHLContact({
      firstName: customer.firstName,
      lastName: customer.lastName || '',
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postalCode,
      emergencyName: customer.emergencyName,
      emergencyPhone: customer.emergencyPhone,
      emergencyRelation: customer.emergencyRelation,
      dogName: dog.name,
      dogAge: dog.age,
      dogBreed: dog.breed,
      dogSex: dog.sex,
      vaccinated: dog.vaccinated,
      neutered: dog.neutered,
      vetClinic: dog.vetClinic || '',
      vetPhone: dog.vetPhone || '',
      medications: dog.medications || '',
      medicalConditions: dog.medicalConditions || '',
      crateTrained: dog.crateTrained,
      socialLevel: dog.socialLevel,
      peopleBehavior: dog.peopleBehavior,
      behavioralIssues: dog.behavioralIssues,
      farmAnimalReactive: dog.farmAnimalReactive,
      biteHistory: dog.biteHistory,
      additionalNotes: dog.additionalNotes || '',
    });

    // Determine if booking is within 3 weeks of check-in date
    const now = new Date();
    const daysDifference = Math.floor((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isLastMinuteBooking = daysDifference <= 21; // 3 weeks or less

    let depositResult: any, balanceResult: any, fullInvoiceResult: any, ghlResult: any;

    if (isLastMinuteBooking) {
      // Create single full invoice for last-minute bookings
      const { createXeroInvoice } = await import('@/lib/xero');
      const fullInvoicePromise = createXeroInvoice({
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        dogName: dog.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalDays,
        dailyRate: baseDailyRate,
        serviceCharges,
        totalPrice,
        boardingType,
        // Enhanced pricing data
        baseDailyRate,
        peakSurcharge: peakSurcharge || 0,
        dogSurcharges: dogSurcharges || 0,
        isPeakPeriod: isPeakPeriod || false,
        peakPeriodName: peakPeriodName || undefined,
        selectedServices: breakdown?.services || [],
      });

      // Wait for all external integrations
      const [ghlResult_temp, fullInvoiceResult_temp] = await Promise.allSettled([
        ghlPromise, 
        fullInvoicePromise
      ]);
      
      ghlResult = ghlResult_temp;
      fullInvoiceResult = fullInvoiceResult_temp;
      console.log(`Last-minute booking (${daysDifference} days): Creating single full invoice`);
      
    } else {
      // Create deposit and balance invoices for advance bookings
      const depositPromise = createDepositInvoice({
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        dogName: dog.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalDays,
        dailyRate: baseDailyRate,
        serviceCharges,
        totalPrice,
        boardingType,
        // Enhanced pricing data
        baseDailyRate,
        peakSurcharge: peakSurcharge || 0,
        dogSurcharges: dogSurcharges || 0,
        isPeakPeriod: isPeakPeriod || false,
        peakPeriodName: peakPeriodName || undefined,
        selectedServices: breakdown?.services || [],
      });

      const balancePromise = createBalanceInvoice({
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        dogName: dog.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalDays,
        dailyRate: baseDailyRate,
        serviceCharges,
        totalPrice,
        boardingType,
        // Enhanced pricing data
        baseDailyRate,
        peakSurcharge: peakSurcharge || 0,
        dogSurcharges: dogSurcharges || 0,
        isPeakPeriod: isPeakPeriod || false,
        peakPeriodName: peakPeriodName || undefined,
        selectedServices: breakdown?.services || [],
      });

      // Wait for all external integrations
      const [ghlResult_temp, depositResult_temp, balanceResult_temp] = await Promise.allSettled([
        ghlPromise, 
        depositPromise, 
        balancePromise
      ]);
      
      ghlResult = ghlResult_temp;
      depositResult = depositResult_temp;
      balanceResult = balanceResult_temp;
      console.log(`Advance booking (${daysDifference} days): Creating deposit + balance invoices`);
    }

    // Update booking with appropriate invoice info
    const updateData: any = {};

    if (isLastMinuteBooking) {
      // Last-minute booking: full payment required immediately
      updateData.depositAmount = totalPrice; // Full amount as "deposit"
      updateData.balanceAmount = 0; // No balance
      updateData.depositPaid = false; // Will be updated when payment received
      updateData.balancePaid = true; // No balance to pay
      updateData.balanceDueDate = null; // No balance due date

      // Add full invoice info if successful
      if (fullInvoiceResult.status === 'fulfilled' && fullInvoiceResult.value.success) {
        updateData.depositInvoiceId = fullInvoiceResult.value.invoiceId;
        updateData.xeroInvoiceId = fullInvoiceResult.value.invoiceId; // Legacy field
        updateData.invoiceId = fullInvoiceResult.value.invoiceNumber; // Legacy field
      }
    } else {
      // Advance booking: deposit + balance system
      const depositAmount = totalPrice * 0.5;
      const balanceAmount = totalPrice * 0.5;
      const balanceDueDate = new Date(checkInDate);
      balanceDueDate.setDate(balanceDueDate.getDate() - 21); // 3 weeks before check-in

      updateData.depositAmount = depositAmount;
      updateData.balanceAmount = balanceAmount;
      updateData.balanceDueDate = balanceDueDate;
      updateData.depositPaid = false;
      updateData.balancePaid = false;

      // Add deposit invoice info if successful
      if (depositResult && depositResult.status === 'fulfilled' && depositResult.value.success) {
        updateData.depositInvoiceId = depositResult.value.invoiceId;
        updateData.xeroInvoiceId = depositResult.value.invoiceId; // Legacy field
        updateData.invoiceId = depositResult.value.invoiceNumber; // Legacy field
      }

      // Add balance invoice info if successful
      if (balanceResult && balanceResult.status === 'fulfilled' && balanceResult.value.success) {
        updateData.balanceInvoiceId = balanceResult.value.invoiceId;
      }
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
    });

    // Determine invoice URL and success status based on booking type
    let invoiceUrl: string | undefined;
    let xeroSuccess: boolean;

    if (isLastMinuteBooking) {
      invoiceUrl = fullInvoiceResult.status === 'fulfilled' && fullInvoiceResult.value.success 
        ? fullInvoiceResult.value.invoiceUrl 
        : undefined;
      xeroSuccess = fullInvoiceResult.status === 'fulfilled' && fullInvoiceResult.value.success;
    } else {
      invoiceUrl = depositResult && depositResult.status === 'fulfilled' && depositResult.value.success 
        ? depositResult.value.invoiceUrl 
        : undefined;
      xeroSuccess = (depositResult && depositResult.status === 'fulfilled' && depositResult.value.success) || 
                   (balanceResult && balanceResult.status === 'fulfilled' && balanceResult.value.success);
    }

    // Send email confirmation to customer and owner
    const emailResult = await sendBookingConfirmation({
      customerName: `${customer.firstName} ${customer.lastName}`.trim(),
      customerEmail: customer.email,
      dogName: dog.name,
      checkIn: checkInDate.toLocaleDateString(),
      checkOut: checkOutDate.toLocaleDateString(),
      totalPrice: `$${totalPrice.toFixed(2)}`,
      invoiceUrl: invoiceUrl,
      ghlSuccess: ghlResult.status === 'fulfilled' ? ghlResult.value.success : false,
      xeroSuccess: xeroSuccess,
    });

    console.log('Email notification result:', emailResult);

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      customer: {
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email,
      },
      dog: {
        name: dog.name,
      },
      booking: {
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        totalDays,
        totalPrice: totalPrice.toFixed(2),
      },
      integrations: {
        gohighlevel: ghlResult.status === 'fulfilled' ? ghlResult.value.success : false,
        xero: xeroSuccess,
        invoiceUrl: invoiceUrl || null,
      },
    });

  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}