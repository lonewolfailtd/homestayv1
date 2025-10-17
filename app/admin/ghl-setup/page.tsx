'use client';

import { useState } from 'react';
import { Settings, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function GHLSetupPage() {
  const [loading, setLoading] = useState(false);
  const [setupResults, setSetupResults] = useState<any>(null);
  const [existingFields, setExistingFields] = useState<any>(null);

  const handleSetupFields = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup-ghl-fields', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSetupResults(result.results);
        setExistingFields(result.existingFields);
        toast.success('GoHighLevel custom fields setup completed!');
      } else {
        toast.error(result.error || 'Failed to setup custom fields');
      }
    } catch (error) {
      console.error('Error setting up fields:', error);
      toast.error('Failed to setup custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFields = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup-ghl-fields', {
        method: 'GET',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setExistingFields(result.fields);
        toast.success('Fetched existing fields');
      } else {
        toast.error(result.error || 'Failed to fetch fields');
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      toast.error('Failed to fetch fields');
    } finally {
      setLoading(false);
    }
  };

  const testBookingSubmission = async () => {
    // Create a test booking to verify the integration
    const testData = {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@100percentk9.co.nz',
      phone: '+64 9 123 4567',
      address: '123 Test Street',
      city: 'Auckland',
      postalCode: '1010',
      emergencyName: 'Emergency Contact',
      emergencyPhone: '+64 9 765 4321',
      emergencyRelation: 'Partner',
      dogName: 'Test Dog',
      dogAge: 5,
      dogSex: 'Male',
      dogBreed: 'Golden Retriever',
      vaccinated: 'yes',
      neutered: 'yes',
      vetClinic: 'Test Vet Clinic',
      vetPhone: '+64 9 111 2222',
      medications: 'None',
      medicalConditions: 'None',
      crateTrained: 'yes',
      socialLevel: 'very social',
      peopleBehavior: 'friendly',
      behavioralIssues: 'None',
      farmAnimalReactive: 'no',
      biteHistory: 'no',
      additionalNotes: 'Test booking for GoHighLevel integration',
      checkIn: '2025-11-01',
      checkOut: '2025-11-05',
      boardingType: 'standard',
      isEntireDog: false,
      selectedServices: [],
      numberOfMeals: 0,
      numberOfWalks: 0,
    };

    try {
      setLoading(true);
      const response = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test booking created successfully! Check GoHighLevel for custom field data.');
      } else {
        toast.error(result.error || 'Test booking failed');
      }
    } catch (error) {
      console.error('Error creating test booking:', error);
      toast.error('Test booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-cyan-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Settings className="h-8 w-8 text-cyan-600" />
          </div>
          <h1 className="text-3xl font-heading text-black mb-2">
            GoHighLevel Integration Setup
          </h1>
          <p className="text-gray-600 font-body">
            Manage custom fields and test the integration with GoHighLevel CRM
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleFetchFields}
            disabled={loading}
            className="card p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <RefreshCw className={`h-8 w-8 text-blue-600 mx-auto mb-3 ${loading ? 'animate-spin' : ''}`} />
            <h3 className="font-button font-semibold text-black mb-2">Fetch Existing Fields</h3>
            <p className="text-sm text-gray-600">Check what custom fields already exist in GoHighLevel</p>
          </button>

          <button
            onClick={handleSetupFields}
            disabled={loading}
            className="card p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CheckCircle className={`h-8 w-8 text-green-600 mx-auto mb-3 ${loading ? 'animate-pulse' : ''}`} />
            <h3 className="font-button font-semibold text-black mb-2">Create Custom Fields</h3>
            <p className="text-sm text-gray-600">Create all required custom fields for dog profiles</p>
          </button>

          <button
            onClick={testBookingSubmission}
            disabled={loading}
            className="card p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
          >
            <AlertTriangle className={`h-8 w-8 text-amber-600 mx-auto mb-3 ${loading ? 'animate-bounce' : ''}`} />
            <h3 className="font-button font-semibold text-black mb-2">Test Integration</h3>
            <p className="text-sm text-gray-600">Create a test booking to verify custom field sync</p>
          </button>
        </div>

        {/* Existing Fields */}
        {existingFields && (
          <div className="card mb-8">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-heading text-black">Existing Custom Fields</h2>
            </div>
            <div className="p-6">
              <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-auto">
                {JSON.stringify(existingFields, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Setup Results */}
        {setupResults && (
          <div className="card">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-heading text-black">Setup Results</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {setupResults.map((result: any, index: number) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-button font-medium text-black">{result.name}</div>
                        <div className="text-sm text-gray-600">{result.fieldType}</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      {result.success ? (
                        <span className="text-green-600">✓ Created</span>
                      ) : (
                        <span className="text-red-600">Failed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="font-button font-semibold text-blue-800 mb-2">Setup Instructions</h3>
          <div className="text-sm font-body text-blue-700 space-y-2">
            <p>1. <strong>Fetch Existing Fields:</strong> Check what custom fields are already in your GoHighLevel account</p>
            <p>2. <strong>Create Custom Fields:</strong> Add all required custom fields for dog boarding profiles</p>
            <p>3. <strong>Test Integration:</strong> Create a test booking to verify that all custom field data is being synced</p>
            <p>4. Check your GoHighLevel contact records to see the custom field data</p>
          </div>
        </div>
      </div>
    </div>
  );
}