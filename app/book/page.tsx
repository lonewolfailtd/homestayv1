'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import MultiStepBookingForm from '@/components/booking/MultiStepBookingForm';
import ProfileIncompleteModal from '@/components/ProfileIncompleteModal';

export default function BookPage() {
  const { isLoaded } = useUser();
  const [profileStatus, setProfileStatus] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await fetch('/api/user/profile-completeness');
        const data = await response.json();

        if (response.ok) {
          setProfileStatus(data);
          // Show modal if profile is incomplete
          if (!data.isComplete) {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setCheckingProfile(false);
      }
    };

    if (isLoaded) {
      checkProfile();
    }
  }, [isLoaded]);

  if (!isLoaded || checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <>
      {profileStatus && !profileStatus.isComplete && (
        <ProfileIncompleteModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          missing={profileStatus.missing}
          checklist={profileStatus.checklist}
          completeness={profileStatus.completeness}
        />
      )}

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MultiStepBookingForm />
        </div>
      </main>
    </>
  );
}