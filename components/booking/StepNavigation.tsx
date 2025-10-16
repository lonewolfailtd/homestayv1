'use client';

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canProceed: boolean;
  isSubmitting?: boolean;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canProceed,
  isSubmitting = false
}: StepNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
        className={`
          flex items-center px-6 py-4 rounded-xl font-button font-medium transition-colors touch-manipulation min-w-[120px]
          ${isFirstStep || isSubmitting
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100'
          }
        `}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </button>

      <div className="flex items-center text-sm text-gray-500 font-body order-first sm:order-none w-full sm:w-auto justify-center">
        Step {currentStep + 1} of {totalSteps}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={`
          flex items-center px-6 py-4 rounded-xl font-button font-medium transition-colors touch-manipulation min-w-[140px]
          ${!canProceed || isSubmitting
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isLastStep
              ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : isLastStep ? (
          <>
            Complete Booking
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </button>
    </div>
  );
}