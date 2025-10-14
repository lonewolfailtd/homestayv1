export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dog Boarding Pricing
          </h1>
          <p className="text-lg text-gray-600">
            Transparent pricing for your dog's comfortable stay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Standard Boarding */}
          <div className="bg-white rounded-lg shadow-lg p-6 border">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Standard Boarding</h2>
            <div className="text-4xl font-bold text-blue-600 mb-4">
              $50<span className="text-lg text-gray-500">/night</span>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Comfortable indoor/outdoor runs
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Daily exercise and playtime
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Two meals per day
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Basic grooming (brushing)
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Medication administration
              </li>
            </ul>
          </div>

          {/* Luxury Boarding */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-200 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Luxury Boarding</h2>
            <div className="text-4xl font-bold text-blue-600 mb-4">
              $75<span className="text-lg text-gray-500">/night</span>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Spacious private suites
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Extended exercise and socialization
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Premium meals and treats
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Daily brushing and basic grooming
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                One-on-one attention time
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Daily photo updates
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Additional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Full Grooming</h3>
              <p className="text-2xl font-bold text-blue-600">$30</p>
              <p className="text-sm text-gray-600 mt-1">Bath, nail trim, ear cleaning</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Training Session</h3>
              <p className="text-2xl font-bold text-blue-600">$25</p>
              <p className="text-sm text-gray-600 mt-1">Basic obedience practice</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Extra Walks</h3>
              <p className="text-2xl font-bold text-blue-600">$15</p>
              <p className="text-sm text-gray-600 mt-1">Additional exercise session</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Medication Admin</h3>
              <p className="text-2xl font-bold text-blue-600">$10</p>
              <p className="text-sm text-gray-600 mt-1">Daily medication management</p>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policies & Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Health Requirements</h3>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Current vaccinations required</li>
                <li>• Flea and tick prevention up to date</li>
                <li>• Dogs must be spayed/neutered (6+ months)</li>
                <li>• Current health certificate for stays over 14 days</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Booking Policies</h3>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• 50% deposit required to secure booking</li>
                <li>• 48-hour cancellation notice required</li>
                <li>• Check-in: 8:00 AM - 6:00 PM</li>
                <li>• Check-out: 8:00 AM - 6:00 PM</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>
    </main>
  );
}