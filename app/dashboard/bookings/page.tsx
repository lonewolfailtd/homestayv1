'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Dog, CreditCard, Filter, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalDays: number;
  totalPrice: number;
  status: string;
  dog: {
    name: string;
    breed: string;
    age: number;
    sex: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  isPeakPeriod: boolean;
  peakPeriodName?: string;
  services: string[];
  depositPaid: boolean;
  balancePaid: boolean;
  balanceDueDate?: string;
  createdAt: string;
}

const filterOptions = [
  { value: 'all', label: 'All Bookings' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Currently Active' },
  { value: 'past', label: 'Past Bookings' },
];

const statusColors = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  const fetchBookings = async (resetOffset = false) => {
    try {
      setLoading(true);
      const offset = resetOffset ? 0 : pagination.offset;
      
      const params = new URLSearchParams({
        filter,
        limit: pagination.limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/user/bookings?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (resetOffset) {
          setBookings(data.bookings);
        } else {
          setBookings(prev => [...prev, ...data.bookings]);
        }
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(true);
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Calendar className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
      fetchBookings(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading text-black">My Bookings</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading text-black">My Bookings</h1>
          <p className="text-gray-600 font-body">
            Manage and view all your booking history
          </p>
        </div>
        
        <button
          onClick={() => fetchBookings(true)}
          disabled={loading}
          className="btn-secondary flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field min-w-0"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by dog name or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-heading text-cyan-600">{pagination.total}</div>
          <div className="text-sm text-gray-600 font-body">Total Bookings</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading text-green-600">
            {filteredBookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600 font-body">Confirmed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading text-yellow-600">
            {filteredBookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600 font-body">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading text-blue-600">
            ${filteredBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice.toString()), 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 font-body">Total Value</div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-button font-medium text-gray-600 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500 font-body">
              {filter === 'all' ? 'You haven\'t made any bookings yet.' : `No ${filter} bookings found.`}
            </p>
            <a
              href="/book"
              className="btn-primary mt-4 inline-block"
            >
              Make Your First Booking
            </a>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <Dog className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-button font-semibold text-black">
                      {booking.dog.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-body">
                      {booking.dog.breed} • {booking.dog.age} years • {booking.dog.sex}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {booking.isPeakPeriod && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-body">
                      {booking.peakPeriodName}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status as keyof typeof statusColors]}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(booking.status)}
                      <span>{booking.status}</span>
                    </div>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-body text-gray-600">Check-in</div>
                    <div className="font-button font-medium">{formatDate(booking.checkIn)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-body text-gray-600">Check-out</div>
                    <div className="font-button font-medium">{formatDate(booking.checkOut)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-body text-gray-600">Total Price</div>
                    <div className="font-button font-medium">${booking.totalPrice}</div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${booking.depositPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-body text-gray-600">Deposit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${booking.balancePaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-body text-gray-600">Balance</span>
                  </div>
                  {booking.balanceDueDate && !booking.balancePaid && (
                    <span className="text-xs text-amber-600 font-body">
                      Balance due: {formatDate(booking.balanceDueDate)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 font-body">
                    Booked {formatDateTime(booking.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Loading...' : 'Load More Bookings'}
          </button>
        </div>
      )}
    </div>
  );
}