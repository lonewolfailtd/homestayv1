'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { User, Phone, Mail, Save, MapPin, AlertCircle, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';
import ProfileIncompleteModal from '@/components/ProfileIncompleteModal';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  preferences: {
    default_emergency_contact: {
      name: string;
      phone: string;
      relation: string;
    };
  };
}

export default function ProfilePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'emergency'>('personal');
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    preferences: {
      default_emergency_contact: {
        name: '',
        phone: '',
        relation: '',
      },
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileStatus, setProfileStatus] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          // Fetch both profile and customer data
          const [profileRes, customerRes] = await Promise.all([
            fetch('/api/user/profile'),
            fetch('/api/user/customer')
          ]);

          let profileData = null;
          let customerData = null;

          if (profileRes.ok) {
            const data = await profileRes.json();
            profileData = data.data;
          }

          if (customerRes.ok) {
            const data = await customerRes.json();
            if (data.exists) {
              customerData = data.customer;
            }
          }

          setProfile({
            firstName: profileData?.firstName || user.firstName || '',
            lastName: profileData?.lastName || user.lastName || '',
            email: profileData?.email || user.emailAddresses[0]?.emailAddress || '',
            phone: profileData?.phone || customerData?.phone || user.phoneNumbers[0]?.phoneNumber || '',
            address: customerData?.address || '',
            city: customerData?.city || '',
            postalCode: customerData?.postalCode || '',
            preferences: {
              default_emergency_contact: {
                name: profileData?.preferences?.emergencyContact?.name || customerData?.emergencyName || '',
                phone: profileData?.preferences?.emergencyContact?.phone || customerData?.emergencyPhone || '',
                relation: profileData?.preferences?.emergencyContact?.relation || customerData?.emergencyRelation || '',
              },
            },
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Fallback to Clerk data
          setProfile(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.emailAddresses[0]?.emailAddress || '',
            phone: user.phoneNumbers[0]?.phoneNumber || '',
          }));
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Update Clerk user profile
      await user?.update({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });

      // Save to our database via API (includes preferences and address)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          postalCode: profile.postalCode,
          preferences: {
            emergencyContact: profile.preferences.default_emergency_contact,
          },
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  const handleAddressChange = (address: string, addressComponents?: {
    city?: string;
    postalCode?: string;
    country?: string;
  }) => {
    setProfile(prev => ({
      ...prev,
      address,
      ...(addressComponents?.city && { city: addressComponents.city }),
      ...(addressComponents?.postalCode && { postalCode: addressComponents.postalCode })
    }));
  };

  const updateEmergencyContact = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        default_emergency_contact: {
          ...prev.preferences.default_emergency_contact,
          [key]: value,
        },
      },
    }));
  };

  const tabs = [
    { id: 'personal' as const, label: 'Personal Info', icon: User },
    { id: 'address' as const, label: 'Address', icon: MapPin },
    { id: 'emergency' as const, label: 'Emergency Contact', icon: AlertCircle }
  ];

  if (loading) {
    return (
      <div className="-mt-[33rem] pb-[30rem]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
          <div className="card p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-[33rem] pb-[30rem]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading text-black">Profile Settings</h1>
          <p className="text-gray-600 font-body">
            Manage your personal information, address and emergency contact
          </p>
        </div>
        <button
          onClick={checkProfileCompleteness}
          className="btn-secondary flex items-center whitespace-nowrap"
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Check Profile Progress
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 overflow-x-auto">
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

      {/* Personal Info Tab */}
      {activeTab === 'personal' && (
        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-button font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900 font-body">{profile.email}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
            </div>
            <p className="text-xs text-gray-500 font-body mt-2">
              To change your email address, please contact support
            </p>
          </div>

          <div>
            <label className="block text-sm font-button font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="input-field w-full"
              placeholder="+64 21 123 4567"
              required
            />
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Address Tab */}
      {activeTab === 'address' && (
        <div className="card p-6 space-y-6">
          <div>
            <label className="block text-sm font-button font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <GooglePlacesAutocomplete
              value={profile.address}
              onChange={handleAddressChange}
              placeholder="Start typing your address..."
              className="input-field w-full"
            />
            <p className="text-xs text-gray-500 font-body mt-2">
              This address will auto-populate when you book
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                className="input-field w-full"
                placeholder="Auckland"
              />
            </div>

            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={profile.postalCode}
                onChange={(e) => setProfile(prev => ({ ...prev, postalCode: e.target.value }))}
                className="input-field w-full"
                placeholder="1010"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Emergency Contact Tab */}
      {activeTab === 'emergency' && (
        <div className="card p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800 font-body">
              This emergency contact will be used as the default for all your bookings unless you specify a different contact during booking.
            </p>
          </div>

          <div>
            <label className="block text-sm font-button font-medium text-gray-700 mb-2">
              Contact Name *
            </label>
            <input
              type="text"
              value={profile.preferences.default_emergency_contact.name}
              onChange={(e) => updateEmergencyContact('name', e.target.value)}
              className="input-field w-full"
              placeholder="Emergency contact full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={profile.preferences.default_emergency_contact.phone}
                onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                className="input-field w-full"
                placeholder="+64 21 123 4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-button font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                value={profile.preferences.default_emergency_contact.relation}
                onChange={(e) => updateEmergencyContact('relation', e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">Select relationship</option>
                <option value="spouse">Spouse/Partner</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Profile Progress Modal */}
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
