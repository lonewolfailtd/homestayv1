'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function XeroSuccessContent() {
  const searchParams = useSearchParams();
  const tenants = searchParams.get('tenants') || '0';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Connection Details
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800">
            <strong>Connected Organizations:</strong> {tenants}
          </p>
          <p className="text-xs text-green-600 mt-2">
            Invoices will now be automatically created in Xero for new bookings
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Booking Form
          </Link>
          
          <Link
            href="/admin"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Need to disconnect? You can revoke access in your Xero account settings
        or contact support for assistance.
      </div>
    </div>
  );
}

export default function XeroSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Xero Connected Successfully! 🎉
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your Xero account is now connected to the booking system
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <XeroSuccessContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}