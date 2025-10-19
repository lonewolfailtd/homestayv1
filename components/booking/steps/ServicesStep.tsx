'use client';

import { useState, useEffect } from 'react';
import { Scissors, Footprints, GraduationCap, Utensils, Plus, Minus, AlertTriangle, Calendar } from 'lucide-react';

interface ServicesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  nextStep: () => void;
}

const serviceCategories = [
  {
    id: 'grooming',
    title: 'Grooming Services',
    icon: Scissors,
    color: 'cyan',
    services: [
      {
        id: 'FULL_WASH',
        name: 'Full Wash & Conditioner',
        price: 40,
        unit: 'per service',
        description: 'Professional wash and conditioning treatment',
        maxQuantity: 3,
      },
      {
        id: 'NAIL_CLIP',
        name: 'Nail Clipping',
        price: 10,
        unit: 'per service',
        description: 'Professional nail trimming and filing',
        maxQuantity: 2,
      },
    ],
  },
  {
    id: 'walks',
    title: 'Adventure Walks',
    icon: Footprints,
    color: 'green',
    services: [
      {
        id: 'PACK_WALK',
        name: 'Adventure Pack Walks',
        price: 30,
        unit: 'per walk',
        description: '4-hour outdoor adventure with structured freedom',
        requiresAssessment: true,
        maxQuantity: 10,
      },
      {
        id: 'WALK_ASSESSMENT',
        name: 'Pre Walk Assessment',
        price: 60,
        unit: 'per service',
        description: 'Required assessment for new adventure walk clients',
        maxQuantity: 1,
      },
    ],
  },
  {
    id: 'training',
    title: 'Training Services',
    icon: GraduationCap,
    color: 'blue',
    services: [
      {
        id: 'RECALL_TRAINING',
        name: 'Recall Training',
        price: 150,
        unit: 'per session',
        description: 'Reliable recall development and practice',
        maxQuantity: 3,
      },
      {
        id: 'OBEDIENCE_TRAINING',
        name: 'Obedience Training',
        price: 150,
        unit: 'per session',
        description: 'Essential commands and behavioral improvement',
        maxQuantity: 3,
      },
    ],
  },
  {
    id: 'food',
    title: 'Food Services',
    icon: Utensils,
    color: 'amber',
    services: [
      {
        id: 'RAW_MEAL',
        name: 'Balanced Raw Meal',
        price: 5,
        unit: 'per meal',
        description: 'Premium nutrition with fresh, high-quality ingredients',
        maxQuantity: 50,
      },
    ],
  },
];

