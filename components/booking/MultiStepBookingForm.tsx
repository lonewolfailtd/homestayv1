'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
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
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mr-4">
                <span className="text-cyan-600 font-heading text-lg font-bold">K9</span>
              </div>
              <div>
                <h1 className="text-2xl font-heading text-white">Book Your Stay</h1>
                <p className="text-slate-300 text-sm font-body">
                  Professional dog boarding & homestay
                </p>
              </div>
            </div>
            <div className="text-right text-white">
              <div className="text-sm font-body text-slate-300">Step {currentStep + 1} of {STEPS.length}</div>
              <div className="text-lg font-button">{STEPS[currentStep].title}</div>
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