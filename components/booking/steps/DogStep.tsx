'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Dog, Heart, Shield, Activity, AlertTriangle, Star, Plus } from 'lucide-react';

interface SavedDog {
  id: string;
  isDefault: boolean;
  nickname?: string;
  notes?: string;
  dog: {
    id: string;
    name: string;
    age: number;
    sex: string;
    breed: string;
    vaccinated: string;
    neutered: string;
    vetClinic?: string;
    vetPhone?: string;
    medications?: string;
    medicalConditions?: string;
    crateTrained: string;
    socialLevel: string;
    peopleBehavior: string;
    behavioralIssues: string;
    farmAnimalReactive: string;
    biteHistory: string;
    additionalNotes?: string;
  };
}

interface DogStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  nextStep: () => void;
}

export default function DogStep({ formData, updateFormData, nextStep }: DogStepProps) {
  const { isSignedIn } = useAuth();
  const [savedDogs, setSavedDogs] = useState<SavedDog[]>([]);
  const [loadingSavedDogs, setLoadingSavedDogs] = useState(false);
  const [selectedSavedDog, setSelectedSavedDog] = useState<string | null>(null);
  const [showNewDogForm, setShowNewDogForm] = useState(!isSignedIn);

  const [dogData, setDogData] = useState({
    dogName: formData.dogName || '',
    dogAge: formData.dogAge || '',
    dogSex: formData.dogSex || 'Male',
    dogBreed: formData.dogBreed || '',
    dogWeight: formData.dogWeight || '',
    isEntireDog: formData.isEntireDog || false,
    vaccinated: formData.vaccinated || 'Yes',
    neutered: formData.neutered || 'Yes',
    vetClinic: formData.vetClinic || '',
    vetPhone: formData.vetPhone || '',
    medications: formData.medications || '',
    medicalConditions: formData.medicalConditions || '',
    crateTrained: formData.crateTrained || 'Yes',
    socialLevel: formData.socialLevel || 'Great with dogs',
    peopleBehavior: formData.peopleBehavior || '',
    behavioralIssues: formData.behavioralIssues || 'None',
    farmAnimalReactive: formData.farmAnimalReactive || 'No',
    biteHistory: formData.biteHistory || 'No',
    additionalNotes: formData.additionalNotes || '',
  });

  // Fetch saved dogs when component mounts
  useEffect(() => {
    if (isSignedIn) {
      fetchSavedDogs();
    }
  }, [isSignedIn]);

  const fetchSavedDogs = async () => {
    if (!isSignedIn) return;
    
    try {
      setLoadingSavedDogs(true);
      const response = await fetch('/api/user/dogs');
      if (response.ok) {
        const data = await response.json();
        setSavedDogs(data.dogs);
        
        // Auto-select default dog if exists and no dog is already selected
        const defaultDog = data.dogs.find((savedDog: SavedDog) => savedDog.isDefault);
        if (defaultDog && !formData.dogName) {
          handleSelectSavedDog(defaultDog);
        }
      }
    } catch (error) {
      console.error('Error fetching saved dogs:', error);
    } finally {
      setLoadingSavedDogs(false);
    }
  };

  const handleSelectSavedDog = (savedDog: SavedDog) => {
    const dog = savedDog.dog;
    const newData = {
      dogName: savedDog.nickname || dog.name,
      dogAge: dog.age.toString(),
      dogSex: dog.sex,
      dogBreed: dog.breed,
      dogWeight: '',
      isEntireDog: dog.neutered === 'No',
      vaccinated: dog.vaccinated,
      neutered: dog.neutered,
      vetClinic: dog.vetClinic || '',
      vetPhone: dog.vetPhone || '',
      medications: dog.medications || '',
      medicalConditions: dog.medicalConditions || '',
      crateTrained: dog.crateTrained,
      socialLevel: dog.socialLevel,
      peopleBehavior: dog.peopleBehavior,
      behavioralIssues: dog.behavioralIssues,
      farmAnimalReactive: dog.farmAnimalReactive,
      biteHistory: dog.biteHistory,
      additionalNotes: dog.additionalNotes || '',
      selectedDogId: dog.id, // Store the original dog ID for backend reference
    };
    
    setDogData(newData);
    updateFormData(newData);
    setSelectedSavedDog(savedDog.id);
    setShowNewDogForm(false);
  };

  const handleNewDogClick = () => {
    setSelectedSavedDog(null);
    setShowNewDogForm(true);
    // Reset form to empty state
    const emptyData = {
      dogName: '',
      dogAge: '',
      dogSex: 'Male',
      dogBreed: '',
      dogWeight: '',
      isEntireDog: false,
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
      selectedDogId: undefined,
    };
    setDogData(emptyData);
    updateFormData(emptyData);
  };

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...dogData, [field]: value };
    setDogData(newData);
    updateFormData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const isValid = () => {
    return (
      dogData.dogName &&
      dogData.dogAge &&
      dogData.dogBreed &&
      dogData.peopleBehavior
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Dog className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-heading text-black mb-2">Tell Us About Your Dog</h2>
        <p className="text-gray-600 font-body">
          This helps us provide the best possible care and create a safe environment for all our guests.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Saved Dogs Selection - Only show for authenticated users */}
        {isSignedIn && (
          <div className="form-section">
            <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-purple-600" />
              Your Saved Dogs
            </h3>
            
            {loadingSavedDogs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : savedDogs.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedDogs.map((savedDog) => (
                    <div
                      key={savedDog.id}
                      className={`card cursor-pointer transition-all ${
                        selectedSavedDog === savedDog.id
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleSelectSavedDog(savedDog)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-button font-semibold text-black">
                              {savedDog.nickname || savedDog.dog.name}
                            </h4>
                            {savedDog.isDefault && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          {savedDog.nickname && savedDog.nickname !== savedDog.dog.name && (
                            <p className="text-xs text-gray-500 font-body">
                              Real name: {savedDog.dog.name}
                            </p>
                          )}
                        </div>
                        {selectedSavedDog === savedDog.id && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 font-body">
                        <p>{savedDog.dog.breed} • {savedDog.dog.age} years • {savedDog.dog.sex}</p>
                        <p className="text-xs mt-1">Social: {savedDog.dog.socialLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center pt-4">
                  <button
                    type="button"
                    onClick={handleNewDogClick}
                    className={`btn-secondary flex items-center ${
                      showNewDogForm ? 'bg-purple-100 text-purple-700' : ''
                    }`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Dog
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <Dog className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-body text-sm">
                  No saved dogs yet. Your dogs will be saved automatically after booking.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show form only if user is not signed in or has chosen to add a new dog */}
        {(!isSignedIn || showNewDogForm) && (
          <>
            {/* Basic Information */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <Dog className="h-5 w-5 mr-2 text-purple-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Dog's Name *
              </label>
              <input
                type="text"
                required
                value={dogData.dogName}
                onChange={(e) => handleInputChange('dogName', e.target.value)}
                className="input-field"
                placeholder="Buddy, Max, Luna..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                required
                min="0"
                max="30"
                value={dogData.dogAge}
                onChange={(e) => handleInputChange('dogAge', e.target.value)}
                className="input-field"
                placeholder="Age in years"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Sex *
              </label>
              <select
                required
                value={dogData.dogSex}
                onChange={(e) => handleInputChange('dogSex', e.target.value)}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Breed *
              </label>
              <input
                type="text"
                required
                value={dogData.dogBreed}
                onChange={(e) => handleInputChange('dogBreed', e.target.value)}
                className="input-field"
                placeholder="Golden Retriever, Mixed..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={dogData.dogWeight}
                onChange={(e) => handleInputChange('dogWeight', e.target.value)}
                className="input-field"
                placeholder="25"
              />
            </div>
          </div>

          {/* Entire Dog Surcharge */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="isEntireDog"
                checked={dogData.isEntireDog}
                onChange={(e) => handleInputChange('isEntireDog', e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div>
                <label htmlFor="isEntireDog" className="font-button font-medium text-amber-800">
                  Entire Dog Surcharge (+$5/day)
                </label>
                <p className="text-sm text-amber-700 font-body mt-1">
                  Non-desexed dogs require additional care and management during their stay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Health & Safety */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-600" />
            Health & Safety
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Vaccinated *
              </label>
              <select
                required
                value={dogData.vaccinated}
                onChange={(e) => handleInputChange('vaccinated', e.target.value)}
                className="input-field"
              >
                <option value="Yes">Yes, up to date</option>
                <option value="No">No</option>
                <option value="Booked in">Booked in for vaccination</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Desexed *
              </label>
              <select
                required
                value={dogData.neutered}
                onChange={(e) => handleInputChange('neutered', e.target.value)}
                className="input-field"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Booked in">Booked in for procedure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Vet Clinic Name
              </label>
              <input
                type="text"
                value={dogData.vetClinic}
                onChange={(e) => handleInputChange('vetClinic', e.target.value)}
                className="input-field"
                placeholder="Your vet clinic"
              />
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Vet Phone Number
              </label>
              <input
                type="tel"
                value={dogData.vetPhone}
                onChange={(e) => handleInputChange('vetPhone', e.target.value)}
                className="input-field"
                placeholder="+64 9 123 4567"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Current Medications
              </label>
              <textarea
                rows={3}
                value={dogData.medications}
                onChange={(e) => handleInputChange('medications', e.target.value)}
                className="input-field"
                placeholder="List any medications, dosages, and administration instructions..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Medical Conditions/Allergies
              </label>
              <textarea
                rows={3}
                value={dogData.medicalConditions}
                onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                className="input-field"
                placeholder="Please describe any medical conditions, allergies, or special needs..."
              />
            </div>
          </div>
        </div>

        {/* Behavior Information */}
        <div className="form-section">
          <h3 className="text-lg font-button font-semibold text-black mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-600" />
            Behavior & Temperament
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Crate Trained *
              </label>
              <select
                required
                value={dogData.crateTrained}
                onChange={(e) => handleInputChange('crateTrained', e.target.value)}
                className="input-field"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="In Training">In Training</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Social Level with Dogs *
              </label>
              <select
                required
                value={dogData.socialLevel}
                onChange={(e) => handleInputChange('socialLevel', e.target.value)}
                className="input-field"
              >
                <option value="Great with dogs">Great with dogs</option>
                <option value="Selective">Selective with dogs</option>
                <option value="Not social">Not social with dogs</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-body font-medium text-gray-700 mb-2">
              Behavior with New People *
            </label>
            <textarea
              rows={3}
              required
              value={dogData.peopleBehavior}
              onChange={(e) => handleInputChange('peopleBehavior', e.target.value)}
              className="input-field"
              placeholder="How does your dog typically react to new people? (friendly, shy, protective, etc.)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Behavioral Issues *
              </label>
              <select
                required
                value={dogData.behavioralIssues}
                onChange={(e) => handleInputChange('behavioralIssues', e.target.value)}
                className="input-field"
              >
                <option value="None">None</option>
                <option value="Separation Anxiety">Separation Anxiety</option>
                <option value="Reactivity">Reactivity</option>
                <option value="Resource Guarding">Resource Guarding</option>
                <option value="Aggression">Aggression</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Reactive to Farm Animals? *
              </label>
              <select
                required
                value={dogData.farmAnimalReactive}
                onChange={(e) => handleInputChange('farmAnimalReactive', e.target.value)}
                className="input-field"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-2">
                Bite History *
              </label>
              <select
                required
                value={dogData.biteHistory}
                onChange={(e) => handleInputChange('biteHistory', e.target.value)}
                className="input-field"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              rows={4}
              value={dogData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              className="input-field"
              placeholder="Any additional information about your dog's behavior, preferences, or special needs..."
            />
          </div>
        </div>

        {/* Important Notice */}
        {(dogData.biteHistory === 'Yes' || dogData.behavioralIssues === 'Aggression' || dogData.farmAnimalReactive === 'Yes') && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-button font-medium text-red-800">Special Assessment Required</h4>
                <p className="text-sm text-red-700 font-body mt-1">
                  Based on your responses, we'll need to conduct a special assessment before confirming your booking. 
                  We'll contact you within 24 hours to discuss your dog's specific needs.
                </p>
              </div>
            </div>
          </div>
        )}

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
          </>
        )}
      </form>
    </div>
  );
}