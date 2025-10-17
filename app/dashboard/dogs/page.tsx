'use client';

import { useState, useEffect } from 'react';
import { Dog, Plus, Edit2, Trash2, Heart, Star, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading text-black">My Dogs</h1>
          <p className="text-gray-600 font-body">
            Manage your saved dog profiles for quick rebooking
          </p>
        </div>
        
        <a
          href="/dashboard/dogs/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Dog
        </a>
      </div>

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
            <div key={savedDog.id} className="card hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
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
                <a
                  href={`/book?dogId=${savedDog.dog.id}`}
                  className="btn-primary w-full text-center"
                >
                  Book Again
                </a>
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
    </div>
  );
}

interface EditDogModalProps {
  savedDog: SavedDog;
  onSave: (data: Partial<SavedDog>) => void;
  onClose: () => void;
}

function EditDogModal({ savedDog, onSave, onClose }: EditDogModalProps) {
  const [nickname, setNickname] = useState(savedDog.nickname || savedDog.dog.name);
  const [notes, setNotes] = useState(savedDog.notes || '');
  const [isDefault, setIsDefault] = useState(savedDog.isDefault);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nickname, notes, isDefault });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-button font-semibold text-black">
            Edit Dog Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-button font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input-field w-full"
              placeholder="Enter a nickname or keep original name"
            />
            <p className="text-xs text-gray-500 font-body mt-1">
              Original name: {savedDog.dog.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-button font-medium text-gray-700 mb-1">
              Personal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field w-full h-20 resize-none"
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

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}