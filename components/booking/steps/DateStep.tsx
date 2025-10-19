'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import InteractiveCalendar from '../InteractiveCalendar';

interface DateStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  nextStep: () => void;
}

export default function DateStep({ formData, updateFormData, nextStep }: DateStepProps) {
  const [dateData, setDateData] = useState({
    checkIn: formData.checkIn || '',
    checkOut: formData.checkOut || '',
  });
  
  const [pricing, setPricing] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleDateChange = (dates: { checkIn: string; checkOut: string }) => {
    const newData = { ...dateData, ...dates };
    setDateData(newData);
    updateFormData(newData);
    
    // Calculate pricing when both dates are selected
    if (dates.checkIn && dates.checkOut) {
      calculatePricing(dates.checkIn, dates.checkOut);
    }
  };

  const calculatePricing = async (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return;

    setIsCalculating(true);
    try {
      if (formData.isMultiDogBooking && formData.dogs && formData.dogs.length > 0) {
        // Multi-dog booking: calculate pricing for each dog
        const dogPricings = await Promise.all(
          formData.dogs.map(async (dog: any) => {
            const response = await fetch('/api/pricing/calculate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                checkIn,
                checkOut,
                isEntireDog: dog.isEntireDog || false,
                selectedServices: formData.selectedServices || [],
                numberOfMeals: formData.numberOfMeals || 0,
                numberOfWalks: formData.numberOfWalks || 0,
              }),
            });
            const data = await response.json();
            return { ...data, dogName: dog.dogName };
          })
        );

        // Calculate combined totals
        const combinedPricing = {
          totalDays: dogPricings[0].totalDays,
          baseDailyRate: dogPricings[0].baseDailyRate,
          baseSubtotal: dogPricings.reduce((sum, p) => sum + parseFloat(p.baseSubtotal || 0), 0).toFixed(2),
          peakSurcharge: dogPricings.reduce((sum, p) => sum + parseFloat(p.peakSurcharge || 0), 0).toFixed(2),
          dogSurcharges: dogPricings.reduce((sum, p) => sum + parseFloat(p.dogSurcharges || 0), 0).toFixed(2),
          serviceCharges: dogPricings.reduce((sum, p) => sum + parseFloat(p.serviceCharges || 0), 0).toFixed(2),
          totalPrice: dogPricings.reduce((sum, p) => sum + parseFloat(p.totalPrice || 0), 0).toFixed(2),
          isPeakPeriod: dogPricings[0].isPeakPeriod,
          peakPeriodName: dogPricings[0].peakPeriodName,
          breakdown: {
            services: dogPricings[0].breakdown?.services || [],
          },
          isMultiDog: true,
          dogPricings: dogPricings, // Store individual dog pricings
        };

        setPricing(combinedPricing);
        updateFormData({ pricing: combinedPricing });
      } else {
        // Single dog booking
        const response = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkIn,
            checkOut,
            isEntireDog: formData.isEntireDog || false,
            selectedServices: formData.selectedServices || [],
            numberOfMeals: formData.numberOfMeals || 0,
            numberOfWalks: formData.numberOfWalks || 0,
          }),
        });

        const data = await response.json();
        setPricing(data);
        updateFormData({ pricing: data });
      }
    } catch (error) {
      console.error('Error calculating pricing:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getTotalDays = () => {
    if (!dateData.checkIn || !dateData.checkOut) return 0;
    const checkIn = new Date(dateData.checkIn);
    const checkOut = new Date(dateData.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isValid = () => {
    return dateData.checkIn && dateData.checkOut && getTotalDays() > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid()) {
      nextStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-cyan-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Calendar className="h-8 w-8 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-heading text-black mb-2">Select Your Dates</h2>
        <p className="text-gray-600 font-body">
          Choose your check-in and check-out dates. We'll automatically calculate pricing including any peak period surcharges.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Interactive Calendar */}
        <div className="form-section">
          <InteractiveCalendar
            selectedDates={dateData}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Selected Dates Summary */}
        {(dateData.checkIn || dateData.checkOut) && (
          <div className="form-section">
            <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-cyan-600" />
              Booking Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-body text-gray-600 mb-1">Check-in</div>
                  <div className="font-button font-medium text-black">
                    {dateData.checkIn ? formatDate(dateData.checkIn) : 'Not selected'}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-body text-gray-600 mb-1">Check-out</div>
                  <div className="font-button font-medium text-black">
                    {dateData.checkOut ? formatDate(dateData.checkOut) : 'Not selected'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-cyan-50 rounded-xl p-4">
                  <div className="text-sm font-body text-gray-600 mb-1">Total Days</div>
                  <div className="font-button font-medium text-cyan-600 text-2xl">
                    {getTotalDays()} {getTotalDays() === 1 ? 'day' : 'days'}
                  </div>
                </div>
                
                {pricing && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-sm font-body text-gray-600 mb-1">
                      {pricing.isMultiDog ? `Total for ${pricing.dogPricings.length} Dogs` : 'Base Stay Cost'}
                    </div>
                    <div className="font-button font-medium text-green-600 text-2xl">
                      ${pricing.baseSubtotal}
                    </div>
                    {pricing.isMultiDog && (
                      <div className="text-xs text-gray-600 font-body mt-1">
                        {pricing.dogPricings.map((dp: any) => dp.dogName).join(', ')}
                      </div>
                    )}
                    {pricing.isPeakPeriod && (
                      <div className="text-xs text-amber-600 font-body mt-1">
                        +${pricing.peakSurcharge} peak period
                      </div>
                    )}
                    <div className="text-xs text-gray-500 font-body mt-1">
                      Final total with services shown below
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Pricing Breakdown - Moved to End */}
        {pricing && (
          <div className="form-section">
            <h3 className="text-lg font-button font-semibold text-black mb-6">
              Complete Pricing Breakdown
            </h3>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              {/* Multi-Dog Breakdown */}
              {pricing.isMultiDog && pricing.dogPricings && (
                <div className="space-y-2 mb-6">
                  <h4 className="font-button font-medium text-gray-800 border-b border-gray-100 pb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-cyan-600" />
                    Individual Dog Pricing ({pricing.dogPricings.length} dogs)
                  </h4>
                  {pricing.dogPricings.map((dogPricing: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 my-2">
                      <div className="font-button font-semibold text-black mb-2">
                        {dogPricing.dogName}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="font-body text-gray-600">Base Stay</span>
                          <span className="font-button">${dogPricing.baseSubtotal}</span>
                        </div>
                        {parseFloat(dogPricing.peakSurcharge) > 0 && (
                          <div className="flex justify-between">
                            <span className="font-body text-amber-600">Peak Surcharge</span>
                            <span className="font-button text-amber-600">+${dogPricing.peakSurcharge}</span>
                          </div>
                        )}
                        {parseFloat(dogPricing.dogSurcharges) > 0 && (
                          <div className="flex justify-between">
                            <span className="font-body text-gray-600">Entire Dog</span>
                            <span className="font-button">+${dogPricing.dogSurcharges}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                          <span className="font-button text-gray-800">Dog Total</span>
                          <span className="font-button text-gray-800">${dogPricing.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Base Accommodation */}
              <div className="space-y-2">
                <h4 className="font-button font-medium text-gray-800 border-b border-gray-100 pb-2">
                  {pricing.isMultiDog ? 'Combined Accommodation Total' : 'Accommodation'}
                </h4>
                <div className="flex justify-between items-center py-2">
                  <span className="font-body text-gray-700">
                    Base Stay ({pricing.totalDays} days × ${pricing.baseDailyRate}/day{pricing.isMultiDog ? ` × ${pricing.dogPricings.length} dogs` : ''})
                  </span>
                  <span className="font-button font-medium">${pricing.baseSubtotal}</span>
                </div>
                
                {pricing.isPeakPeriod && (
                  <div className="flex justify-between items-center py-2">
                    <span className="font-body text-amber-700">
                      Peak Period Surcharge - {pricing.peakPeriodName} (+20%)
                    </span>
                    <span className="font-button font-medium text-amber-700">+${pricing.peakSurcharge}</span>
                  </div>
                )}
                
                {pricing.dogSurcharges > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="font-body text-gray-700">Entire Dog Surcharge</span>
                    <span className="font-button font-medium">+${pricing.dogSurcharges}</span>
                  </div>
                )}
              </div>

              {/* Additional Services */}
              {pricing.breakdown?.services && pricing.breakdown.services.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-button font-medium text-gray-800 border-b border-gray-100 pb-2">
                    Additional Services
                  </h4>
                  {pricing.breakdown.services.map((service: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span className="font-body text-gray-700">
                        {service.name} {service.quantity > 1 && `(${service.quantity} × $${service.unitPrice})`}
                      </span>
                      <span className="font-button font-medium">+${service.total}</span>
                    </div>
                  ))}
                  {/* Total Additional Services */}
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-button font-medium text-gray-800">Total Additional Services</span>
                      <span className="font-button font-medium">+${pricing.serviceCharges || pricing.breakdown.services.reduce((sum: number, service: any) => sum + service.total, 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center py-2">
                  <span className="font-button font-medium text-gray-800">Subtotal (excl. GST)</span>
                  <span className="font-button font-medium">${(pricing.totalPrice / 1.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-body text-gray-700">GST (15%)</span>
                  <span className="font-button font-medium">${(pricing.totalPrice - (pricing.totalPrice / 1.15)).toFixed(2)}</span>
                </div>
              </div>
              
              {/* Final Total */}
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-button font-semibold text-black text-xl">Total (incl. GST)</span>
                  <span className="font-button font-semibold text-black text-xl">
                    ${pricing.totalPrice}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-button font-medium text-blue-800 mb-2">Payment Schedule</h4>
              <div className="text-sm font-body text-blue-700 space-y-1">
                {getTotalDays() > 21 ? (
                  <>
                    <div>• Deposit (50%): ${(pricing.totalPrice * 0.5).toFixed(2)} - Due immediately</div>
                    <div>• Balance (50%): ${(pricing.totalPrice * 0.5).toFixed(2)} - Due 3 weeks before check-in</div>
                  </>
                ) : (
                  <div>• Full payment: ${pricing.totalPrice} - Due immediately</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {pricing?.warnings && pricing.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-button font-medium text-amber-800 mb-2">Important Notes</h4>
                {pricing.warnings.map((warning: string, index: number) => (
                  <div key={index} className="text-sm text-amber-700 font-body">
                    • {warning}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Validation Message */}
        {!isValid() && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-button font-medium text-red-800">Please Select Your Dates</h4>
                <p className="text-sm text-red-700 font-body mt-1">
                  You need to select both check-in and check-out dates to continue.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isValid() && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-button font-medium text-green-800">Dates Selected Successfully</h4>
                <p className="text-sm text-green-700 font-body mt-1">
                  Great! Your dates are available. Continue to select additional services.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isCalculating && (
          <div className="text-center py-4">
            <div className="inline-flex items-center text-cyan-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600 mr-2"></div>
              <span className="font-body text-sm">Calculating pricing...</span>
            </div>
          </div>
        )}

        {/* Hidden submit button for form submission */}
        <button type="submit" className="hidden" />
      </form>
    </div>
  );
}