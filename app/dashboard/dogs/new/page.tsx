'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Dog, Save, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewDogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dogPhotos, setDogPhotos] = useState<File[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    breed: '',
    vaccinated: 'yes',
    neutered: 'yes',
    vetClinic: '',
    vetPhone: '',
    medications: '',
    medicalConditions: '',
    crateTrained: 'yes',
    socialLevel: 'social',
    peopleBehavior: 'friendly',
    behavioralIssues: '',
    farmAnimalReactive: 'no',
    biteHistory: 'no',
    additionalNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDogPhotos(Array.from(e.target.files));
    }
  };

  const handleVaccinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVaccinationRecords(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (dogId: string) => {
    const allFiles = [
      ...dogPhotos.map(f => ({ file: f, category: 'photo' })),
      ...vaccinationRecords.map(f => ({ file: f, category: 'vaccination' })),
    ];

    for (const { file, category } of allFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dogId', dogId);
      formData.append('category', category);

      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.breed) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/dogs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { dogId } = await response.json();

        // Upload files if any were selected
        if (dogPhotos.length > 0 || vaccinationRecords.length > 0) {
          setUploadingFiles(true);
          await uploadFiles(dogId);
          setUploadingFiles(false);
          toast.success('Dog profile and files uploaded successfully!');
        } else {
          toast.success('Dog profile created successfully!');
        }

        router.push('/dashboard/dogs');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create dog profile');
      }
    } catch (error) {
      console.error('Error creating dog:', error);
      toast.error('Failed to create dog profile');
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/dogs"
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading text-black">Add New Dog</h1>
          <p className="text-gray-600 font-body">
            Create a profile for your dog to enable quick rebooking
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 rounded-lg p-2">
                <Dog className="h-5 w-5 text-black" />
              </div>
              <h2 className="text-lg font-heading text-black">Basic Information</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Dog's Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Enter your dog's name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Age (years) *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Enter age in years"
                  min="0"
                  max="25"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Sex *
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                >
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Breed *
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Enter breed (e.g., Golden Retriever)"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div className="card">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-heading text-black">Health & Veterinary Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Vaccinated
                </label>
                <select
                  name="vaccinated"
                  value={formData.vaccinated}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="yes">Yes, up to date</option>
                  <option value="partial">Partially vaccinated</option>
                  <option value="no">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Neutered/Spayed
                </label>
                <select
                  name="neutered"
                  value={formData.neutered}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Veterinary Clinic
                </label>
                <input
                  type="text"
                  name="vetClinic"
                  value={formData.vetClinic}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Name of veterinary clinic"
                />
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Vet Phone Number
                </label>
                <input
                  type="tel"
                  name="vetPhone"
                  value={formData.vetPhone}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="+64 9 123 4567"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Current Medications
                </label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  className="input-field w-full h-20 resize-none"
                  placeholder="List any current medications or supplements"
                />
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Any medical conditions we should know about"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Behavior Information */}
        <div className="card">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-heading text-black">Behavior & Social Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Crate Trained
                </label>
                <select
                  name="crateTrained"
                  value={formData.crateTrained}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="sometimes">Sometimes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Social Level with Other Dogs
                </label>
                <select
                  name="socialLevel"
                  value={formData.socialLevel}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="very social">Very Social</option>
                  <option value="social">Social</option>
                  <option value="somewhat social">Somewhat Social</option>
                  <option value="not social">Not Social</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Behavior with People
                </label>
                <select
                  name="peopleBehavior"
                  value={formData.peopleBehavior}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="friendly">Friendly</option>
                  <option value="shy">Shy</option>
                  <option value="protective">Protective</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Reactive to Farm Animals
                </label>
                <select
                  name="farmAnimalReactive"
                  value={formData.farmAnimalReactive}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  History of Biting
                </label>
                <select
                  name="biteHistory"
                  value={formData.biteHistory}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Behavioral Issues
                </label>
                <textarea
                  name="behavioralIssues"
                  value={formData.behavioralIssues}
                  onChange={handleChange}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Any behavioral concerns or issues"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="card">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-heading text-black">Additional Information</h2>
          </div>
          
          <div className="p-6">
            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                className="input-field w-full h-24 resize-none"
                placeholder="Any other information about your dog that would be helpful for us to know..."
              />
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="card">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-heading text-black">Photos & Documents</h2>
            <p className="text-sm text-gray-600 font-body mt-1">
              Upload photos and vaccination records (optional but recommended)
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Dog Photos */}
            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                Dog Photos
              </label>
              <p className="text-xs text-gray-500 font-body mb-3">
                Upload photos of your dog so we can recognise them (JPG, PNG, GIF)
              </p>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500 font-body">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 font-body">
                      {dogPhotos.length > 0 ? `${dogPhotos.length} file(s) selected` : 'PNG, JPG or GIF (MAX. 5MB each)'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              {dogPhotos.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 font-body">
                  Selected: {dogPhotos.map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            {/* Vaccination Records */}
            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                Vaccination Records
              </label>
              <p className="text-xs text-gray-500 font-body mb-3">
                Upload proof of current vaccinations (PDF, JPG, PNG)
              </p>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500 font-body">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 font-body">
                      {vaccinationRecords.length > 0 ? `${vaccinationRecords.length} file(s) selected` : 'PDF, PNG or JPG (MAX. 10MB each)'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleVaccinationChange}
                  />
                </label>
              </div>
              {vaccinationRecords.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 font-body">
                  Selected: {vaccinationRecords.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between py-6">
          <Link
            href="/dashboard/dogs"
            className="btn-secondary flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={loading || uploadingFiles}
            className="btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {uploadingFiles ? 'Uploading Files...' : loading ? 'Creating Profile...' : 'Create Dog Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}