export default function ServicesStep({ formData, updateFormData, nextStep }: ServicesStepProps) {
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>(
    formData.selectedServices || {}
  );
  const [weekdayWalks, setWeekdayWalks] = useState(formData.weekdayWalks || false);
  const [dailyMeals, setDailyMeals] = useState(formData.dailyMeals || false);

  // Calculate number of weekdays between check-in and check-out
  const getWeekdaysCount = () => {
    const checkInDate = formData.checkIn || formData.checkInDate;
    const checkOutDate = formData.checkOut || formData.checkOutDate;

    if (!checkInDate || !checkOutDate) return 0;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    let count = 0;

    const currentDate = new Date(checkIn);
    while (currentDate <= checkOut) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  };

  // Calculate total days for daily meals
  const getTotalDays = () => {
    const checkInDate = formData.checkIn || formData.checkInDate;
    const checkOutDate = formData.checkOut || formData.checkOutDate;

    if (!checkInDate || !checkOutDate) return 0;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both check-in and check-out days
  };

  // Update selected services when weekday walks toggle changes
  useEffect(() => {
    if (weekdayWalks) {
      const weekdaysCount = getWeekdaysCount();
      handleServiceChange('PACK_WALK', weekdaysCount);
    } else if (formData.weekdayWalks && !weekdayWalks) {
      // If toggling off, remove walks
      handleServiceChange('PACK_WALK', 0);
    }
    updateFormData({ weekdayWalks });
  }, [weekdayWalks]);

  // Update selected services when daily meals toggle changes
  useEffect(() => {
    if (dailyMeals) {
      const totalDays = getTotalDays();
      // 2 meals per day
      handleServiceChange('RAW_MEAL', totalDays * 2);
    } else if (formData.dailyMeals && !dailyMeals) {
      // If toggling off, remove meals
      handleServiceChange('RAW_MEAL', 0);
    }
    updateFormData({ dailyMeals });
  }, [dailyMeals]);

  const handleServiceChange = (serviceId: string, quantity: number) => {
    const newServices = { ...selectedServices };
    
    if (quantity <= 0) {
      delete newServices[serviceId];
    } else {
      newServices[serviceId] = quantity;
    }
    
    setSelectedServices(newServices);
    updateFormData({ selectedServices: newServices });
  };

  const getServiceTotal = () => {
    let total = 0;
    serviceCategories.forEach(category => {
      category.services.forEach(service => {
        const quantity = selectedServices[service.id] || 0;
        total += service.price * quantity;
      });
    });
    return total;
  };

  const hasPackWalksWithoutAssessment = () => {
    const hasPackWalks = selectedServices['PACK_WALK'] > 0;
    const hasAssessment = selectedServices['WALK_ASSESSMENT'] > 0;
    return hasPackWalks && !hasAssessment;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      cyan: 'bg-cyan-100 text-cyan-600 border-cyan-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      amber: 'bg-amber-100 text-amber-600 border-amber-200',
    };
    return colors[color as keyof typeof colors] || colors.cyan;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-cyan-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Plus className="h-8 w-8 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-heading text-black mb-2">Additional Services</h2>
        <p className="text-gray-600 font-body">
          Enhance your dog's stay with our premium services. All services are optional and can be added or removed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Service Categories */}
        {serviceCategories.map((category) => (
          <div key={category.id} className="form-section">
            <h3 className="text-lg font-button font-semibold text-black mb-6 flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${getColorClasses(category.color)}`}>
                <category.icon className="h-5 w-5" />
              </div>
              {category.title}
            </h3>

            {/* Weekday Walks Quick Toggle (only for walks category) */}
            {category.id === 'walks' && (formData.checkIn || formData.checkInDate) && (formData.checkOut || formData.checkOutDate) && getWeekdaysCount() > 0 && (
              <div className="mb-6 border-2 border-green-300 rounded-xl p-6 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <Calendar className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-button font-semibold text-black">
                        Weekday Walks (Mon-Fri)
                      </h4>
                      <p className="text-sm text-gray-600 font-body">
                        Automatically schedule walks for all weekdays ({getWeekdaysCount()} walks)
                      </p>
                      <p className="text-sm text-green-600 font-body mt-1">
                        ${30 * getWeekdaysCount()} total for {getWeekdaysCount()} weekday walks
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeekdayWalks(!weekdayWalks)}
                    className={`
                      relative inline-flex h-10 w-20 items-center rounded-full transition-colors touch-manipulation
                      ${weekdayWalks ? 'bg-green-600' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-8 w-8 transform rounded-full bg-white transition-transform
                        ${weekdayWalks ? 'translate-x-11' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                {weekdayWalks && getWeekdaysCount() > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 font-body">
                      ⚠️ Adventure Pack Walks require a Pre Walk Assessment for new clients
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Daily Meals Quick Toggle (only for food category) */}
            {category.id === 'food' && (formData.checkIn || formData.checkInDate) && (formData.checkOut || formData.checkOutDate) && getTotalDays() > 0 && (
              <div className="mb-6 border-2 border-amber-300 rounded-xl p-6 bg-amber-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <Calendar className="h-6 w-6 text-amber-600 mr-3" />
                    <div>
                      <h4 className="font-button font-semibold text-black">
                        Daily Meals (Every Day)
                      </h4>
                      <p className="text-sm text-gray-600 font-body">
                        2 balanced raw meals per day for entire stay ({getTotalDays()} days = {getTotalDays() * 2} meals)
                      </p>
                      <p className="text-sm text-amber-600 font-body mt-1">
                        ${5 * getTotalDays() * 2} total for {getTotalDays() * 2} meals
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDailyMeals(!dailyMeals)}
                    className={`
                      relative inline-flex h-10 w-20 items-center rounded-full transition-colors touch-manipulation
                      ${dailyMeals ? 'bg-amber-600' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-8 w-8 transform rounded-full bg-white transition-transform
                        ${dailyMeals ? 'translate-x-11' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.services.map((service) => {
                const quantity = selectedServices[service.id] || 0;
                const isSelected = quantity > 0;
                
                return (
                  <div
                    key={service.id}
                    className={`
                      border-2 rounded-xl p-6 transition-all cursor-pointer
                      ${isSelected 
                        ? 'border-cyan-300 bg-cyan-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-button font-semibold text-black mb-2">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600 font-body mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-button font-semibold text-cyan-600">
                            ${service.price}
                          </span>
                          <span className="text-sm text-gray-500 font-body">
                            {service.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleServiceChange(service.id, Math.max(0, quantity - 1))}
                          disabled={quantity <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          max={service.maxQuantity}
                          value={quantity}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            const clampedValue = Math.min(Math.max(0, newValue), service.maxQuantity);
                            handleServiceChange(service.id, clampedValue);
                          }}
                          className="w-16 text-center font-button font-medium border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                        
                        <button
                          type="button"
                          onClick={() => handleServiceChange(service.id, Math.min(service.maxQuantity, quantity + 1))}
                          disabled={quantity >= service.maxQuantity}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {quantity > 0 && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600 font-body">Total</div>
                          <div className="font-button font-semibold text-black">
                            ${(service.price * quantity).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Special Notes */}
                    {service.requiresAssessment && quantity > 0 && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700 font-body">
                          ⚠️ Requires Pre Walk Assessment for new clients
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Warning for Pack Walks without Assessment */}
        {hasPackWalksWithoutAssessment() && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-button font-medium text-amber-800">Assessment Required</h4>
                <p className="text-sm text-amber-700 font-body mt-1">
                  Adventure Pack Walks require a Pre Walk Assessment for new clients. 
                  We'll automatically add this to your booking.
                </p>
                <button
                  type="button"
                  onClick={() => handleServiceChange('WALK_ASSESSMENT', 1)}
                  className="mt-2 text-sm text-amber-700 underline hover:text-amber-800"
                >
                  Add Pre Walk Assessment (+$60)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services Summary */}
        {Object.keys(selectedServices).length > 0 && (
          <div className="form-section">
            <h3 className="text-lg font-button font-semibold text-black mb-4">
              Services Summary
            </h3>
            
            <div className="space-y-3">
              {serviceCategories.map(category =>
                category.services
                  .filter(service => selectedServices[service.id] > 0)
                  .map(service => {
                    const quantity = selectedServices[service.id];
                    return (
                      <div key={service.id} className="flex justify-between items-center py-2">
                        <div>
                          <span className="font-body text-gray-700">{service.name}</span>
                          <span className="text-gray-500 font-body text-sm ml-2">
                            × {quantity}
                          </span>
                        </div>
                        <span className="font-button font-medium">
                          ${(service.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-button font-semibold text-black">
                    Additional Services Total
                  </span>
                  <span className="font-button font-semibold text-black text-lg">
                    ${getServiceTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Services Selected */}
        {Object.keys(selectedServices).length === 0 && (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-button font-medium text-gray-600 mb-2">No Additional Services</h3>
            <p className="text-gray-500 font-body text-sm">
              You can continue without additional services or add them above.
            </p>
          </div>
        )}

        {/* Hidden submit button for form submission */}
        <button type="submit" className="hidden" />
      </form>
    </div>
  );
}