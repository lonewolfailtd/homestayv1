'use client';

import { useUser } from '@clerk/nextjs';
import MultiStepBookingForm from '@/components/booking/MultiStepBookingForm';

export default function BookPage() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <MultiStepBookingForm />
      </div>
    </main>
  );
}