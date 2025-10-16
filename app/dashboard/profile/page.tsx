'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { User, Phone, Mail, MapPin, Bell, Shield, CreditCard, Settings, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      booking_reminders: boolean;
      payment_reminders: boolean;
      promotional: boolean;
    };
    default_emergency_contact: {
      name: string;
      phone: string;
      relation: string;
    };
    communication_preferences: {
      preferred_contact_method: 'email' | 'phone' | 'sms';
      language: 'en' | 'maori';
    };
  };
}

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferences: {
      notifications: {
        email: true,
        sms: false,
        booking_reminders: true,
        payment_reminders: true,
        promotional: false,
      },
      default_emergency_contact: {
        name: '',
        phone: '',
        relation: '',
      },
      communication_preferences: {
        preferred_contact_method: 'email',
        language: 'en',
      },
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setProfile({
              firstName: data.data.firstName || user.firstName || '',
              lastName: data.data.lastName || user.lastName || '',
              email: data.data.email || user.emailAddresses[0]?.emailAddress || '',
              phone: data.data.phone || user.phoneNumbers[0]?.phoneNumber || '',
              preferences: data.data.preferences || profile.preferences,
            });
          } else {
            // Fallback to Clerk data if API fails
            setProfile(prev => ({
              ...prev,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.emailAddresses[0]?.emailAddress || '',
              phone: user.phoneNumbers[0]?.phoneNumber || '',
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Fallback to Clerk data if API fails
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

      // Save preferences to our database via API
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          preferences: profile.preferences,
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        setEditingSection(null);
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

  const updatePreference = (section: string, key: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...prev.preferences[section as keyof typeof prev.preferences],
          [key]: value,
        },
      },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading text-black">Profile Settings</h1>
          <p className="text-gray-600 font-body">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <div className="card">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-button font-semibold text-black">Personal Information</h2>
              </div>
              <button
                onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
                className="btn-secondary text-sm flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                {editingSection === 'personal' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  {editingSection === 'personal' ? (
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      className="input-field w-full"
                    />
                  ) : (
                    <p className="text-gray-900 font-body py-2">{profile.firstName || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  {editingSection === 'personal' ? (
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      className="input-field w-full"
                    />
                  ) : (
                    <p className="text-gray-900 font-body py-2">{profile.lastName || 'Not set'}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900 font-body py-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {profile.email}
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
                </p>
                <p className="text-xs text-gray-500 font-body mt-1">
                  To change your email, please contact support
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-900 font-body py-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {profile.phone || 'Not set'}
                </p>
              </div>
              
              {editingSection === 'personal' && (
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-lg font-button font-semibold text-black">Default Emergency Contact</h2>
              </div>
              <button
                onClick={() => setEditingSection(editingSection === 'emergency' ? null : 'emergency')}
                className="btn-secondary text-sm flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                {editingSection === 'emergency' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                {editingSection === 'emergency' ? (
                  <input
                    type="text"
                    value={profile.preferences.default_emergency_contact.name}
                    onChange={(e) => updatePreference('default_emergency_contact', 'name', e.target.value)}
                    className="input-field w-full"
                    placeholder="Emergency contact name"
                  />
                ) : (
                  <p className="text-gray-900 font-body py-2">
                    {profile.preferences.default_emergency_contact.name || 'Not set'}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {editingSection === 'emergency' ? (
                    <input
                      type="tel"
                      value={profile.preferences.default_emergency_contact.phone}
                      onChange={(e) => updatePreference('default_emergency_contact', 'phone', e.target.value)}
                      className="input-field w-full"
                      placeholder="Emergency contact phone"
                    />
                  ) : (
                    <p className="text-gray-900 font-body py-2">
                      {profile.preferences.default_emergency_contact.phone || 'Not set'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  {editingSection === 'emergency' ? (
                    <select
                      value={profile.preferences.default_emergency_contact.relation}
                      onChange={(e) => updatePreference('default_emergency_contact', 'relation', e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse/Partner</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-body py-2">
                      {profile.preferences.default_emergency_contact.relation || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
              
              {editingSection === 'emergency' && (
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-button font-semibold text-black">Notification Preferences</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-button font-medium text-black">Email Notifications</div>
                    <div className="text-sm text-gray-600 font-body">Receive notifications via email</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications.email}
                      onChange={(e) => updatePreference('notifications', 'email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-button font-medium text-black">SMS Notifications</div>
                    <div className="text-sm text-gray-600 font-body">Receive notifications via text</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications.sms}
                      onChange={(e) => updatePreference('notifications', 'sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-button font-medium text-black">Booking Reminders</div>
                    <div className="text-sm text-gray-600 font-body">Reminders about upcoming stays</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications.booking_reminders}
                      onChange={(e) => updatePreference('notifications', 'booking_reminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-button font-medium text-black">Payment Reminders</div>
                    <div className="text-sm text-gray-600 font-body">Reminders about outstanding payments</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications.payment_reminders}
                      onChange={(e) => updatePreference('notifications', 'payment_reminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-button font-medium text-black">Promotional Offers</div>
                    <div className="text-sm text-gray-600 font-body">Special offers and updates</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications.promotional}
                      onChange={(e) => updatePreference('notifications', 'promotional', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Account Security */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-button font-semibold text-black">Account Security</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-body text-gray-700">Two-factor authentication</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Disabled</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-body text-gray-700">Password</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Strong</span>
              </div>
              
              <button
                onClick={() => toast.info('Redirecting to security settings...')}
                className="w-full btn-secondary text-sm"
              >
                Manage Security
              </button>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-button font-semibold text-black">Communication</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                  Preferred Contact Method
                </label>
                <select
                  value={profile.preferences.communication_preferences.preferred_contact_method}
                  onChange={(e) => updatePreference('communication_preferences', 'preferred_contact_method', e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="sms">Text Message</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-button font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={profile.preferences.communication_preferences.language}
                  onChange={(e) => updatePreference('communication_preferences', 'language', e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="en">English</option>
                  <option value="maori">Te Reo Māori</option>
                </select>
              </div>
              
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full btn-secondary text-sm"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-button font-semibold text-black mb-4">Account Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => toast.info('Export feature coming soon!')}
                className="w-full btn-secondary text-sm text-left"
              >
                Export My Data
              </button>
              
              <button
                onClick={() => toast.info('Please contact support for account deletion.')}
                className="w-full btn-secondary text-sm text-left text-red-600 hover:bg-red-50"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}