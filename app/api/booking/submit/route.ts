import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createOrUpdateGHLContact } from '@/lib/gohighlevel';
import { createXeroInvoice } from '@/lib/xero';
import { sendBookingConfirmation } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
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
    } = formData;

    // Validate required fields
    if (!email || !dogName || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const rates = {
      standard: parseFloat(process.env.DAILY_BOARDING_RATE || '50'),
      luxury: parseFloat(process.env.LUXURY_BOARDING_RATE || '75'),
    };
    
    const dailyRate = rates[boardingType as keyof typeof rates] || rates.standard;
    
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

    const totalPrice = (totalDays * dailyRate) + serviceCharges;

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

      // Create booking
      const booking = await tx.booking.create({
        data: {
          customerId: customer.id,
          dogId: dog.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          boardingType,
          services: services || [],
          totalDays,
          dailyRate,
          serviceCharges,
          totalPrice,
          specialNotes: specialInstructions || '',
          status: 'confirmed',
        },
      });

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

    // Create Xero invoice (non-blocking)
    const xeroPromise = createXeroInvoice({
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName}`.trim(),
      dogName: dog.name,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalDays,
      dailyRate,
      serviceCharges,
      totalPrice,
      boardingType,
    });

    // Wait for both external integrations
    const [ghlResult, xeroResult] = await Promise.allSettled([ghlPromise, xeroPromise]);

    // Update booking with invoice info if Xero succeeded
    if (xeroResult.status === 'fulfilled' && xeroResult.value.success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          xeroInvoiceId: xeroResult.value.invoiceId,
          invoiceId: xeroResult.value.invoiceNumber,
        },
      });
    }

    // Send email confirmation to customer and owner
    const emailResult = await sendBookingConfirmation({
      customerName: `${customer.firstName} ${customer.lastName}`.trim(),
      customerEmail: customer.email,
      dogName: dog.name,
      checkIn: checkInDate.toLocaleDateString(),
      checkOut: checkOutDate.toLocaleDateString(),
      totalPrice: `$${totalPrice.toFixed(2)}`,
      invoiceUrl: xeroResult.status === 'fulfilled' && xeroResult.value.success 
        ? xeroResult.value.invoiceUrl 
        : undefined,
      ghlSuccess: ghlResult.status === 'fulfilled' ? ghlResult.value.success : false,
      xeroSuccess: xeroResult.status === 'fulfilled' ? xeroResult.value.success : false,
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
        xero: xeroResult.status === 'fulfilled' ? xeroResult.value.success : false,
        invoiceUrl: xeroResult.status === 'fulfilled' && xeroResult.value.success 
          ? xeroResult.value.invoiceUrl 
          : null,
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