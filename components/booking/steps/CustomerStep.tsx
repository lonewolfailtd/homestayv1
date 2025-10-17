'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, UserPlus } from 'lucide-react';
import { useFormContext } from '../FormContext';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';

interface CustomerStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  nextStep: () => void;
}

export default function CustomerStep({ formData, updateFormData, nextStep }: CustomerStepProps) {
  const { user } = useFormContext();
  const [customerData, setCustomerData] = useState({
    firstName: formData.firstName || user?.firstName || '',
    lastName: formData.lastName || user?.lastName || '',
    email: formData.email || user?.emailAddresses?.[0]?.emailAddress || '',
    phone: formData.phone || '',
    address: formData.address || '',
    city: formData.city || '',
    postalCode: formData.postalCode || '',
    emergencyName: formData.emergencyName || '',
    emergencyPhone: formData.emergencyPhone || '',
    emergencyRelation: formData.emergencyRelation || 'Partner',
  });

  // Auto-populate user data on mount
  useEffect(() => {
    if (user && !formData.firstName) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
      };
      setCustomerData(prev => ({ ...prev, ...userData }));
      updateFormData(userData);
    }
  }, [user, formData.firstName, updateFormData]);

  // Fetch user preferences for emergency contact
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (user && !formData.emergencyName) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.preferences?.default_emergency_contact) {
              const emergencyData = {
                emergencyName: data.preferences.default_emergency_contact.name || '',
                emergencyPhone: data.preferences.default_emergency_contact.phone || '',
                emergencyRelation: data.preferences.default_emergency_contact.relation || 'Partner',
              };
              setCustomerData(prev => ({ ...prev, ...emergencyData }));
              updateFormData(emergencyData);
            }
          }
        } catch (error) {
          console.log('Could not fetch user preferences:', error);
        }
      }
    };

    fetchUserPreferences();
  }, [user, formData.emergencyName, updateFormData]);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...customerData, [field]: value };
    setCustomerData(newData);
    updateFormData(newData);
  };

  const handleAddressChange = (address: string, addressComponents?: {
    city?: string;
    postalCode?: string;
    country?: string;
  }) => {
    const newData = { 
      ...customerData, 
      address,
      // Auto-populate city and postal code if provided
      ...(addressComponents?.city && { city: addressComponents.city }),
      ...(addressComponents?.postalCode && { postalCode: addressComponents.postalCode })
    };
    setCustomerData(newData);
    updateFormData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const isValid = () => {
    return (
      customerData.firstName &&
      customerData.email &&
      customerData.phone &&
      customerData.emergencyName &&
      customerData.emergencyPhone
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-cyan-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <User className="h-8 w-8 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-heading text-black mb-2">Your Contact Details</h2>
        <p className="text-gray-600 font-body">
          We'll use this information for booking confirmations and emergency contact.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-cyan-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={customerData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="input-field"
                placeholder="Your first name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={customerData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="input-field"
                placeholder="Your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input-field"
                placeholder="your.email@example.com"
                disabled={!!user?.emailAddresses?.[0]?.emailAddress}
              />
              {user?.emailAddresses?.[0]?.emailAddress && (
                <p className="text-xs text-gray-500 mt-1 font-body">Email from your account</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={customerData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="input-field"
                placeholder="+64 21 123 4567"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-cyan-600" />
            Address Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <GooglePlacesAutocomplete
                value={customerData.address}
                onChange={handleAddressChange}
                placeholder="Start typing your address..."
                className="input-field"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={customerData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="input-field"
                  placeholder="Auckland"
                />
              </div>
              
              <div>
                <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={customerData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="input-field"
                  placeholder="1010"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-cyan-600" />
            Emergency Contact *
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerData.emergencyName}
                  onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  className="input-field"
                  placeholder="Emergency contact name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={customerData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  className="input-field"
                  placeholder="+64 21 123 4567"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                required
                value={customerData.emergencyRelation}
                onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                className="input-field"
              >
                <option value="Partner">Partner</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Relative">Other Relative</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form validation message */}
        {!isValid() && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-700 text-sm font-body">
              Please fill in all required fields (*) to continue.
            </p>
          </div>
        )}

        {/* Hidden submit button for form submission */}
        <button type="submit" className="hidden" />
      </form>
    </div>
  );
}