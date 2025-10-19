'use client';

import { useState, useEffect } from 'react';
import { Dog, Plus, Edit2, Trash2, Heart, Star, Calendar, Users, CheckSquare, Square, BookOpen, Syringe, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '@/components/ui/FileUpload';
import ProfileIncompleteModal from '@/components/ProfileIncompleteModal';

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
    socialLevel: string;
    recentBookings: Array<{
      id: string;
      checkIn: string;
      checkOut: string;
      status: string;
    }>;
  };
}

export default function DogsPage() {
  const [savedDogs, setSavedDogs] = useState<SavedDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDog, setEditingDog] = useState<SavedDog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileStatus, setProfileStatus] = useState<any>(null);

  const fetchSavedDogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/dogs');
      const data = await response.json();

      if (response.ok) {
        setSavedDogs(data.dogs);
      } else {
        toast.error(data.error || 'Failed to fetch dogs');
      }
    } catch (error) {
      console.error('Error fetching dogs:', error);
      toast.error('Failed to fetch dogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedDogs();
  }, []);

  const checkProfileCompleteness = async () => {
    try {
      const response = await fetch('/api/user/profile-completeness');
      const data = await response.json();

      if (response.ok) {
        setProfileStatus(data);
        setShowProfileModal(true);
      } else {
        toast.error('Failed to check profile completeness');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      toast.error('Failed to check profile completeness');
    }
  };

  const handleSaveDog = async (dogData: Partial<SavedDog>) => {
    try {
      const response = await fetch('/api/user/dogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogId: editingDog?.dog.id,
          nickname: dogData.nickname,
          notes: dogData.notes,
          isDefault: dogData.isDefault,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Dog profile updated successfully');
        fetchSavedDogs();
        setShowEditModal(false);
        setEditingDog(null);
      } else {
        toast.error(result.error || 'Failed to update dog profile');
      }
    } catch (error) {
      console.error('Error saving dog:', error);
      toast.error('Failed to update dog profile');
    }
  };

  const handleDeleteDog = async (savedDogId: string) => {
    if (!confirm('Are you sure you want to remove this dog from your saved profiles?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/dogs?id=${savedDogId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Dog profile removed successfully');
        fetchSavedDogs();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to remove dog profile');
      }
    } catch (error) {
      console.error('Error deleting dog:', error);
      toast.error('Failed to remove dog profile');
    }
  };

  const handleSelectDog = (dogId: string) => {
    setSelectedDogs(prev => 
      prev.includes(dogId) 
        ? prev.filter(id => id !== dogId)
        : [...prev, dogId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDogs.length === savedDogs.length) {
      setSelectedDogs([]);
    } else {
      setSelectedDogs(savedDogs.map(dog => dog.id));
    }
  };

  const handleBulkBooking = () => {
    if (selectedDogs.length === 0) {
      toast.error('Please select at least one dog to book');
      return;
    }
    
    const selectedDogIds = selectedDogs.map(selectedId => {
      const savedDog = savedDogs.find(dog => dog.id === selectedId);
      return savedDog?.dog.id;
    }).filter(Boolean);
    
    // Redirect to multi-dog booking page
    const dogParams = selectedDogIds.map(id => `dogId=${id}`).join('&');
    window.location.href = `/book/multi?${dogParams}`;
  };

  const handleBulkDelete = async () => {
    if (selectedDogs.length === 0) {
      toast.error('Please select at least one dog to delete');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${selectedDogs.length} dog profiles?`)) {
      return;
    }

    try {
      const promises = selectedDogs.map(dogId => 
        fetch(`/api/user/dogs?id=${dogId}`, { method: 'DELETE' })
      );
      
      await Promise.all(promises);
      toast.success(`${selectedDogs.length} dog profiles removed successfully`);
      setSelectedDogs([]);
      fetchSavedDogs();
    } catch (error) {
      console.error('Error deleting dogs:', error);
      toast.error('Failed to remove dog profiles');
    }
  };

  const getSocialLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'very social':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'social':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'somewhat social':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not social':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading text-black">My Dogs</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-[33rem] pb-[30rem] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-heading text-black">My Dogs</h1>
          <p className="text-gray-600 font-body">
            Manage your saved dog profiles for quick rebooking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={checkProfileCompleteness}
            className="btn-secondary flex items-center"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Check Profile Progress
          </button>
          <a
            href="/dashboard/dogs/new"
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Dog
          </a>
        </div>
      </div>

      {/* Multi-Pet Actions */}
      {savedDogs.length > 1 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-sm font-body text-gray-600 hover:text-cyan-600"
              >
                {selectedDogs.length === savedDogs.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>
                  {selectedDogs.length === savedDogs.length 
                    ? 'Deselect All' 
                    : `Select All (${savedDogs.length})`
                  }
                </span>
              </button>
              
              {selectedDogs.length > 0 && (
                <span className="text-sm font-body text-gray-500">
                  {selectedDogs.length} dog{selectedDogs.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            
            {selectedDogs.length > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBulkBooking}
                  className="btn-primary flex items-center text-sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Book Selected ({selectedDogs.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="btn-secondary text-red-600 hover:bg-red-50 flex items-center text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-heading text-cyan-600">{savedDogs.length}</div>
          <div className="text-sm text-gray-600 font-body">Saved Dogs</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading text-green-600">
            {savedDogs.filter(d => d.isDefault).length}
          </div>
          <div className="text-sm text-gray-600 font-body">Default Dogs</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading text-blue-600">
            {savedDogs.reduce((sum, d) => sum + d.dog.recentBookings.length, 0)}
          </div>
          <div className="text-sm text-gray-600 font-body">Total Bookings</div>
        </div>
      </div>

      {/* Dogs Grid */}
      {savedDogs.length === 0 ? (
        <div className="card text-center py-12">
          <Dog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-button font-medium text-gray-600 mb-2">
            No saved dogs yet
          </h3>
          <p className="text-gray-500 font-body mb-4">
            Dogs will be automatically saved when you make bookings. You can then manage their profiles here.
          </p>
          <div className="space-y-2">
            <a
              href="/dashboard/dogs/new"
              className="btn-primary inline-block"
            >
              Add Your First Dog
            </a>
            <p className="text-xs text-gray-500 font-body">
              Or <a href="/book" className="text-cyan-600 hover:text-cyan-700">make a booking</a> to automatically create a dog profile
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedDogs.map((savedDog) => (
            <div key={savedDog.id} className={`card hover:shadow-lg transition-all ${selectedDogs.includes(savedDog.id) ? 'ring-2 ring-cyan-500 bg-cyan-50' : ''}`}>
              {/* Selection & Header */}
              <div className="flex items-start justify-between mb-4">
                {/* Selection checkbox - only show when multiple dogs */}
                {savedDogs.length > 1 && (
                  <button
                    onClick={() => handleSelectDog(savedDog.id)}
                    className="p-1 mr-3 mt-1 text-gray-400 hover:text-cyan-600"
                  >
                    {selectedDogs.includes(savedDog.id) ? (
                      <CheckSquare className="h-5 w-5 text-cyan-600" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="bg-cyan-100 p-2 rounded-lg">
                      <Dog className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-button font-semibold text-black">
                          {savedDog.nickname || savedDog.dog.name}
                        </h3>
                        {savedDog.isDefault && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      {savedDog.nickname && savedDog.nickname !== savedDog.dog.name && (
                        <p className="text-sm text-gray-500 font-body">
                          Real name: {savedDog.dog.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingDog(savedDog);
                      setShowEditModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-cyan-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDog(savedDog.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Dog Details */}
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm font-body">
                  <div>
                    <span className="text-gray-600">Breed:</span>
                    <span className="ml-1 font-medium">{savedDog.dog.breed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <span className="ml-1 font-medium">{savedDog.dog.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sex:</span>
                    <span className="ml-1 font-medium">{savedDog.dog.sex}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Neutered:</span>
                    <span className="ml-1 font-medium">{savedDog.dog.neutered}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 font-body">Social Level:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSocialLevelColor(savedDog.dog.socialLevel)}`}>
                    {savedDog.dog.socialLevel}
                  </span>
                </div>
                
                {savedDog.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 font-body">{savedDog.notes}</p>
                  </div>
                )}
              </div>

              {/* Recent Bookings */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-button font-medium text-gray-700">Recent Bookings</h4>
                  <span className="text-xs text-gray-500 font-body">
                    {savedDog.dog.recentBookings.length} total
                  </span>
                </div>
                
                {savedDog.dog.recentBookings.length === 0 ? (
                  <p className="text-xs text-gray-500 font-body">No recent bookings</p>
                ) : (
                  <div className="space-y-1">
                    {savedDog.dog.recentBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between text-xs">
                        <span className="font-body text-gray-600">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-2">
                  <a
                    href={`/book?dogId=${savedDog.dog.id}`}
                    className="btn-primary w-full text-center text-sm"
                  >
                    Book This Dog
                  </a>
                  {savedDogs.length > 1 && (
                    <button
                      onClick={() => handleSelectDog(savedDog.id)}
                      className={`w-full text-center text-sm py-2 px-3 rounded-lg border transition-colors ${
                        selectedDogs.includes(savedDog.id)
                          ? 'bg-cyan-100 text-cyan-700 border-cyan-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {selectedDogs.includes(savedDog.id) ? '✓ Selected for Multi-Book' : 'Select for Multi-Book'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDog && (
        <EditDogModal
          savedDog={editingDog}
          onSave={handleSaveDog}
          onClose={() => {
            setShowEditModal(false);
            setEditingDog(null);
          }}
        />
      )}

      {profileStatus && showProfileModal && (
        <ProfileIncompleteModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          missing={profileStatus.missing}
          checklist={profileStatus.checklist}
          completeness={profileStatus.completeness}
        />
      )}
    </div>
  );
}

interface EditDogModalProps {
  savedDog: SavedDog;
  onSave: (data: Partial<SavedDog>) => void;
  onClose: () => void;
}

interface DogFile {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  fileCategory: string;
  description: string;
}

function EditDogModal({ savedDog, onSave, onClose }: EditDogModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'medical' | 'vaccinations' | 'behavior' | 'files'>('basic');
  const [nickname, setNickname] = useState(savedDog.nickname || savedDog.dog.name);
  const [notes, setNotes] = useState(savedDog.notes || '');
  const [isDefault, setIsDefault] = useState(savedDog.isDefault);
  const [dogFiles, setDogFiles] = useState<DogFile[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullDogData, setFullDogData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: savedDog.dog.name,
    age: savedDog.dog.age,
    sex: savedDog.dog.sex,
    breed: savedDog.dog.breed,
    vaccinated: savedDog.dog.vaccinated,
    neutered: savedDog.dog.neutered,
    vetClinic: '',
    vetPhone: '',
    medications: '',
    medicalConditions: '',
    crateTrained: '',
    socialLevel: savedDog.dog.socialLevel,
    peopleBehavior: '',
    behavioralIssues: '',
    farmAnimalReactive: '',
    biteHistory: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchFullDogData();
  }, [savedDog.dog.id]);

  const fetchFullDogData = async () => {
    try {
      const response = await fetch(`/api/dogs/${savedDog.dog.id}`);
      if (response.ok) {
        const data = await response.json();
        setFullDogData(data);
        setDogFiles(data.files || []);
        setFormData({
          name: data.name || savedDog.dog.name,
          age: data.age || savedDog.dog.age,
          sex: data.sex || savedDog.dog.sex,
          breed: data.breed || savedDog.dog.breed,
          vaccinated: data.vaccinated || savedDog.dog.vaccinated,
          neutered: data.neutered || savedDog.dog.neutered,
          vetClinic: data.vetClinic || '',
          vetPhone: data.vetPhone || '',
          medications: data.medications || '',
          medicalConditions: data.medicalConditions || '',
          crateTrained: data.crateTrained || '',
          socialLevel: data.socialLevel || savedDog.dog.socialLevel,
          peopleBehavior: data.peopleBehavior || '',
          behavioralIssues: data.behavioralIssues || '',
          farmAnimalReactive: data.farmAnimalReactive || '',
          biteHistory: data.biteHistory || '',
          additionalNotes: data.additionalNotes || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch dog data:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
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

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/dogs/${savedDog.dog.id}/files/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDogFiles(prev => prev.filter(f => f.id !== fileId));
        toast.success('File deleted successfully');
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload new files if any
      let uploadedFiles: any[] = [];
      if (newFiles.length > 0) {
        uploadedFiles = await handleFileUpload(newFiles);

        // Context-aware file categorization based on active tab
        if (activeTab === 'vaccinations') {
          uploadedFiles = uploadedFiles.map(file => ({
            ...file,
            category: 'vaccination'
          }));
        } else if (activeTab === 'files') {
          // Photos tab - mark as photo
          uploadedFiles = uploadedFiles.map(file => ({
            ...file,
            category: 'photo'
          }));
        }

        toast.success(`${newFiles.length} file(s) uploaded successfully`);
      }

      // Update full dog profile
      const response = await fetch(`/api/dogs/${savedDog.dog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          files: uploadedFiles
        })
      });

      if (response.ok) {
        toast.success('Dog profile updated successfully');
        // Save savedDog changes (nickname, notes, isDefault)
        onSave({ nickname, notes, isDefault });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast.error('Failed to update dog profile');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'basic' as const, label: 'Basic Info', icon: Dog },
    { id: 'medical' as const, label: 'Medical & Vet', icon: Heart },
    { id: 'vaccinations' as const, label: 'Vaccinations', icon: Syringe },
    { id: 'behavior' as const, label: 'Behavior', icon: Users },
    { id: 'files' as const, label: 'Photos', icon: BookOpen }
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-heading text-black">Edit {formData.name}</h2>
                <p className="text-sm text-gray-600 font-body mt-1">Update your dog's complete profile</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none px-2"
                disabled={uploading}
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-button text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    Dog's Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    Age (years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    Sex *
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleInputChange('sex', e.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select...</option>
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
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-heading text-black mb-4">Display Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                      Display Name (Nickname)
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="input-field w-full"
                      placeholder="Enter a nickname or leave blank to use real name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                      Personal Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field w-full h-24 resize-none"
                      placeholder="Add personal notes about this dog..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <label htmlFor="isDefault" className="text-sm font-body text-gray-700">
                      Set as default dog for quick booking
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical Info Tab */}
          {activeTab === 'medical' && (
            <div className="card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    Neutered/Spayed *
                  </label>
                  <select
                    value={formData.neutered}
                    onChange={(e) => handleInputChange('neutered', e.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select...</option>
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
                    value={formData.vetClinic}
                    onChange={(e) => handleInputChange('vetClinic', e.target.value)}
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
                    value={formData.vetPhone}
                    onChange={(e) => handleInputChange('vetPhone', e.target.value)}
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
                    value={formData.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    className="input-field w-full h-24 resize-none"
                    placeholder="List any current medications or supplements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    className="input-field w-full h-24 resize-none"
                    placeholder="Any medical conditions we should know about"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vaccinations Tab */}
          {activeTab === 'vaccinations' && (
            <div className="card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    Vaccination Status *
                  </label>
                  <select
                    value={formData.vaccinated}
                    onChange={(e) => handleInputChange('vaccinated', e.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes, up to date</option>
                    <option value="partial">Partially vaccinated</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-heading text-lg font-semibold text-gray-900 mb-4">
                  Vaccination Records
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload vaccination certificates or vet records showing current vaccinations. This is required for boarding.
                </p>

                <FileUpload
                  onFilesChange={setNewFiles}
                  acceptedTypes={['image/*', '.pdf', '.doc', '.docx']}
                  maxFiles={10}
                  maxSizePerFile={5}
                  existingFiles={dogFiles
                    .filter(f => f.fileCategory === 'vaccination')
                    .map(f => ({
                      id: f.id,
                      name: f.fileName,
                      url: f.filePath,
                      type: f.fileType,
                      size: f.fileSize
                    }))}
                  onDeleteFile={handleDeleteFile}
                />
              </div>
            </div>
          )}

          {/* Behavior Tab */}
          {activeTab === 'behavior' && (
            <div className="card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    Crate Trained
                  </label>
                  <select
                    value={formData.crateTrained}
                    onChange={(e) => handleInputChange('crateTrained', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select...</option>
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
                    value={formData.socialLevel}
                    onChange={(e) => handleInputChange('socialLevel', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select...</option>
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
                    value={formData.peopleBehavior}
                    onChange={(e) => handleInputChange('peopleBehavior', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select...</option>
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
                    value={formData.farmAnimalReactive}
                    onChange={(e) => handleInputChange('farmAnimalReactive', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select...</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    History of Biting
                  </label>
                  <select
                    value={formData.biteHistory}
                    onChange={(e) => handleInputChange('biteHistory', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Select...</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                    Behavioral Issues
                  </label>
                  <textarea
                    value={formData.behavioralIssues}
                    onChange={(e) => handleInputChange('behavioralIssues', e.target.value)}
                    className="input-field w-full h-24 resize-none"
                    placeholder="Any behavioral issues or concerns..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  className="input-field w-full h-32 resize-none"
                  placeholder="Any additional information about your dog..."
                />
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="card p-6">
              <h3 className="text-lg font-heading text-black mb-4">Dog Photos</h3>
              <p className="text-sm text-gray-600 font-body mb-6">
                Upload photos of your dog for their profile
              </p>
              <FileUpload
                onFilesChange={setNewFiles}
                acceptedTypes={['image/*']}
                maxFiles={10}
                maxSizePerFile={10}
                existingFiles={dogFiles
                  .filter(f => f.fileCategory === 'photo')
                  .map(f => ({
                    id: f.id,
                    name: f.fileName,
                    url: f.filePath,
                    type: f.fileType,
                    size: f.fileSize
                  }))}
                onDeleteFile={handleDeleteFile}
              />
            </div>
          )}

          {/* Fixed Bottom Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mt-8">
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-6"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-6"
                disabled={uploading}
              >
                {uploading ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}