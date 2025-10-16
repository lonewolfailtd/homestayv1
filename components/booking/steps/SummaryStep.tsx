'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, User, Dog, Calendar, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryStepProps {
  formData: any;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  updateFormData?: (data: any) => void;
}

export default function SummaryStep({ formData, isSubmitting, setIsSubmitting, updateFormData }: SummaryStepProps) {
  const [agreed, setAgreed] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Calculate pricing when component mounts or service selections change
  useEffect(() => {
    const calculatePricing = async () => {
      if (!formData.checkIn || !formData.checkOut || !updateFormData) return;
      
      setPricingLoading(true);
      try {
        const response = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            isEntireDog: formData.isEntireDog || false,
            selectedServices: Object.keys(formData.selectedServices || {}),
            numberOfMeals: formData.selectedServices?.RAW_MEAL || 0,
            numberOfWalks: formData.selectedServices?.PACK_WALK || 0,
          }),
        });

        const result = await response.json();
        if (result.success) {
          updateFormData({ pricing: result });
        }
      } catch (error) {
        console.error('Error calculating pricing:', error);
      } finally {
        setPricingLoading(false);
      }
    };

    // Only calculate if we don't already have pricing data
    if (!formData.pricing) {
      calculatePricing();
    }
  }, [formData.checkIn, formData.checkOut, formData.selectedServices, formData.isEntireDog, formData.pricing]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTotalDays = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getSelectedServices = () => {
    if (!formData.selectedServices) return [];
    
    const services = [
      { id: 'FULL_WASH', name: 'Full Wash & Conditioner', price: 40 },
      { id: 'NAIL_CLIP', name: 'Nail Clipping', price: 10 },
      { id: 'PACK_WALK', name: 'Adventure Pack Walks', price: 30 },
      { id: 'WALK_ASSESSMENT', name: 'Pre Walk Assessment', price: 60 },
      { id: 'RECALL_TRAINING', name: 'Recall Training', price: 150 },
      { id: 'OBEDIENCE_TRAINING', name: 'Obedience Training', price: 150 },
      { id: 'RAW_MEAL', name: 'Balanced Raw Meal', price: 5 },
    ];

    return services
      .filter(service => formData.selectedServices[service.id] > 0)
      .map(service => ({
        ...service,
        quantity: formData.selectedServices[service.id],
        total: service.price * formData.selectedServices[service.id],
      }));
  };

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert selected services to the format expected by the API
      const selectedServices = getSelectedServices().map(service => ({
        name: service.name,
        quantity: service.quantity,
        unitPrice: service.price,
        total: service.total,
      }));

      const bookingData = {
        // Customer info
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelation: formData.emergencyRelation,
        
        // Dog info
        dogName: formData.dogName,
        dogAge: parseInt(formData.dogAge),
        dogSex: formData.dogSex,
        dogBreed: formData.dogBreed,
        vaccinated: formData.vaccinated,
        neutered: formData.neutered,
        vetClinic: formData.vetClinic,
        vetPhone: formData.vetPhone,
        medications: formData.medications,
        medicalConditions: formData.medicalConditions,
        crateTrained: formData.crateTrained,
        socialLevel: formData.socialLevel,
        peopleBehavior: formData.peopleBehavior,
        behavioralIssues: formData.behavioralIssues,
        farmAnimalReactive: formData.farmAnimalReactive,
        biteHistory: formData.biteHistory,
        additionalNotes: formData.additionalNotes,
        
        // Booking details
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        boardingType: 'standard',
        isEntireDog: formData.isEntireDog || false,
        selectedServices: Object.keys(formData.selectedServices || {}),
        
        // Enhanced pricing data
        numberOfMeals: formData.selectedServices?.RAW_MEAL || 0,
        numberOfWalks: formData.selectedServices?.PACK_WALK || 0,
        
        // Special instructions
        specialInstructions: formData.additionalNotes || '',
      };

      const response = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      setSubmitResult(result);
      
      if (result.success) {
        toast.success('Booking confirmed! Check your email for details.');
      } else {
        toast.error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking. Please try again.');
      setSubmitResult({ error: 'Failed to submit booking. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message
  if (submitResult?.success) {
    return (
      <div className="text-center max-w-2xl mx-auto">
        <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-heading text-black mb-4">
          Booking Confirmed! 🎉
        </h2>
        
        <p className="text-lg text-gray-600 font-body mb-8">
          Thank you for choosing 100% K9! We've sent confirmation details to your email.
        </p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 text-left mb-8">
          <h3 className="font-button font-semibold text-black mb-4">Booking Details</h3>
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-medium">{submitResult.booking?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dog:</span>
              <span className="font-medium">{formData.dogName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium">{formatDate(formData.checkIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium">{formatDate(formData.checkOut)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-2 mt-2">
              <span>Total:</span>
              <span>${formData.pricing?.totalPrice}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href="/dashboard"
            className="btn-primary inline-block px-8 py-3"
          >
            View in Dashboard
          </a>
          
          {submitResult.integrations?.invoiceUrl && (
            <div>
              <a
                href={submitResult.integrations.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-block px-8 py-3 ml-4"
              >
                View Invoice
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-heading text-black mb-2">Review & Confirm</h2>
        <p className="text-gray-600 font-body">
          Please review all details before confirming your booking.
        </p>
      </div>

      <div className="space-y-8">
        {/* Customer Details */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-600" />
            Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-body">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{formData.firstName} {formData.lastName}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{formData.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{formData.phone}</span>
            </div>
            <div>
              <span className="text-gray-600">Emergency Contact:</span>
              <span className="ml-2 font-medium">{formData.emergencyName} ({formData.emergencyPhone})</span>
            </div>
          </div>
        </div>

        {/* Dog Details */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <Dog className="h-5 w-5 mr-2 text-purple-600" />
            Dog Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-body">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{formData.dogName}</span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 font-medium">{formData.dogAge} years</span>
            </div>
            <div>
              <span className="text-gray-600">Breed:</span>
              <span className="ml-2 font-medium">{formData.dogBreed}</span>
            </div>
            <div>
              <span className="text-gray-600">Sex:</span>
              <span className="ml-2 font-medium">{formData.dogSex}</span>
            </div>
            <div>
              <span className="text-gray-600">Vaccinated:</span>
              <span className="ml-2 font-medium">{formData.vaccinated}</span>
            </div>
            <div>
              <span className="text-gray-600">Social Level:</span>
              <span className="ml-2 font-medium">{formData.socialLevel}</span>
            </div>
            {formData.isEntireDog && (
              <div className="md:col-span-2">
                <span className="text-amber-600 font-medium">⚠️ Entire Dog Surcharge Applied (+$5/day)</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Booking Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 font-body">Check-in</div>
                <div className="font-button font-medium text-black">
                  {formatDate(formData.checkIn)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 font-body">Check-out</div>
                <div className="font-button font-medium text-black">
                  {formatDate(formData.checkOut)}
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 font-body">Total Stay</div>
              <div className="font-button font-medium text-purple-600 text-2xl">
                {getTotalDays()} {getTotalDays() === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        {getSelectedServices().length > 0 && (
          <div className="form-section">
            <h3 className="text-lg font-button font-semibold text-black mb-4">
              Additional Services
            </h3>
            <div className="space-y-2">
              {getSelectedServices().map((service, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div>
                    <span className="font-body text-gray-700">{service.name}</span>
                    <span className="text-gray-500 font-body text-sm ml-2">× {service.quantity}</span>
                  </div>
                  <span className="font-button font-medium">${service.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        {pricingLoading ? (
          <div className="form-section">
            <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
              Pricing Summary
            </h3>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-2" />
              <span className="font-body text-gray-600">Calculating final pricing...</span>
            </div>
          </div>
        ) : formData.pricing && (
          <div className="form-section">
            <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
              Pricing Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-body text-gray-700">
                  Base Stay ({formData.pricing.totalDays} days × ${formData.pricing.baseDailyRate})
                </span>
                <span className="font-button font-medium">${formData.pricing.baseSubtotal}</span>
              </div>
              
              {formData.pricing.isPeakPeriod && (
                <div className="flex justify-between">
                  <span className="font-body text-amber-700">
                    Peak Period Surcharge ({formData.pricing.peakPeriodName})
                  </span>
                  <span className="font-button font-medium text-amber-700">
                    +${formData.pricing.peakSurcharge}
                  </span>
                </div>
              )}
              
              {formData.pricing.dogSurcharges > 0 && (
                <div className="flex justify-between">
                  <span className="font-body text-gray-700">Entire Dog Surcharge</span>
                  <span className="font-button font-medium">+${formData.pricing.dogSurcharges}</span>
                </div>
              )}
              
              {formData.pricing.serviceCharges > 0 && (
                <div className="flex justify-between">
                  <span className="font-body text-gray-700">Additional Services</span>
                  <span className="font-button font-medium">+${formData.pricing.serviceCharges}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-button font-semibold text-black text-lg">Total</span>
                  <span className="font-button font-semibold text-black text-xl">
                    ${formData.pricing.totalPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-button font-medium text-blue-800 mb-2">Payment Information</h4>
              <div className="text-sm font-body text-blue-700">
                {getTotalDays() > 21 ? (
                  <div className="space-y-1">
                    <div>• Deposit (50%): ${(formData.pricing.totalPrice * 0.5).toFixed(2)} - Due immediately upon booking</div>
                    <div>• Balance (50%): ${(formData.pricing.totalPrice * 0.5).toFixed(2)} - Due 3 weeks before check-in</div>
                    <div className="text-xs text-blue-600 mt-2">You'll receive separate invoices for each payment.</div>
                  </div>
                ) : (
                  <div>
                    <div>• Full payment: ${formData.pricing.totalPrice} - Due immediately upon booking</div>
                    <div className="text-xs text-blue-600 mt-2">Payment required within 3 weeks of check-in.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="form-section">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-button font-semibold text-black mb-4">Terms & Conditions</h4>
            <div className="text-sm font-body text-gray-700 space-y-2 mb-4">
              <p>• All bookings require a deposit to secure your reservation</p>
              <p>• Cancellations made 7+ days before check-in are eligible for refund minus deposit</p>
              <p>• Dogs must be up-to-date with vaccinations and flea/worm treatment</p>
              <p>• We reserve the right to refuse service for aggressive or unsafe dogs</p>
              <p>• Additional services can be added during the stay and will be billed separately</p>
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm font-body text-gray-700">
                I agree to the terms and conditions, cancellation policy, and understand that a deposit is required to secure this booking.
              </label>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {submitResult?.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-button font-medium text-red-800">Booking Failed</h4>
                <p className="text-sm text-red-700 font-body mt-1">{submitResult.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!agreed || isSubmitting}
            className={`
              px-8 py-4 rounded-xl font-button font-semibold text-lg transition-colors
              ${!agreed || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
              }
            `}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing Booking...
              </div>
            ) : (
              'Confirm Booking'
            )}
          </button>
          
          {!agreed && (
            <p className="text-sm text-gray-500 font-body mt-2">
              Please agree to the terms and conditions to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}