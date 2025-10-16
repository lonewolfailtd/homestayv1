'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Upload,
  Dog,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '@/components/ui/FileUpload';

interface DogData {
  id: string;
  name: string;
  age: number;
  sex: string;
  breed: string;
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
  files: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    fileCategory: string;
    description: string;
  }>;
}

interface DogFormData {
  name: string;
  age: number;
  sex: string;
  breed: string;
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
}

export default function EditDogPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const dogId = params.id as string;
  
  const [dogData, setDogData] = useState<DogData | null>(null);
  const [formData, setFormData] = useState<DogFormData>({
    name: '',
    age: 1,
    sex: '',
    breed: '',
    vaccinated: '',
    neutered: '',
    vetClinic: '',
    vetPhone: '',
    medications: '',
    medicalConditions: '',
    crateTrained: '',
    socialLevel: '',
    peopleBehavior: '',
    behavioralIssues: '',
    farmAnimalReactive: '',
    biteHistory: '',
    additionalNotes: ''
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && user && dogId) {
      fetchDogData();
    }
  }, [isLoaded, user, dogId]);

  const fetchDogData = async () => {
    try {
      const response = await fetch(`/api/dogs/${dogId}`);
      if (response.ok) {
        const data = await response.json();
        setDogData(data);
        setFormData({
          name: data.name || '',
          age: data.age || 1,
          sex: data.sex || '',
          breed: data.breed || '',
          vaccinated: data.vaccinated || '',
          neutered: data.neutered || '',
          vetClinic: data.vetClinic || '',
          vetPhone: data.vetPhone || '',
          medications: data.medications || '',
          medicalConditions: data.medicalConditions || '',
          crateTrained: data.crateTrained || '',
          socialLevel: data.socialLevel || '',
          peopleBehavior: data.peopleBehavior || '',
          behavioralIssues: data.behavioralIssues || '',
          farmAnimalReactive: data.farmAnimalReactive || '',
          biteHistory: data.biteHistory || '',
          additionalNotes: data.additionalNotes || ''
        });
      } else {
        toast.error('Failed to load dog data');
        router.push('/dashboard/dogs');
      }
    } catch (error) {
      toast.error('Failed to load dog data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DogFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      return result.files;
    } else {
      throw new Error('File upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload new files first
      let uploadedFiles: any[] = [];
      if (newFiles.length > 0) {
        uploadedFiles = await handleFileUpload(newFiles);
      }

      // Update dog data
      const response = await fetch(`/api/dogs/${dogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          files: uploadedFiles
        })
      });

      if (response.ok) {
        toast.success('Dog profile updated successfully');
        router.push('/dashboard/dogs');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast.error('Failed to update dog profile');
    } finally {
      setSaving(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/dogs/${dogId}/files/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDogData(prev => prev ? {
          ...prev,
          files: prev.files.filter(f => f.id !== fileId)
        } : null);
        toast.success('File deleted');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast.error('Failed to delete file');
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

  if (!dogData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Dog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-body">Dog not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/dogs" 
            className="inline-flex items-center text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dogs
          </Link>
          <h1 className="text-3xl font-heading text-black">Edit {dogData.name}</h1>
          <p className="text-gray-600 font-body mt-2">
            Update your dog's information and upload important documents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-heading text-black mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Dog's Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Age (years) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Sex *
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Breed *
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card p-6">
            <h2 className="text-xl font-heading text-black mb-6">Medical Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Vaccinated *
                </label>
                <select
                  value={formData.vaccinated}
                  onChange={(e) => handleInputChange('vaccinated', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Neutered/Spayed *
                </label>
                <select
                  value={formData.neutered}
                  onChange={(e) => handleInputChange('neutered', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Vet Clinic
                </label>
                <input
                  type="text"
                  value={formData.vetClinic}
                  onChange={(e) => handleInputChange('vetClinic', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Vet Phone
                </label>
                <input
                  type="tel"
                  value={formData.vetPhone}
                  onChange={(e) => handleInputChange('vetPhone', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Current Medications
                </label>
                <textarea
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="List any current medications or treatments..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-body font-medium mb-2">
                  Medical Conditions
                </label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Any medical conditions we should be aware of..."
                />
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="card p-6">
            <h2 className="text-xl font-heading text-black mb-6">Documents & Photos</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-sm text-blue-800">
                    Upload important documents like vaccination records, vet certificates, and photos of your dog
                  </p>
                  <p className="font-body text-xs text-blue-600 mt-1">
                    Accepted formats: Images (JPG, PNG, GIF), PDF, Word documents
                  </p>
                </div>
              </div>
              
              <FileUpload
                onFilesChange={setNewFiles}
                acceptedTypes={['image/*', '.pdf', '.doc', '.docx']}
                maxFiles={10}
                maxSizePerFile={10}
                existingFiles={dogData.files.map(f => ({
                  id: f.id,
                  name: f.fileName,
                  url: f.filePath,
                  type: f.fileType,
                  size: f.fileSize
                }))}
                onDeleteFile={deleteFile}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="card p-6">
            <h2 className="text-xl font-heading text-black mb-6">Additional Notes</h2>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Any additional information about your dog that would be helpful..."
            />
          </div>

          {/* Submit Button */}
          <div className="card p-6">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Changes...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}