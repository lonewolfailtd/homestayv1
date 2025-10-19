'use client';

import { useState } from 'react';
import { X, Calendar, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface ModifyBookingModalProps {
  bookingId: string;
  currentCheckIn: string;
  currentCheckOut: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModifyBookingModal({
  bookingId,
  currentCheckIn,
  currentCheckOut,
  onClose,
  onSuccess,
}: ModifyBookingModalProps) {
  const [formData, setFormData] = useState({
    newCheckIn: currentCheckIn.split('T')[0],
    newCheckOut: currentCheckOut.split('T')[0],
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (new Date(formData.newCheckIn) >= new Date(formData.newCheckOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the modification');
      return;
    }

    // Check if dates are actually different
    const checkInChanged = formData.newCheckIn !== currentCheckIn.split('T')[0];
    const checkOutChanged = formData.newCheckOut !== currentCheckOut.split('T')[0];

    if (!checkInChanged && !checkOutChanged) {
      toast.error('Please select different dates to modify the booking');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/booking/${bookingId}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newCheckIn: formData.newCheckIn,
          newCheckOut: formData.newCheckOut,
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Modification request submitted successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to submit modification request');
      }
    } catch (error) {
      console.error('Error submitting modification:', error);
      toast.error('Failed to submit modification request');
    } finally {
      setLoading(false);
    }
  };

  const minCheckInDate = new Date();
  minCheckInDate.setDate(minCheckInDate.getDate() + 7);
  const minCheckInDateStr = minCheckInDate.toISOString().split('T')[0];

  const minCheckOutDate = new Date(formData.newCheckIn);
  minCheckOutDate.setDate(minCheckOutDate.getDate() + 1);
  const minCheckOutDateStr = minCheckOutDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-heading text-black">Modify Booking</h2>
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
          {/* Information Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 font-body">
                <p className="font-button font-semibold mb-1">Modification Policy</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Modifications must be requested at least 7 days before check-in</li>
                  <li>Your request will be reviewed by our team within 24-48 hours</li>
                  <li>Pricing may change based on the new dates selected</li>
                  <li>Peak period surcharges apply if the new dates fall within peak periods</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current Dates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-button font-semibold text-gray-700 mb-3">
              Current Booking Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 font-body mb-1">Check-in</div>
                <div className="font-button font-medium">
                  {new Date(currentCheckIn).toLocaleDateString('en-NZ', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 font-body mb-1">Check-out</div>
                <div className="font-button font-medium">
                  {new Date(currentCheckOut).toLocaleDateString('en-NZ', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* New Dates */}
          <div>
            <h3 className="text-sm font-button font-semibold text-gray-700 mb-3">
              New Booking Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body text-gray-700 mb-2">
                  New Check-in Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={formData.newCheckIn}
                    onChange={(e) =>
                      setFormData({ ...formData, newCheckIn: e.target.value })
                    }
                    min={minCheckInDateStr}
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-body text-gray-700 mb-2">
                  New Check-out Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={formData.newCheckOut}
                    onChange={(e) =>
                      setFormData({ ...formData, newCheckOut: e.target.value })
                    }
                    min={minCheckOutDateStr}
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-body text-gray-700 mb-2">
              Reason for Modification *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please explain why you need to modify your booking dates..."
              required
              rows={4}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-500 font-body mt-1">
              This helps us process your request more efficiently
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Modification Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
