'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Dog,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Edit,
  XCircle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import ModifyBookingModal from '@/components/booking/ModifyBookingModal';
import CancelBookingModal from '@/components/booking/CancelBookingModal';

interface BookingDetails {
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
    weight: number;
    specialNeeds?: string;
    dietaryRequirements?: string;
    behaviorNotes?: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };
  isPeakPeriod: boolean;
  peakPeriodName?: string;
  services: string[];
  depositPaid: boolean;
  balancePaid: boolean;
  depositAmount?: number;
  balanceAmount?: number;
  balanceDueDate?: string;
  paymentMethod?: string;
  depositInvoiceId?: string;
  balanceInvoiceId?: string;
  createdAt: string;
  modifications?: Array<{
    id: string;
    type: string;
    status: string;
    requestedDate: string;
    processedDate?: string;
    reason?: string;
    newCheckIn?: string;
    newCheckOut?: string;
    cancellationFee?: number;
    refundAmount?: number;
  }>;
  isCancelled: boolean;
  cancellationDate?: string;
  cancellationReason?: string;
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

const modificationStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/booking/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setBooking(data);
      } else {
        toast.error(data.error || 'Failed to fetch booking details');
        router.push('/dashboard/bookings');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to fetch booking details');
      router.push('/dashboard/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchBookingDetails();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const canModifyBooking = () => {
    if (!booking) return false;
    if (booking.isCancelled) return false;
    if (booking.status === 'completed') return false;

    // Check if there's a pending modification
    const hasPendingMod = booking.modifications?.some(m => m.status === 'pending');
    if (hasPendingMod) return false;

    // Check if check-in is more than 7 days away
    const daysUntilCheckIn = Math.ceil(
      (new Date(booking.checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilCheckIn >= 7;
  };

  const canCancelBooking = () => {
    if (!booking) return false;
    if (booking.isCancelled) return false;
    if (booking.status === 'completed') return false;

    // Check if there's a pending modification
    const hasPendingMod = booking.modifications?.some(m => m.status === 'pending');
    return !hasPendingMod;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="card">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="btn-secondary flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-heading text-black">Booking Details</h1>
            <p className="text-gray-600 font-body">
              Reference: #{booking.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {canModifyBooking() && (
            <button
              onClick={() => setShowModifyModal(true)}
              className="btn-secondary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modify Booking
            </button>
          )}
          {canCancelBooking() && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn-secondary flex items-center text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {booking.isCancelled && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <XCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-button font-semibold text-red-800">
                Booking Cancelled
              </h3>
              <p className="text-sm text-red-700 font-body">
                Cancelled on {formatDate(booking.cancellationDate!)}
                {booking.cancellationReason && ` - ${booking.cancellationReason}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Modification Alert */}
      {booking.modifications?.some(m => m.status === 'pending') && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-button font-semibold text-yellow-800">
                Modification Pending
              </h3>
              <p className="text-sm text-yellow-700 font-body">
                Your modification request is being reviewed by our team
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Information */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading text-black">Booking Information</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  statusColors[booking.status as keyof typeof statusColors]
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-cyan-600 mt-1" />
                <div>
                  <div className="text-sm font-body text-gray-600">Check-in Date</div>
                  <div className="font-button font-medium">{formatDate(booking.checkIn)}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-cyan-600 mt-1" />
                <div>
                  <div className="text-sm font-body text-gray-600">Check-out Date</div>
                  <div className="font-button font-medium">{formatDate(booking.checkOut)}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-cyan-600 mt-1" />
                <div>
                  <div className="text-sm font-body text-gray-600">Duration</div>
                  <div className="font-button font-medium">
                    {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-cyan-600 mt-1" />
                <div>
                  <div className="text-sm font-body text-gray-600">Total Price</div>
                  <div className="font-button font-medium">${booking.totalPrice}</div>
                </div>
              </div>
            </div>

            {booking.isPeakPeriod && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-body text-amber-800">
                    Peak period: {booking.peakPeriodName}
                  </span>
                </div>
              </div>
            )}

            {booking.services && booking.services.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-button font-semibold text-gray-700 mb-2">
                  Additional Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {booking.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-sm font-body"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dog Information */}
          <div className="card">
            <h2 className="text-xl font-heading text-black mb-6">Dog Information</h2>

            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-cyan-100 p-3 rounded-lg">
                <Dog className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-button font-semibold text-lg text-black">
                  {booking.dog.name}
                </h3>
                <p className="text-gray-600 font-body">
                  {booking.dog.breed} • {booking.dog.age} years • {booking.dog.sex} • {booking.dog.weight}kg
                </p>
              </div>
            </div>

            {booking.dog.specialNeeds && (
              <div className="mb-4">
                <h4 className="text-sm font-button font-semibold text-gray-700 mb-1">
                  Special Needs
                </h4>
                <p className="text-gray-600 font-body">{booking.dog.specialNeeds}</p>
              </div>
            )}

            {booking.dog.dietaryRequirements && (
              <div className="mb-4">
                <h4 className="text-sm font-button font-semibold text-gray-700 mb-1">
                  Dietary Requirements
                </h4>
                <p className="text-gray-600 font-body">{booking.dog.dietaryRequirements}</p>
              </div>
            )}

            {booking.dog.behaviorNotes && (
              <div>
                <h4 className="text-sm font-button font-semibold text-gray-700 mb-1">
                  Behaviour Notes
                </h4>
                <p className="text-gray-600 font-body">{booking.dog.behaviorNotes}</p>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="card">
            <h2 className="text-xl font-heading text-black mb-6">Contact Information</h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-cyan-600 mt-1" />
                <div>
                  <div className="text-sm font-body text-gray-600">Email</div>
                  <div className="font-button font-medium">{booking.customer.email}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-cyan-600 mt-1" />
                <div>
                  <div className="text-sm font-body text-gray-600">Phone</div>
                  <div className="font-button font-medium">{booking.customer.phone}</div>
                </div>
              </div>

              {booking.customer.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-cyan-600 mt-1" />
                  <div>
                    <div className="text-sm font-body text-gray-600">Address</div>
                    <div className="font-button font-medium">{booking.customer.address}</div>
                  </div>
                </div>
              )}

              {booking.customer.emergencyContact && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-button font-semibold text-gray-700 mb-3">
                    Emergency Contact
                  </h3>
                  <div className="space-y-2">
                    <div className="font-button font-medium">{booking.customer.emergencyContact}</div>
                    {booking.customer.emergencyPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-body text-gray-600">{booking.customer.emergencyPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="card">
            <h2 className="text-lg font-heading text-black mb-4">Payment Status</h2>

            <div className="space-y-4">
              {booking.depositAmount && (
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <div className="text-sm font-body text-gray-600">Deposit</div>
                    <div className="font-button font-medium">${booking.depositAmount}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {booking.depositPaid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className={`text-sm font-body ${booking.depositPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {booking.depositPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}

              {booking.balanceAmount && (
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <div className="text-sm font-body text-gray-600">Balance</div>
                    <div className="font-button font-medium">${booking.balanceAmount}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {booking.balancePaid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className={`text-sm font-body ${booking.balancePaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {booking.balancePaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}

              {booking.balanceDueDate && !booking.balancePaid && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-body text-yellow-800">
                      Due: {formatDate(booking.balanceDueDate)}
                    </span>
                  </div>
                </div>
              )}

              {booking.paymentMethod && (
                <div className="pt-2">
                  <div className="text-sm font-body text-gray-600 mb-1">Payment Method</div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-body">
                    {booking.paymentMethod === 'cash' ? '💵 Cash' :
                     booking.paymentMethod === 'bank_transfer' ? '🏦 Bank Transfer' :
                     '💳 Card'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Modification History */}
          {booking.modifications && booking.modifications.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-heading text-black mb-4">Modification History</h2>

              <div className="space-y-3">
                {booking.modifications.map((mod) => (
                  <div key={mod.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-button font-medium capitalize">
                        {mod.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          modificationStatusColors[mod.status as keyof typeof modificationStatusColors]
                        }`}
                      >
                        {mod.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 font-body">
                      Requested: {formatDateTime(mod.requestedDate)}
                    </div>
                    {mod.processedDate && (
                      <div className="text-xs text-gray-600 font-body">
                        Processed: {formatDateTime(mod.processedDate)}
                      </div>
                    )}
                    {mod.reason && (
                      <div className="text-xs text-gray-700 font-body mt-2">
                        {mod.reason}
                      </div>
                    )}
                    {mod.newCheckIn && mod.newCheckOut && (
                      <div className="text-xs text-gray-700 font-body mt-2">
                        New dates: {formatDate(mod.newCheckIn)} - {formatDate(mod.newCheckOut)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Timeline */}
          <div className="card">
            <h2 className="text-lg font-heading text-black mb-4">Booking Timeline</h2>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-1 rounded-full mt-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-button font-medium">Booking Created</div>
                  <div className="text-xs text-gray-600 font-body">
                    {formatDateTime(booking.createdAt)}
                  </div>
                </div>
              </div>

              {booking.depositPaid && (
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-button font-medium">Deposit Paid</div>
                    <div className="text-xs text-gray-600 font-body">
                      ${booking.depositAmount}
                    </div>
                  </div>
                </div>
              )}

              {booking.balancePaid && (
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-button font-medium">Balance Paid</div>
                    <div className="text-xs text-gray-600 font-body">
                      ${booking.balanceAmount}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModifyModal && (
        <ModifyBookingModal
          bookingId={booking.id}
          currentCheckIn={booking.checkIn}
          currentCheckOut={booking.checkOut}
          onClose={() => setShowModifyModal(false)}
          onSuccess={fetchBookingDetails}
        />
      )}

      {showCancelModal && (
        <CancelBookingModal
          bookingId={booking.id}
          checkInDate={booking.checkIn}
          totalPrice={parseFloat(booking.totalPrice.toString())}
          onClose={() => setShowCancelModal(false)}
          onSuccess={fetchBookingDetails}
        />
      )}
    </div>
  );
}
