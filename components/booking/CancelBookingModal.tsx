'use client';

import { useState } from 'react';
import { X, AlertTriangle, DollarSign, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface CancelBookingModalProps {
  bookingId: string;
  checkInDate: string;
  totalPrice: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelBookingModal({
  bookingId,
  checkInDate,
  totalPrice,
  onClose,
  onSuccess,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // Calculate cancellation details
  const daysUntilCheckIn = Math.ceil(
    (new Date(checkInDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  let cancellationFee = 0;
  let refundPercentage = 100;

  if (daysUntilCheckIn < 7) {
    // Less than 7 days: No refund
    cancellationFee = totalPrice;
    refundPercentage = 0;
  } else if (daysUntilCheckIn < 14) {
    // 7-14 days: 50% refund
    cancellationFee = totalPrice * 0.5;
    refundPercentage = 50;
  } else if (daysUntilCheckIn < 30) {
    // 14-30 days: 75% refund
    cancellationFee = totalPrice * 0.25;
    refundPercentage = 75;
  }
  // 30+ days: Full refund (no fee)

  const refundAmount = totalPrice - cancellationFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    if (!acknowledged) {
      toast.error('Please acknowledge the cancellation policy');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/booking/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Cancellation request submitted successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to submit cancellation request');
      }
    } catch (error) {
      console.error('Error submitting cancellation:', error);
      toast.error('Failed to submit cancellation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-heading text-black">Cancel Booking</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning Alert */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 font-body">
                <p className="font-button font-semibold mb-2">
                  Are you sure you want to cancel this booking?
                </p>
                <p className="mb-2">
                  This action cannot be undone. Once your cancellation is processed:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your booking will be permanently cancelled</li>
                  <li>You will lose your reserved dates</li>
                  <li>Cancellation fees may apply based on our policy</li>
                  <li>Refunds will be processed within 5-7 business days</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-button font-semibold text-blue-800 mb-3">
              Cancellation Policy
            </h3>
            <div className="space-y-2 text-sm text-blue-800 font-body">
              <div className="flex items-center justify-between py-2 border-b border-blue-200">
                <span>30+ days before check-in</span>
                <span className="font-button font-semibold">Full refund</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-200">
                <span>14-29 days before check-in</span>
                <span className="font-button font-semibold">75% refund</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-200">
                <span>7-13 days before check-in</span>
                <span className="font-button font-semibold">50% refund</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Less than 7 days before check-in</span>
                <span className="font-button font-semibold">No refund</span>
              </div>
            </div>
          </div>

          {/* Cancellation Calculation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-button font-semibold text-gray-700 mb-4">
              Your Cancellation Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-body">Days until check-in</span>
                <span className="font-button font-medium">{daysUntilCheckIn} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-body">Booking total</span>
                <span className="font-button font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              {cancellationFee > 0 && (
                <div className="flex items-center justify-between text-red-600">
                  <span className="text-sm font-body">Cancellation fee ({100 - refundPercentage}%)</span>
                  <span className="font-button font-medium">-${cancellationFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="font-button font-semibold text-gray-700">
                  Refund amount ({refundPercentage}%)
                </span>
                <span className="font-button font-semibold text-lg text-green-600">
                  ${refundAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-body text-gray-700 mb-2">
              Reason for Cancellation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please let us know why you're cancelling..."
              required
              rows={4}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-500 font-body mt-1">
              This helps us improve our service
            </p>
          </div>

          {/* Acknowledgement */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="acknowledge" className="text-sm font-body text-gray-700">
              I understand and acknowledge the cancellation policy and refund amount shown above
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={loading || !acknowledged}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-button font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
