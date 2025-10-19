'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Dog, CreditCard, MapPin, Download, Star, RefreshCw, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface HistoryBooking {
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
  paymentMethod?: string;
  depositInvoiceId?: string;
  balanceInvoiceId?: string;
  createdAt: string;
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

const yearOptions = [
  { value: 'all', label: 'All Years' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
];

export default function HistoryPage() {
  const [bookings, setBookings] = useState<HistoryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const fetchBookings = async (resetOffset = false) => {
    try {
      setLoading(true);
      const offset = resetOffset ? 0 : pagination.offset;
      
      const params = new URLSearchParams({
        filter: 'past', // Only show past bookings
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
        toast.error(data.error || 'Failed to fetch booking history');
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      toast.error('Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(true);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateRange = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate.getFullYear() === checkOutDate.getFullYear() && 
        checkInDate.getMonth() === checkOutDate.getMonth()) {
      return `${checkInDate.getDate()}-${checkOutDate.getDate()} ${checkInDate.toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })}`;
    }
    
    return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
  };

  const getYearFromDate = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = selectedYear === 'all' || getYearFromDate(booking.checkIn) === selectedYear;
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    
    return matchesSearch && matchesYear && matchesStatus;
  });

  const groupBookingsByYear = () => {
    const grouped = filteredBookings.reduce((acc, booking) => {
      const year = getYearFromDate(booking.checkIn);
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(booking);
      return acc;
    }, {} as Record<string, HistoryBooking[]>);

    // Sort years in descending order
    return Object.keys(grouped)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(year => ({
        year,
        bookings: grouped[year].sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
      }));
  };

  const getTotalStats = () => {
    return {
      totalBookings: filteredBookings.length,
      totalSpent: filteredBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice.toString()), 0),
      totalDays: filteredBookings.reduce((sum, b) => sum + b.totalDays, 0),
      averageStay: filteredBookings.length > 0 
        ? Math.round(filteredBookings.reduce((sum, b) => sum + b.totalDays, 0) / filteredBookings.length)
        : 0
    };
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
      fetchBookings(false);
    }
  };

  const handleRebook = (booking: HistoryBooking) => {
    // Navigate to booking form with pre-filled data
    const params = new URLSearchParams({
      dogId: booking.dog.name, // We'll need to pass actual dog ID in real implementation
      rebookFrom: booking.id
    });
    window.location.href = `/book?${params}`;
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading text-black">Booking History</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
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

  const stats = getTotalStats();
  const groupedBookings = groupBookingsByYear();

  return (
    <div className="-mt-[33rem] pb-[30rem] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading text-black">Booking History</h1>
          <p className="text-gray-600 font-body">
            View your past stays and download receipts
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-heading text-cyan-600">{stats.totalBookings}</div>
          <div className="text-sm text-gray-600 font-body">Total Stays</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading text-green-600">${stats.totalSpent.toFixed(2)}</div>
          <div className="text-sm text-gray-600 font-body">Total Spent</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading text-blue-600">{stats.totalDays}</div>
          <div className="text-sm text-gray-600 font-body">Total Days</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading text-amber-600">{stats.averageStay}</div>
          <div className="text-sm text-gray-600 font-body">Avg Stay (days)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by dog name or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-field min-w-0"
          >
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field min-w-0"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings by Year */}
      {groupedBookings.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-button font-medium text-gray-600 mb-2">
            No booking history found
          </h3>
          <p className="text-gray-500 font-body mb-4">
            {searchTerm || selectedYear !== 'all' || selectedStatus !== 'all' 
              ? 'Try adjusting your filters to see more results.'
              : 'You haven\'t completed any stays yet.'}
          </p>
          <a
            href="/book"
            className="btn-primary inline-block"
          >
            Book Your First Stay
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedBookings.map(({ year, bookings }) => (
            <div key={year} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading text-black">{year}</h2>
                <span className="text-sm text-gray-500 font-body">
                  {bookings.length} stay{bookings.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Dog className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-button font-semibold text-black text-lg">
                            {booking.dog.name}
                          </h3>
                          <p className="text-sm text-gray-600 font-body">
                            {booking.dog.breed} • {booking.dog.age} years • {booking.dog.sex}
                          </p>
                          <p className="text-sm font-button text-cyan-600 mt-1">
                            {formatDateRange(booking.checkIn, booking.checkOut)} • {booking.totalDays} days
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
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-body text-gray-600">Total Cost</div>
                          <div className="font-button font-medium text-lg">${booking.totalPrice}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-body text-gray-600">Booked By</div>
                          <div className="font-button font-medium">{booking.customer.firstName} {booking.customer.lastName}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-body text-gray-600">Booked On</div>
                          <div className="font-button font-medium">{formatDate(booking.createdAt)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between py-3 border-t border-gray-200">
                      <div className="flex items-center space-x-4 flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${booking.depositPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm font-body text-gray-600">Deposit</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${booking.balancePaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm font-body text-gray-600">Balance</span>
                        </div>
                        {booking.paymentMethod && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-body">
                            {booking.paymentMethod === 'cash' ? '💵 Cash' :
                             booking.paymentMethod === 'bank_transfer' ? '🏦 Bank Transfer' :
                             '💳 Card'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRebook(booking)}
                          className="btn-secondary text-sm"
                        >
                          Book Again
                        </button>
                        
                        <button
                          className="btn-secondary text-sm flex items-center"
                          onClick={() => toast.info('Invoice download feature coming soon!')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Invoice
                        </button>
                      </div>
                    </div>

                    {/* Rating Section - Future Feature */}
                    {booking.status === 'completed' && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-body text-gray-600">Rate this stay:</span>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                className="text-gray-300 hover:text-amber-400 transition-colors"
                                onClick={() => toast.info('Rating feature coming soon!')}
                              >
                                <Star className="h-4 w-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination.hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Loading...' : 'Load More History'}
          </button>
        </div>
      )}
    </div>
  );
}