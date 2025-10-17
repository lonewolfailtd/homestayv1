'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dog, Calendar, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DogProfile {
  id: string;
  name: string;
  age: number;
  breed: string;
  sex: string;
  socialLevel: string;
}

function MultiDogBookingContent() {
  const searchParams = useSearchParams();
  const [selectedDogs, setSelectedDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDates, setBookingDates] = useState({
    checkIn: '',
    checkOut: ''
  });

  useEffect(() => {
    const fetchDogProfiles = async () => {
      const dogIds = searchParams.getAll('dogId');
      
      if (dogIds.length === 0) {
        toast.error('No dogs selected for booking');
        return;
      }

      try {
        const promises = dogIds.map(id => 
          fetch(`/api/dogs/${id}`).then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        const validDogs = results.filter(result => result.success).map(result => result.dog);
        
        setSelectedDogs(validDogs);
      } catch (error) {
        console.error('Error fetching dog profiles:', error);
        toast.error('Failed to load dog profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchDogProfiles();
  }, [searchParams]);

  const handleProceedToBooking = () => {
    if (!bookingDates.checkIn || !bookingDates.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    // For now, redirect to regular booking with first dog and dates
    // In future, this could be enhanced to handle true multi-dog bookings
    const params = new URLSearchParams({
      dogId: selectedDogs[0]?.id || '',
      checkIn: bookingDates.checkIn,
      checkOut: bookingDates.checkOut,
      multiDog: 'true'
    });

    window.location.href = `/book?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dog profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-heading text-black mb-4">No Dogs Selected</h1>
          <p className="text-gray-600 mb-8">Please select dogs from your profile to continue with booking.</p>
          <Link href="/dashboard/dogs" className="btn-primary">
            Back to My Dogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-cyan-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-8 w-8 text-cyan-600" />
          </div>
          <h1 className="text-3xl font-heading text-black mb-2">
            Multi-Dog Booking
          </h1>
          <p className="text-gray-600 font-body">
            Book multiple dogs for the same stay period
          </p>
        </div>

        {/* Selected Dogs */}
        <div className="card mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-heading text-black">Selected Dogs ({selectedDogs.length})</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDogs.map((dog) => (
                <div key={dog.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-cyan-100 rounded-lg p-2">
                      <Dog className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-button font-semibold text-black">{dog.name}</h3>
                      <p className="text-sm text-gray-600">{dog.breed}</p>
                    </div>
                  </div>
                  <div className="text-sm font-body text-gray-600 space-y-1">
                    <div>{dog.age} years old • {dog.sex}</div>
                    <div>Social Level: {dog.socialLevel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="card mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-heading text-black">Select Dates</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={bookingDates.checkIn}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, checkIn: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={bookingDates.checkOut}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, checkOut: e.target.value }))}
                  min={bookingDates.checkIn || new Date().toISOString().split('T')[0]}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <h3 className="font-button font-semibold text-amber-800 mb-2">Multi-Dog Booking Notice</h3>
          <div className="text-sm font-body text-amber-700 space-y-2">
            <p>• All selected dogs will share the same check-in and check-out dates</p>
            <p>• Pricing will be calculated individually for each dog</p>
            <p>• Dogs with different social levels may require separate accommodations</p>
            <p>• Additional services can be customized for each dog during booking</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/dogs"
            className="btn-secondary flex items-center"
          >
            Back to My Dogs
          </Link>
          
          <button
            onClick={handleProceedToBooking}
            disabled={!bookingDates.checkIn || !bookingDates.checkOut}
            className={`flex items-center px-8 py-3 rounded-xl font-button font-medium transition-colors ${
              bookingDates.checkIn && bookingDates.checkOut
                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Booking Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MultiDogBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <MultiDogBookingContent />
    </Suspense>
  );
}