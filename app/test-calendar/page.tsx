'use client';

import { useState } from 'react';
import { CalendarPlus, Download, CheckCircle } from 'lucide-react';
import { generateAllCalendarLinks } from '@/lib/calendar';
import { toast } from 'sonner';

export default function CalendarTestPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  // Sample booking data for testing
  const sampleBooking = {
    dogName: 'Max',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    checkIn: new Date('2025-11-01'),
    checkOut: new Date('2025-11-05'),
    totalPrice: '$340.00',
    bookingId: 'TEST-123',
  };

  const calendarLinks = generateAllCalendarLinks(sampleBooking);

  const handleDownloadICS = () => {
    const blob = new Blob([calendarLinks.icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `100K9-Booking-${sampleBooking.dogName}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded!');
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-black mb-4">
            Calendar Integration Test Page
          </h1>
          <p className="text-lg text-gray-600 font-body">
            Testing calendar functionality for booking confirmations
          </p>
        </div>

        {/* Sample Booking Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-button font-semibold text-black mb-4">
            Sample Booking Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm font-body">
            <div>
              <span className="text-gray-600">Customer:</span>
              <span className="ml-2 font-medium">{sampleBooking.customerName}</span>
            </div>
            <div>
              <span className="text-gray-600">Dog:</span>
              <span className="ml-2 font-medium">{sampleBooking.dogName}</span>
            </div>
            <div>
              <span className="text-gray-600">Check-in:</span>
              <span className="ml-2 font-medium">{sampleBooking.checkIn.toLocaleDateString('en-NZ')}</span>
            </div>
            <div>
              <span className="text-gray-600">Check-out:</span>
              <span className="ml-2 font-medium">{sampleBooking.checkOut.toLocaleDateString('en-NZ')}</span>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-medium">{sampleBooking.totalPrice}</span>
            </div>
            <div>
              <span className="text-gray-600">Booking ID:</span>
              <span className="ml-2 font-medium">{sampleBooking.bookingId}</span>
            </div>
          </div>
        </div>

        {/* Calendar Integration UI (from SummaryStep) */}
        <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <CalendarPlus className="h-6 w-6 text-cyan-600 mr-2" />
            <h3 className="font-button font-semibold text-black text-lg">Add to Calendar</h3>
          </div>

          <p className="text-sm text-gray-600 font-body mb-4 text-center">
            Never miss your booking! Add this to your calendar with one click.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Download .ics file - works with all calendar apps */}
            <button
              onClick={handleDownloadICS}
              className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all"
            >
              <Download className="h-6 w-6 text-gray-700 mb-2" />
              <span className="text-xs font-button font-medium text-gray-700">Download .ics</span>
            </button>

            {/* Google Calendar */}
            <a
              href={calendarLinks.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all"
            >
              <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              <span className="text-xs font-button font-medium text-gray-700">Google</span>
            </a>

            {/* Outlook Calendar */}
            <a
              href={calendarLinks.outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all"
            >
              <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24">
                <path fill="#0078D4" d="M7,6H17V9H7V6M17,10H7V14H17V10M7,15H17V18H7V15M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
              </svg>
              <span className="text-xs font-button font-medium text-gray-700">Outlook</span>
            </a>

            {/* Yahoo Calendar */}
            <a
              href={calendarLinks.yahooUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all"
            >
              <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24">
                <path fill="#6001D2" d="M5.5,3L8.5,12L11.5,3H15L10,17H8L3,3H5.5M21,10V7H14V10H21M21,17V14H14V17H21Z"/>
              </svg>
              <span className="text-xs font-button font-medium text-gray-700">Yahoo</span>
            </a>
          </div>

          <p className="text-xs text-gray-500 font-body mt-3 text-center">
            Check-in: 10:00 AM | Check-out: 4:00 PM
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="font-button font-semibold text-green-800">Success!</h3>
            </div>
            <p className="text-sm text-green-700 font-body text-center">
              Calendar file downloaded successfully. Check your downloads folder and open it with your calendar application.
            </p>
          </div>
        )}

        {/* Technical Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-button font-semibold text-black mb-4">
            Technical Details
          </h2>

          <div className="space-y-4 text-sm font-body">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Generated URLs:</h3>
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded overflow-x-auto">
                  <span className="text-gray-600">Google:</span>
                  <br />
                  <code className="text-xs text-blue-600 break-all">{calendarLinks.googleUrl}</code>
                </div>
                <div className="bg-gray-50 p-3 rounded overflow-x-auto">
                  <span className="text-gray-600">Outlook:</span>
                  <br />
                  <code className="text-xs text-blue-600 break-all">{calendarLinks.outlookUrl}</code>
                </div>
                <div className="bg-gray-50 p-3 rounded overflow-x-auto">
                  <span className="text-gray-600">Yahoo:</span>
                  <br />
                  <code className="text-xs text-blue-600 break-all">{calendarLinks.yahooUrl}</code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">iCalendar (.ics) Content:</h3>
              <div className="bg-gray-50 p-3 rounded overflow-x-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{calendarLinks.icsContent}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-button"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
