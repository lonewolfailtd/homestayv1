import BookingForm from '@/components/BookingForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dog Boarding Booking Form
          </h1>
          <p className="text-lg text-gray-600">
            Complete the form below to book your dog's stay with us
          </p>
          <a 
            href="/pricing" 
            className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            View our pricing information
          </a>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6">
          <BookingForm />
        </div>
      </div>
    </main>
  )
}