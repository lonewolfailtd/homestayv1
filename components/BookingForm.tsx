'use client';

import { useState } from 'react';

interface FormData {
  customerType: 'new' | 'existing';
  // Customer fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  // Dog fields
  dogName: string;
  dogAge: number;
  dogSex: string;
  dogBreed: string;
  vaccinated: string;
  neutered: string;
  vetClinic: string;
  vetPhone: string;
  medications: string;
  medicalConditions: string;
  crateTrained: string;
  socialLevel: string;
  peopleBehavior: string;
  behavioralIssues: string;
  farmAnimalReactive: string;
  biteHistory: string;
  additionalNotes: string;
  // Booking fields
  checkIn: string;
  checkOut: string;
  boardingType: string;
  services: string[];
  specialInstructions: string;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
    customerType: 'new',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Partner',
    dogName: '',
    dogAge: 0,
    dogSex: 'Male',
    dogBreed: '',
    vaccinated: 'Yes',
    neutered: 'Yes',
    vetClinic: '',
    vetPhone: '',
    medications: '',
    medicalConditions: '',
    crateTrained: 'Yes',
    socialLevel: 'Great with dogs',
    peopleBehavior: '',
    behavioralIssues: 'None',
    farmAnimalReactive: 'No',
    biteHistory: 'No',
    additionalNotes: '',
    checkIn: '',
    checkOut: '',
    boardingType: 'standard',
    services: [],
    specialInstructions: '',
  });

  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, service]
        : prev.services.filter(s => s !== service)
    }));
  };

  const checkExistingCustomer = async (email: string) => {
    if (!email) return;
    
    try {
      const response = await fetch(`/api/customers?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.exists) {
        setExistingCustomer(data.customer);
      } else {
        setExistingCustomer(null);
      }
    } catch (error) {
      console.error('Error checking customer:', error);
    }
  };

  const calculatePricing = async () => {
    if (!formData.checkIn || !formData.checkOut) return;
    
    try {
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          boardingType: formData.boardingType,
          services: formData.services,
        }),
      });
      
      const data = await response.json();
      setPricing(data);
    } catch (error) {
      console.error('Error calculating pricing:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      setSubmitResult(result);
      
      if (result.success) {
        // Reset form on success
        // setFormData(/* reset to initial values */);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitResult({ error: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message
  if (submitResult?.success) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Booking Confirmed! 🎉</h2>
        <div className="space-y-3 text-green-700">
          <p><strong>Customer:</strong> {submitResult.customer.name}</p>
          <p><strong>Dog:</strong> {submitResult.dog.name}</p>
          <p><strong>Check-in:</strong> {new Date(submitResult.booking.checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> {new Date(submitResult.booking.checkOut).toLocaleDateString()}</p>
          <p><strong>Total Price:</strong> ${submitResult.booking.totalPrice}</p>
          
          {submitResult.integrations?.invoiceUrl && (
            <p>
              <strong>Invoice:</strong>{' '}
              <a 
                href={submitResult.integrations.invoiceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Invoice
              </a>
            </p>
          )}
          
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="font-semibold text-gray-800">Integration Status:</p>
            <p className="text-sm">GoHighLevel: {submitResult.integrations?.gohighlevel ? '✅ Updated' : '❌ Failed'}</p>
            <p className="text-sm">Xero Invoice: {submitResult.integrations?.xero ? '✅ Created' : '❌ Failed'}</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setSubmitResult(null);
            window.location.reload();
          }}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Book Another Stay
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Customer Type Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="new"
              checked={formData.customerType === 'new'}
              onChange={(e) => handleInputChange('customerType', e.target.value as 'new' | 'existing')}
              className="mr-2"
            />
            New Customer
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="existing"
              checked={formData.customerType === 'existing'}
              onChange={(e) => handleInputChange('customerType', e.target.value as 'new' | 'existing')}
              className="mr-2"
            />
            Existing Customer
          </label>
        </div>
      </div>

      {/* Email Field (always shown) */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => {
              handleInputChange('email', e.target.value);
              if (formData.customerType === 'existing') {
                checkExistingCustomer(e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Existing Customer Found Message */}
      {formData.customerType === 'existing' && existingCustomer && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            <strong>Found existing customer:</strong> {existingCustomer.firstName} {existingCustomer.lastName}
          </p>
          {existingCustomer.dogs?.length > 0 && (
            <p className="text-blue-700 text-sm mt-1">
              Dogs on file: {existingCustomer.dogs.map((dog: any) => dog.name).join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Full Customer Form (New Customer or if existing customer not found) */}
      {(formData.customerType === 'new' || (formData.customerType === 'existing' && !existingCustomer)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              required
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Emergency Contact */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Name *
            </label>
            <input
              type="text"
              required
              value={formData.emergencyName}
              onChange={(e) => handleInputChange('emergencyName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship *
            </label>
            <select
              required
              value={formData.emergencyRelation}
              onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Partner">Partner</option>
              <option value="Relative">Relative</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      )}

      {/* Dog Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Dog Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dog Name *
            </label>
            <input
              type="text"
              required
              value={formData.dogName}
              onChange={(e) => handleInputChange('dogName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              type="number"
              required
              min="0"
              max="30"
              value={formData.dogAge}
              onChange={(e) => handleInputChange('dogAge', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sex *
            </label>
            <select
              required
              value={formData.dogSex}
              onChange={(e) => handleInputChange('dogSex', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breed *
            </label>
            <input
              type="text"
              required
              value={formData.dogBreed}
              onChange={(e) => handleInputChange('dogBreed', e.target.value)}
              placeholder="e.g., Golden Retriever, Mixed Breed"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaccinated *
            </label>
            <select
              required
              value={formData.vaccinated}
              onChange={(e) => handleInputChange('vaccinated', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Booked in">Booked in</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Neutered *
            </label>
            <select
              required
              value={formData.neutered}
              onChange={(e) => handleInputChange('neutered', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Booked in">Booked in</option>
            </select>
          </div>
        </div>
      </div>

      {/* Health & Safety */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Health & Safety</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vet Clinic Name
            </label>
            <input
              type="text"
              value={formData.vetClinic}
              onChange={(e) => handleInputChange('vetClinic', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vet Phone Number
            </label>
            <input
              type="tel"
              value={formData.vetPhone}
              onChange={(e) => handleInputChange('vetPhone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Medications
            </label>
            <textarea
              rows={3}
              value={formData.medications}
              onChange={(e) => handleInputChange('medications', e.target.value)}
              placeholder="List any medications, dosages, and administration instructions"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Known Medical Conditions/Allergies
            </label>
            <textarea
              rows={3}
              value={formData.medicalConditions}
              onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
              placeholder="Please describe any medical conditions, allergies, or special needs"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Behavior Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Behavior Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crate Trained *
            </label>
            <select
              required
              value={formData.crateTrained}
              onChange={(e) => handleInputChange('crateTrained', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="In Training">In Training</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Level with Dogs *
            </label>
            <select
              required
              value={formData.socialLevel}
              onChange={(e) => handleInputChange('socialLevel', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Great with dogs">Great with dogs</option>
              <option value="Selective">Selective</option>
              <option value="Not social">Not social</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Behavior with New People *
            </label>
            <textarea
              rows={2}
              required
              value={formData.peopleBehavior}
              onChange={(e) => handleInputChange('peopleBehavior', e.target.value)}
              placeholder="How does your dog typically react to new people?"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Behavioral Issues *
            </label>
            <select
              required
              value={formData.behavioralIssues}
              onChange={(e) => handleInputChange('behavioralIssues', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="None">None</option>
              <option value="Aggression">Aggression</option>
              <option value="Reactivity">Reactivity</option>
              <option value="Anxiety">Anxiety</option>
              <option value="Resource Guarding">Resource Guarding</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reactive to Farm Animals/Cats *
            </label>
            <select
              required
              value={formData.farmAnimalReactive}
              onChange={(e) => handleInputChange('farmAnimalReactive', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bite History *
            </label>
            <select
              required
              value={formData.biteHistory}
              onChange={(e) => handleInputChange('biteHistory', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Behavior Notes
            </label>
            <textarea
              rows={3}
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Any additional information about your dog's behavior or needs"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Booking Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date *
            </label>
            <input
              type="date"
              required
              value={formData.checkIn}
              onChange={(e) => {
                handleInputChange('checkIn', e.target.value);
                if (formData.checkOut) {
                  setTimeout(calculatePricing, 100);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date *
            </label>
            <input
              type="date"
              required
              value={formData.checkOut}
              onChange={(e) => {
                handleInputChange('checkOut', e.target.value);
                if (formData.checkIn) {
                  setTimeout(calculatePricing, 100);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Boarding Type *
            </label>
            <select
              required
              value={formData.boardingType}
              onChange={(e) => {
                handleInputChange('boardingType', e.target.value);
                setTimeout(calculatePricing, 100);
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="standard">Standard Boarding</option>
              <option value="luxury">Luxury Boarding</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Services
            </label>
            <div className="space-y-2">
              {[
                { value: 'grooming', label: 'Grooming (+$30)' },
                { value: 'training', label: 'Training Session (+$25)' },
                { value: 'extraWalks', label: 'Extra Walks (+$15)' },
                { value: 'medicationAdmin', label: 'Medication Administration (+$10)' },
              ].map((service) => (
                <label key={service.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service.value)}
                    onChange={(e) => {
                      handleServiceChange(service.value, e.target.checked);
                      setTimeout(calculatePricing, 100);
                    }}
                    className="mr-2"
                  />
                  {service.label}
                </label>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              rows={3}
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special care instructions or requests"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      {pricing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Pricing Summary</h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>Duration:</strong> {pricing.totalDays} days</p>
            <p><strong>{pricing.breakdown.boarding}</strong></p>
            {pricing.breakdown.services && <p><strong>{pricing.breakdown.services}</strong></p>}
            <div className="border-t border-blue-300 pt-2 mt-3">
              <p className="text-xl font-bold">Total: ${pricing.totalPrice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting || !pricing}
          className={`px-8 py-4 text-white font-semibold rounded-lg transition-colors ${
            isSubmitting || !pricing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Book Boarding Stay'}
        </button>
      </div>

      {/* Error Message */}
      {submitResult?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{submitResult.error}</p>
        </div>
      )}
    </form>
  );
}