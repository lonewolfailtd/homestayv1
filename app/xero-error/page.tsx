'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function XeroErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Unknown error occurred';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Xero Connection Failed
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            There was an issue connecting to your Xero account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Error Details
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">
                  {decodeURIComponent(error)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Common Solutions:
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Check that your Xero app credentials are correct</li>
                <li>• Ensure the redirect URI matches your app settings</li>
                <li>• Verify your Xero subscription is active</li>
                <li>• Try the connection process again</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                <Link
                  href="/xero-setup"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </Link>
                
                <Link
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Booking Form
                </Link>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              If the problem persists, contact support with the error details above.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}