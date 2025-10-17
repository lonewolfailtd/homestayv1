'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Dog, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  DollarSign,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface SavedDog {
  id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  temperament: string;
  medicalNeeds: string;
  specialInstructions: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  unit: string;
}

interface BookingFormData {
  dogId: string;
  checkInDate: string;
  checkOutDate: string;
  services: { [key: string]: number };
  specialRequests: string;
}

const services: Service[] = [
  { id: 'grooming', name: 'Professional Grooming', price: 85, description: 'Full grooming service including bath, trim, and nail clipping', unit: 'session' },
  { id: 'training', name: 'Training Session', price: 120, description: 'One-on-one training with certified dog trainer', unit: 'hour' },
  { id: 'walks', name: 'Adventure Walks', price: 45, description: 'Extended walks in scenic locations', unit: 'walk' },
  { id: 'meals', name: 'Premium Meals', price: 25, description: 'High-quality, specialized meal preparation', unit: 'day' }
];

export default function RebookPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId');
  
  const [savedDogs, setSavedDogs] = useState<SavedDog[]>([]);
  const [selectedDog, setSelectedDog] = useState<SavedDog | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    dogId: dogId || '',
    checkInDate: '',
    checkOutDate: '',
    services: {},
    specialRequests: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (isLoaded && user) {
      fetchSavedDogs();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (dogId && savedDogs.length > 0) {
      const dog = savedDogs.find(d => d.id === dogId);
      if (dog) {
        setSelectedDog(dog);
        setFormData(prev => ({ ...prev, dogId }));
      }
    }
  }, [dogId, savedDogs]);

  useEffect(() => {
    calculateTotal();
  }, [formData.services, formData.checkInDate, formData.checkOutDate]);

  const fetchSavedDogs = async () => {
    try {
      const response = await fetch('/api/customers/dogs');
      if (response.ok) {
        const dogs = await response.json();
        setSavedDogs(dogs);
      }
    } catch (error) {
      toast.error('Failed to load saved dogs');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (totalDays <= 0) return;

    let baseRate = 85; // Default short stay rate
    if (totalDays >= 31) baseRate = 75; // Long stay
    else if (totalDays >= 5) baseRate = 80; // Standard stay

    let total = totalDays * baseRate;

    // Add services
    Object.entries(formData.services).forEach(([serviceId, quantity]) => {
      const service = services.find(s => s.id === serviceId);
      if (service && quantity > 0) {
        total += service.price * quantity;
      }
    });

    setTotalPrice(total);
  };

  const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [serviceId]: Math.max(0, quantity)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDog || !formData.checkInDate || !formData.checkOutDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/booking/rebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogId: selectedDog.id,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          services: formData.services,
          specialRequests: formData.specialRequests,
          totalPrice
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Booking confirmed! Check your email for details.');
        router.push(`/dashboard/bookings/${result.bookingId}`);
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-heading text-black">Quick Rebook</h1>
          <p className="text-gray-600 font-body mt-2">
            Book another stay for your saved dogs with just a few clicks
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dog Selection */}
          <div className="card p-6">
            <h2 className="text-xl font-heading text-black mb-4">Select Your Dog</h2>
            {savedDogs.length === 0 ? (
              <div className="text-center py-8">
                <Dog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-body">No saved dogs found.</p>
                <Link 
                  href="/book" 
                  className="btn-primary inline-block mt-4"
                >
                  Add Your First Dog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedDogs.map((dog) => (
                  <div 
                    key={dog.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedDog?.id === dog.id
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedDog(dog);
                      setFormData(prev => ({ ...prev, dogId: dog.id }));
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-heading text-black text-lg">{dog.name}</h3>
                        <p className="text-gray-600 font-body">{dog.breed}</p>
                        <p className="text-sm text-gray-500 font-body">
                          {dog.age} • {dog.weight}
                        </p>
                      </div>
                      {selectedDog?.id === dog.id && (
                        <CheckCircle className="h-5 w-5 text-cyan-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedDog && (
            <>
              {/* Dog Details & Edit Option */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading text-black">
                    Booking for {selectedDog.name}
                  </h2>
                  <Link 
                    href={`/dashboard/dogs/${selectedDog.id}/edit`}
                    className="text-cyan-500 hover:text-cyan-600 font-body text-sm flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Update Details
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-body">Temperament:</span>
                    <span className="ml-2 font-body">{selectedDog.temperament}</span>
                  </div>
                  {selectedDog.medicalNeeds && (
                    <div>
                      <span className="text-gray-600 font-body">Medical Needs:</span>
                      <span className="ml-2 font-body">{selectedDog.medicalNeeds}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="card p-6">
                <h2 className="text-xl font-heading text-black mb-4">Select Dates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-body font-medium mb-2">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-body font-medium mb-2">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                      min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="card p-6">
                <h2 className="text-xl font-heading text-black mb-4">Additional Services</h2>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-heading text-black">{service.name}</h3>
                        <p className="text-gray-600 font-body text-sm">{service.description}</p>
                        <p className="text-cyan-600 font-body font-medium">${service.price} per {service.unit}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleServiceQuantityChange(service.id, (formData.services[service.id] || 0) - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-body">
                          {formData.services[service.id] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleServiceQuantityChange(service.id, (formData.services[service.id] || 0) + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div className="card p-6">
                <h2 className="text-xl font-heading text-black mb-4">Special Requests</h2>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Any special instructions or requests for this stay..."
                  rows={4}
                  className="input-field"
                />
              </div>

              {/* Summary & Submit */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading text-black">Booking Summary</h2>
                  <div className="text-right">
                    <div className="text-2xl font-heading text-black">${totalPrice}</div>
                    <div className="text-sm text-gray-600 font-body">Total Cost</div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !selectedDog || !formData.checkInDate || !formData.checkOutDate}
                  className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Confirm Booking
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}