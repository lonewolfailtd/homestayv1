'use client';

import { AlertCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface ProfileIncompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  missing: string[];
  checklist: {
    hasDogProfile: boolean;
    hasDogPhotos: boolean;
    hasVaccinationRecords: boolean;
    hasVetInfo: boolean;
    hasPersonalInfo: boolean;
  };
  completeness: number;
}

export default function ProfileIncompleteModal({
  isOpen,
  onClose,
  missing,
  checklist,
  completeness,
}: ProfileIncompleteModalProps) {
  if (!isOpen) return null;

  const tasks = [
    {
      label: 'Dog profile',
      description: 'Create a profile with your dog\'s name, breed, age and behaviour',
      complete: checklist.hasDogProfile,
      link: '/dashboard/dogs/new',
      instruction: null,
    },
    {
      label: 'Dog photos',
      description: 'Upload photos of your dog so we can recognise them',
      complete: checklist.hasDogPhotos,
      link: '/dashboard/dogs',
      instruction: 'Click the edit button next to your dog, then go to the Photos tab',
    },
    {
      label: 'Vaccination records',
      description: 'Upload proof of current vaccinations for safety',
      complete: checklist.hasVaccinationRecords,
      link: '/dashboard/dogs',
      instruction: 'Click the edit button next to your dog, then go to the Vaccinations tab',
    },
    {
      label: 'Vet information',
      description: 'Add your vet clinic name and contact number',
      complete: checklist.hasVetInfo,
      link: '/dashboard/dogs',
      instruction: 'Click the edit button next to your dog, then go to the Medical & Vet tab',
    },
    {
      label: 'Personal information',
      description: 'Your phone, address and emergency contact details',
      complete: checklist.hasPersonalInfo,
      link: '/dashboard/profile',
      instruction: null,
    },
  ];

  const firstIncompleteTask = tasks.find((task) => !task.complete);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-black p-6 text-white border-b-4 border-cyan-500">
            <div className="flex items-center justify-between mb-4">
              <Image
                src="/images/100-K9-logo-horizontal.png"
                alt="100% K9"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
              <div className="bg-white bg-opacity-10 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-heading text-white mb-1">Complete Your Profile</h2>
              <p className="text-gray-300 font-body">
                Just a few more details to start booking your dog's homestay
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-button text-gray-700">
                  Profile Completion
                </span>
                <span className="text-lg font-heading text-cyan-600">
                  {completeness}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-500 rounded-full"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>

            <p className="text-gray-700 font-body mb-6">
              For the safety and wellbeing of your dog, we need the following information before you can book:
            </p>

            {/* Checklist */}
            <div className="space-y-4 mb-6">
              {tasks.map((task) => (
                <div
                  key={task.label}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 ${
                    task.complete
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {task.complete ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-button font-semibold ${
                        task.complete ? 'text-green-700' : 'text-gray-900'
                      }`}
                    >
                      {task.label}
                      {task.complete && (
                        <span className="ml-2 text-xs font-body text-green-600">
                          ✓ Complete
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 font-body mb-2">
                      {task.description}
                    </p>
                    {!task.complete && (
                      <Link
                        href={task.link}
                        onClick={() => {
                          if (task.instruction) {
                            toast.info(task.instruction, { duration: 5000 });
                          }
                          onClose();
                        }}
                        className="inline-flex items-center text-sm font-button text-cyan-600 hover:text-cyan-700"
                      >
                        Complete this step
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {firstIncompleteTask && (
                <Link
                  href={firstIncompleteTask.link}
                  onClick={() => {
                    if (firstIncompleteTask.instruction) {
                      toast.info(firstIncompleteTask.instruction, { duration: 5000 });
                    }
                    onClose();
                  }}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  Complete {firstIncompleteTask.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              )}
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                I'll Do This Later
              </button>
            </div>

            {/* Footer note */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-body text-center mb-3">
                This information helps us provide the best care for your dog and ensures their safety during their stay.
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <span>Powered by</span>
                <span className="font-heading text-black">100% K9</span>
                <span className="text-cyan-500">•</span>
                <span>Professional Dog Boarding</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
