'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ProgressIndicator from './ProgressIndicator';
import StepNavigation from './StepNavigation';
import WelcomeStep from './steps/WelcomeStep';
import CustomerStep from './steps/CustomerStep';
import DogStep from './steps/DogStep';
import DateStep from './steps/DateStep';
import ServicesStep from './steps/ServicesStep';
import SummaryStep from './steps/SummaryStep';
import { FormProvider } from './FormContext';

const STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'customer', title: 'Your Details', component: CustomerStep },
  { id: 'dog', title: 'Dog Profile', component: DogStep },
  { id: 'dates', title: 'Select Dates', component: DateStep },
  { id: 'services', title: 'Services', component: ServicesStep },
  { id: 'summary', title: 'Review & Book', component: SummaryStep },
];

export default function MultiStepBookingForm() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCustomerData, setHasCustomerData] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Handle URL parameters for pre-selected dogs and dates
  useEffect(() => {
    const dogIds = searchParams.getAll('dogId');
    const isMultiDog = searchParams.get('multiDog') === 'true';
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (dogIds.length > 0 || isMultiDog || checkIn || checkOut) {
      setFormData(prev => ({
        ...prev,
        ...(isMultiDog && { isMultiDogBooking: true }),
        ...(checkIn && { checkIn }),
        ...(checkOut && { checkOut }),
        preSelectedDogIds: dogIds,
      }));
    }
  }, [searchParams]);

  // Check if user has complete customer data on mount
  useEffect(() => {
    const checkCustomerData = async () => {
      if (user) {
        try {
          const response = await fetch('/api/user/customer');
          if (response.ok) {
            const data = await response.json();
            if (data.exists && data.customer) {
              const customer = data.customer;
              // Check if customer has all required fields
              const isComplete = !!(
                customer.phone &&
                customer.emergencyName &&
                customer.emergencyPhone
              );
              setHasCustomerData(isComplete);

              // If complete, pre-populate form data and skip customer step
              if (isComplete) {
                setFormData({
                  firstName: user.firstName || customer.firstName,
                  lastName: user.lastName || customer.lastName,
                  email: user.emailAddresses?.[0]?.emailAddress || customer.email,
                  phone: customer.phone,
                  address: customer.address,
                  city: customer.city,
                  postalCode: customer.postalCode,
                  emergencyName: customer.emergencyName,
                  emergencyPhone: customer.emergencyPhone,
                  emergencyRelation: customer.emergencyRelation,
                });
              }
            }
          }
        } catch (error) {
          console.log('Could not fetch customer data:', error);
        }
      }
      setLoading(false);
    };

    checkCustomerData();
  }, [user]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      let nextStepIndex = currentStep + 1;

      // Skip customer step if user already has complete data
      if (nextStepIndex === 1 && hasCustomerData) {
        nextStepIndex = 2; // Skip to dog step
      }

      setCurrentStep(nextStepIndex);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      let prevStepIndex = currentStep - 1;

      // Skip customer step if user already has complete data
      if (prevStepIndex === 1 && hasCustomerData) {
        prevStepIndex = 0; // Go back to welcome
      }

      setCurrentStep(prevStepIndex);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setCurrentStep(stepIndex);
    }
  };

  const updateFormData = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <FormProvider value={{ formData, updateFormData, user }}>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header with Logo and Progress */}
        <div className="bg-gradient-to-r from-black to-gray-800 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-4">
            <div className="flex items-center">
              <Image
                src="/images/100-K9-logo-horizontal.png"
                alt="100% K9"
                width={200}
                height={46}
                className="h-10 md:h-14 w-auto mr-4"
                priority
              />
              <div className="hidden md:block border-l border-gray-600 pl-4">
                <h1 className="text-xl md:text-2xl font-heading text-white">Book Your Stay</h1>
                <p className="text-gray-300 text-xs md:text-sm font-body">
                  Professional dog boarding & homestay
                </p>
              </div>
            </div>
            <div className="text-right text-white">
              <div className="text-xs md:text-sm font-body text-gray-300">
                Step {currentStep + 1} of {hasCustomerData ? STEPS.length - 1 : STEPS.length}
              </div>
              <div className="text-base md:text-lg font-button">{STEPS[currentStep].title}</div>
            </div>
          </div>
          
          <ProgressIndicator 
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>

        {/* Form Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              <CurrentStepComponent 
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={STEPS.length}
            onPrevious={prevStep}
            onNext={nextStep}
            canProceed={true} // This should be determined by form validation
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </FormProvider>
  );
}