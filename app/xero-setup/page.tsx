'use client';

import { useState } from 'react';

export default function XeroSetupPage() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Redirect to Xero auth endpoint
      window.location.href = '/api/xero/auth';
    } catch (error) {
      console.error('Error connecting to Xero:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connect to Xero
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect your Xero account to automatically create invoices for bookings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                What happens when you connect?
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Automatic invoice creation for new bookings</li>
                <li>• Streamlined accounting integration</li>
                <li>• Real-time sync with your Xero account</li>
                <li>• Professional invoice management</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isConnecting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  'Connect to Xero'
                )}
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              You'll be redirected to Xero to authorize the connection.
              <br />
              This is secure and you can revoke access anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}