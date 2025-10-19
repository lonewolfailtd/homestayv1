'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompletionBannerProps {
  completeness: number;
  checklist: {
    hasDogProfile: boolean;
    hasDogPhotos: boolean;
    hasVaccinationRecords: boolean;
    hasVetInfo: boolean;
    hasPersonalInfo: boolean;
  };
}

export default function ProfileCompletionBanner({
  completeness,
  checklist,
}: ProfileCompletionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if profile is complete or user dismissed it
  if (completeness === 100 || isDismissed) {
    return null;
  }

  const tasks = [
    {
      label: 'Dog profile',
      complete: checklist.hasDogProfile,
      link: '/dashboard/dogs/new',
    },
    {
      label: 'Dog photos',
      complete: checklist.hasDogPhotos,
      link: '/dashboard/dogs',
    },
    {
      label: 'Vaccination records',
      complete: checklist.hasVaccinationRecords,
      link: '/dashboard/dogs',
    },
    {
      label: 'Vet information',
      complete: checklist.hasVetInfo,
      link: '/dashboard/dogs',
    },
    {
      label: 'Personal information',
      complete: checklist.hasPersonalInfo,
      link: '/dashboard/profile',
    },
  ];

  const incompleteTask = tasks.find((task) => !task.complete);

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6 mb-6 relative">
      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0 bg-cyan-100 p-3 rounded-full">
          <CheckCircle2 className="h-6 w-6 text-cyan-600" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-heading text-black mb-2">
            Complete Your Profile to Start Booking
          </h3>
          <p className="text-gray-600 font-body mb-4">
            You're {completeness}% there! Just a few more details and you'll be ready to book your dog's stay.
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-button text-gray-700">
                Profile Completeness
              </span>
              <span className="text-sm font-button text-cyan-600">
                {completeness}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {tasks.map((task) => (
              <div key={task.label} className="flex items-center space-x-2">
                {task.complete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span
                  className={`text-sm font-body ${
                    task.complete ? 'text-gray-600 line-through' : 'text-gray-700'
                  }`}
                >
                  {task.label}
                </span>
              </div>
            ))}
          </div>

          {/* Action button */}
          {incompleteTask && (
            <Link
              href={incompleteTask.link}
              className="inline-flex items-center btn-primary text-sm"
            >
              Complete {incompleteTask.label}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
