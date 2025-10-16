'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  Calendar, 
  Dog, 
  Plus, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Heart,
  Star
} from 'lucide-react';

// Mock data - will be replaced with real API calls
const mockStats = {
  totalBookings: 12,
  upcomingBookings: 2,
  totalDogs: 3,
  lastBooking: new Date('2024-12-15'),
};

const mockUpcoming = [
  {
    id: 1,
    dogName: 'Max',
    checkIn: new Date('2025-02-20'),
    checkOut: new Date('2025-02-25'),
    status: 'confirmed',
    services: ['grooming', 'walks'],
  },
  {
    id: 2,
    dogName: 'Bella',
    checkIn: new Date('2025-03-10'),
    checkOut: new Date('2025-03-15'),
    status: 'pending_payment',
    services: ['training'],
  },
];

const mockRecentHistory = [
  {
    id: 1,
    dogName: 'Max',
    checkIn: new Date('2024-12-01'),
    checkOut: new Date('2024-12-05'),
    status: 'completed',
    rating: 5,
  },
  {
    id: 2,
    dogName: 'Luna',
    checkIn: new Date('2024-11-15'),
    checkOut: new Date('2024-11-20'),
    status: 'completed',
    rating: 5,
  },
];

export default function DashboardPage() {
  const { user } = useUser();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-NZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending_payment':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-purple-100 font-body">
              Manage your dog's boarding, view upcoming stays, and book new adventures.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <Heart className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>
        
        {/* Quick Action */}
        <div className="mt-6">
          <Link
            href="/book"
            className="inline-flex items-center bg-white text-purple-600 px-6 py-3 rounded-xl font-button font-medium hover:bg-purple-50 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Book New Stay
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-xl p-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-gray-600">Total Bookings</p>
              <p className="text-2xl font-heading text-black">{mockStats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-xl p-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-gray-600">Upcoming</p>
              <p className="text-2xl font-heading text-black">{mockStats.upcomingBookings}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-amber-100 rounded-xl p-3">
              <Dog className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-gray-600">My Dogs</p>
              <p className="text-2xl font-heading text-black">{mockStats.totalDogs}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-xl p-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-gray-600">Last Stay</p>
              <p className="text-sm font-button text-black">{formatDate(mockStats.lastBooking)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading text-black">Upcoming Stays</h2>
              <Link
                href="/dashboard/bookings"
                className="text-purple-600 hover:text-purple-700 text-sm font-button flex items-center"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {mockUpcoming.length > 0 ? (
              <div className="space-y-4">
                {mockUpcoming.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-purple-100 rounded-lg p-2 mr-3">
                          <Dog className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-button font-medium text-black">{booking.dogName}</h3>
                          <p className="text-sm text-gray-600 font-body">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-button border ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {booking.services.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {booking.services.map((service) => (
                          <span
                            key={service}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-body"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-body">No upcoming bookings</p>
                <Link
                  href="/book"
                  className="inline-flex items-center mt-4 text-purple-600 hover:text-purple-700 font-button text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Book your first stay
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading text-black">Recent Stays</h2>
              <Link
                href="/dashboard/history"
                className="text-purple-600 hover:text-purple-700 text-sm font-button flex items-center"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {mockRecentHistory.length > 0 ? (
              <div className="space-y-4">
                {mockRecentHistory.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-lg p-2 mr-3">
                          <Dog className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-button font-medium text-black">{booking.dogName}</h3>
                          <p className="text-sm text-gray-600 font-body">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(booking.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-button border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-body">No booking history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-heading text-black mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/book"
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors group"
          >
            <div className="bg-purple-100 group-hover:bg-purple-200 rounded-lg p-3 mr-4">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-button font-medium text-black">Book New Stay</h3>
              <p className="text-sm text-gray-600 font-body">Schedule your dog's next adventure</p>
            </div>
          </Link>

          <Link
            href="/dashboard/dogs"
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors group"
          >
            <div className="bg-green-100 group-hover:bg-green-200 rounded-lg p-3 mr-4">
              <Dog className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-button font-medium text-black">Manage Dogs</h3>
              <p className="text-sm text-gray-600 font-body">Update profiles and preferences</p>
            </div>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="bg-blue-100 group-hover:bg-blue-200 rounded-lg p-3 mr-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-button font-medium text-black">View Invoices</h3>
              <p className="text-sm text-gray-600 font-body">Download receipts and records</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}