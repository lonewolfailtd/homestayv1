'use client';

import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export default function ProgressIndicator({
  steps,
  currentStep,
  onStepClick
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = index <= currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={`
                relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-button font-medium transition-all
                ${isCompleted 
                  ? 'bg-white text-purple-600 border-2 border-white' 
                  : isCurrent 
                    ? 'bg-white text-purple-600 border-2 border-white' 
                    : 'bg-purple-500 text-purple-200 border-2 border-purple-400'
                }
                ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
              `}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </button>

            {/* Step Title (Hidden on mobile) */}
            <div className="hidden md:block ml-3 text-white">
              <div className={`text-sm font-button ${isCurrent ? 'font-semibold' : 'font-normal'}`}>
                {step.title}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div 
                  className={`h-0.5 transition-colors ${
                    isCompleted ? 'bg-white' : 'bg-purple-400'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}