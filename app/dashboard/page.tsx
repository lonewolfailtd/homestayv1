'use client';

import { useState, useEffect } from 'react';
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
  Star,
  DollarSign,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { StatsSkeleton, BookingListSkeleton } from '@/components/ui/LoadingStates';
import { DashboardErrorBoundary } from '@/components/ui/ErrorBoundary';

interface DashboardData {
  stats: {
    totalBookings: number;
    thisYearBookings: number;
    totalSpent: number;
    savedDogs: number;
    avgStayDuration: number;
  };
  upcomingBookings: Array<{
    id: string;
    dogName: string;
    dogBreed: string;
    checkIn: string;
    checkOut: string;
    totalDays: number;
    totalPrice: number;
    status: string;
  }>;
  activeBookings: Array<{
    id: string;
    dogName: string;
    dogBreed: string;
    checkIn: string;
    checkOut: string;
    totalDays: number;
    daysRemaining: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    dogName: string;
    checkIn: string;
    status: string;
    createdAt: string;
  }>;
  nextPaymentDue: {
    bookingId: string;
    dogName: string;
    amount: number;
    dueDate: string;
  } | null;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/dashboard');
      const data = await response.json();

      if (response.ok) {
        setDashboardData(data);
      } else {
        toast.error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDateString = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Welcome Header Skeleton */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white animate-pulse">
          <div className="h-8 bg-white bg-opacity-20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded w-1/2"></div>
        </div>
        
        {/* Stats Skeleton */}
        <StatsSkeleton />
        
        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gray-200 rounded-xl p-3 w-12 h-12"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-9 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
        
        {/* Recent Bookings Skeleton */}
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <BookingListSkeleton count={2} />
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
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
            {dashboardData?.nextPaymentDue && (
              <div className="mt-4 bg-amber-500 bg-opacity-90 rounded-lg p-3">
                <div className="flex items-center text-white">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-body">
                    Payment due for {dashboardData.nextPaymentDue.dogName}: ${dashboardData.nextPaymentDue.amount} 
                    by {formatDateString(dashboardData.nextPaymentDue.dueDate)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <Heart className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-4 mt-6">
          <Link
            href="/book"
            className="inline-flex items-center bg-white text-purple-600 px-6 py-3 rounded-xl font-button font-medium hover:bg-purple-50 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Book New Stay
          </Link>
          
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center bg-white bg-opacity-20 text-white px-4 py-3 rounded-xl font-button font-medium hover:bg-opacity-30 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-xl p-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-gray-600">Total Bookings</p>
              <p className="text-2xl font-heading text-black">{dashboardData?.stats.totalBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-xl p-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-gray-600">This Year</p>
              <p className="text-2xl font-heading text-black">{dashboardData?.stats.thisYearBookings || 0}</p>
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
              <p className="text-2xl font-heading text-black">{dashboardData?.stats.savedDogs || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-xl p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-gray-600">Total Spent</p>
              <p className="text-2xl font-heading text-black">${dashboardData?.stats.totalSpent || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-xl p-3">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-body text-gray-600">Avg Stay</p>
              <p className="text-2xl font-heading text-black">{dashboardData?.stats.avgStayDuration || 0} days</p>
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
            {dashboardData?.upcomingBookings && dashboardData.upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-purple-100 rounded-lg p-2 mr-3">
                          <Dog className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-button font-medium text-black">{booking.dogName}</h3>
                          <p className="text-sm text-gray-600 font-body">
                            {formatDateString(booking.checkIn)} - {formatDateString(booking.checkOut)}
                          </p>
                          <p className="text-xs text-gray-500 font-body">
                            {booking.dogBreed} • {booking.totalDays} days • ${booking.totalPrice}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-button border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
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
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivity.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-lg p-2 mr-3">
                          <Dog className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-button font-medium text-black">{booking.dogName}</h3>
                          <p className="text-sm text-gray-600 font-body">
                            {formatDateString(booking.checkIn)}
                          </p>
                          <p className="text-xs text-gray-500 font-body">
                            Booked {formatDateString(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-button border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
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
    </DashboardErrorBoundary>
  );
}