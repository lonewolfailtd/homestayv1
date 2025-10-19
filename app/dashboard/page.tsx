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
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';

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
  const [profileStatus, setProfileStatus] = useState<any>(null);

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

  const fetchProfileStatus = async () => {
    try {
      const response = await fetch('/api/user/profile-completeness');
      const data = await response.json();

      if (response.ok) {
        setProfileStatus(data);
      }
    } catch (error) {
      console.error('Error fetching profile status:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchProfileStatus();
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
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
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
        <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-8 text-white animate-pulse">
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
      <div className="mt-4 md:mt-0 md:-mt-[33rem] pb-8 md:pb-[30rem] space-y-2">
      {/* Black Header with White Font */}
      <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading text-white mb-1">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-200 font-body text-sm">
              Manage your dog's boarding, view upcoming stays, and book new adventures.
            </p>
            {dashboardData?.nextPaymentDue && (
              <div className="mt-3 bg-amber-500 bg-opacity-90 rounded-lg p-2">
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
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link
              href="/book"
              className="inline-flex items-center bg-white text-black px-3 md:px-4 py-2 rounded-lg font-button font-medium hover:bg-gray-50 transition-colors text-xs md:text-sm touch-manipulation min-h-[44px]"
            >
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Book New Stay</span>
            </Link>

            <Link
              href="/dashboard/rebook"
              className="inline-flex items-center bg-cyan-500 text-white px-3 md:px-4 py-2 rounded-lg font-button font-medium hover:bg-cyan-600 transition-colors text-xs md:text-sm touch-manipulation min-h-[44px]"
            >
              <RefreshCw className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Quick Rebook</span>
            </Link>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg font-button font-medium hover:bg-opacity-30 transition-colors text-xs md:text-sm touch-manipulation min-h-[44px]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {profileStatus && profileStatus.completeness < 100 && (
        <ProfileCompletionBanner
          completeness={profileStatus.completeness}
          checklist={profileStatus.checklist}
        />
      )}

      {/* Stats Grid - Moved up and improved spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="bg-cyan-100 rounded-lg p-2">
              <Calendar className="h-5 w-5 text-cyan-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-body text-gray-600">Total Bookings</p>
              <p className="text-xl font-heading text-black">{dashboardData?.stats.totalBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-2">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-body text-gray-600">This Year</p>
              <p className="text-xl font-heading text-black">{dashboardData?.stats.thisYearBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="bg-amber-100 rounded-lg p-2">
              <Dog className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-body text-gray-600">My Dogs</p>
              <p className="text-xl font-heading text-black">{dashboardData?.stats.savedDogs || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="bg-cyan-100 rounded-lg p-2">
              <DollarSign className="h-5 w-5 text-cyan-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-body text-gray-600">Total Spent</p>
              <p className="text-xl font-heading text-black">${dashboardData?.stats.totalSpent || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="bg-gray-100 rounded-lg p-2">
              <CheckCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-body text-gray-600">Avg Stay</p>
              <p className="text-xl font-heading text-black">{dashboardData?.stats.avgStayDuration || 0} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading text-black">Upcoming Stays</h2>
              <Link
                href="/dashboard/bookings"
                className="text-cyan-600 hover:text-cyan-700 text-sm font-button flex items-center"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {dashboardData?.upcomingBookings && dashboardData.upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-lg p-2 mr-3">
                          <Dog className="h-5 w-5 text-black" />
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
                  className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-button text-sm"
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
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading text-black">Recent Stays</h2>
              <Link
                href="/dashboard/history"
                className="text-cyan-600 hover:text-cyan-700 text-sm font-button flex items-center"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="p-4">
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

    </div>
    </DashboardErrorBoundary>
  );
}