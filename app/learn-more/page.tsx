'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Shield,
  Heart,
  Star,
  Home,
  Utensils,
  Droplets,
  Activity,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function LearnMore() {
  const { isSignedIn } = useUser();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center">
              <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-80 active:opacity-60">
                <Image
                  src="/images/100-K9-logo-horizontal.png"
                  alt="100% K9 Dog Boarding"
                  width={320}
                  height={74}
                  className="h-20 w-auto"
                  priority
                />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <Link href="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/sign-in" className="btn-secondary">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="btn-primary">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-heading mb-4">About 100% K9 Dog Boarding</h1>
            <p className="text-xl text-gray-200 font-body max-w-3xl mx-auto">
              Auckland's premium dog boarding service providing professional care, exercise and enrichment in a family home environment
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading text-black mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none font-body text-gray-600">
            <p className="mb-6">
              At 100% K9, we understand that your dog is more than just a pet—they're family. That's why we created a dog boarding service that goes beyond basic kennels, offering a true home-away-from-home experience right here in Auckland.
            </p>
            <p className="mb-6">
              Our farm-based facility provides the perfect environment for dogs to exercise, play and relax. With professional care available 24/7, structured daily routines and personalised attention for each guest, we ensure your dog receives the same love and care you would give them at home.
            </p>
            <p>
              Whether your dog needs a short stay whilst you're away or long-term care, we provide a safe, enriching environment where they can thrive. Our experienced team is dedicated to making every stay comfortable, fun and stress-free for both you and your furry family member.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading text-black mb-12 text-center">What Makes Us Different</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8">
              <Home className="h-12 w-12 text-cyan-600 mb-4" />
              <h3 className="text-2xl font-heading text-black mb-3">Home Environment</h3>
              <p className="text-gray-600 font-body">
                Your dog stays in our family home, not a cage or kennel. They'll have comfortable sleeping areas, cosy spaces to relax and access to secure outdoor areas.
              </p>
            </div>

            <div className="card p-8">
              <Activity className="h-12 w-12 text-cyan-600 mb-4" />
              <h3 className="text-2xl font-heading text-black mb-3">Farm-Based Exercise</h3>
              <p className="text-gray-600 font-body">
                Daily exercise on our secure farm property with plenty of space to run, play and explore. Adventure walks and structured freedom for optimal physical and mental stimulation.
              </p>
            </div>

            <div className="card p-8">
              <Heart className="h-12 w-12 text-cyan-600 mb-4" />
              <h3 className="text-2xl font-heading text-black mb-3">Personalised Care</h3>
              <p className="text-gray-600 font-body">
                Every dog has unique needs. We tailor our care to your dog's personality, dietary requirements, exercise level and any special considerations.
              </p>
            </div>

            <div className="card p-8">
              <Utensils className="h-12 w-12 text-cyan-600 mb-4" />
              <h3 className="text-2xl font-heading text-black mb-3">Premium Nutrition</h3>
              <p className="text-gray-600 font-body">
                High-quality meals tailored to your dog's dietary needs. We can accommodate special diets, raw feeding and any specific nutritional requirements.
              </p>
            </div>

            <div className="card p-8">
              <Shield className="h-12 w-12 text-cyan-600 mb-4" />
              <h3 className="text-2xl font-heading text-black mb-3">Safety & Security</h3>
              <p className="text-gray-600 font-body">
                Fully insured and licensed with 24/7 monitoring. Secure fencing, vet support on call and comprehensive safety protocols ensure your dog's wellbeing.
              </p>
            </div>

            <div className="card p-8">
              <Star className="h-12 w-12 text-cyan-600 mb-4" />
              <h3 className="text-2xl font-heading text-black mb-3">Regular Updates</h3>
              <p className="text-gray-600 font-body">
                Stay connected with daily photo updates and progress reports. We keep you informed so you have peace of mind whilst you're away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Routine */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading text-black mb-12 text-center">A Day in the Life</h2>

          <div className="space-y-8">
            <div className="flex items-start">
              <Clock className="h-8 w-8 text-cyan-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-heading text-black mb-2">Morning (7:00-9:00 AM)</h3>
                <p className="text-gray-600 font-body">
                  Breakfast service with fresh water, followed by outdoor time for toileting and morning exercise on the farm.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Activity className="h-8 w-8 text-cyan-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-heading text-black mb-2">Mid-Morning (9:00 AM-12:00 PM)</h3>
                <p className="text-gray-600 font-body">
                  Adventure walks, training sessions or play time. Mental enrichment activities and socialisation opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Utensils className="h-8 w-8 text-cyan-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-heading text-black mb-2">Afternoon (12:00-3:00 PM)</h3>
                <p className="text-gray-600 font-body">
                  Rest time in comfortable indoor areas, followed by lunch service and more outdoor activities.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Activity className="h-8 w-8 text-cyan-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-heading text-black mb-2">Late Afternoon (3:00-6:00 PM)</h3>
                <p className="text-gray-600 font-body">
                  Second exercise session with farm activities, games and structured freedom. Grooming and care as needed.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Home className="h-8 w-8 text-cyan-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-heading text-black mb-2">Evening (6:00-9:00 PM)</h3>
                <p className="text-gray-600 font-body">
                  Dinner service, final outdoor time and settling in for the night. Cosy sleeping arrangements in our family home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading text-black mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-xl font-heading text-black mb-3">What do I need to bring for my dog's stay?</h3>
              <p className="text-gray-600 font-body">
                We provide everything your dog needs, but you're welcome to bring their favourite bed, toys or special items from home. We require up-to-date vaccination records and any necessary medications.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-heading text-black mb-3">How many dogs do you board at once?</h3>
              <p className="text-gray-600 font-body">
                We limit numbers to ensure personalised attention for each dog. This allows us to maintain a calm, home-like environment whilst providing proper supervision and care.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-heading text-black mb-3">Can my dog socialise with other dogs?</h3>
              <p className="text-gray-600 font-body">
                Yes, if appropriate! We carefully supervise all interactions and only introduce dogs that are comfortable with socialisation. Solo activities are available for dogs who prefer their own space.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-heading text-black mb-3">What if my dog has special dietary needs?</h3>
              <p className="text-gray-600 font-body">
                We accommodate all dietary requirements including raw feeding, prescription diets and allergies. Simply provide details during booking and we'll ensure your dog receives appropriate meals.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-heading text-black mb-3">What happens in case of a medical emergency?</h3>
              <p className="text-gray-600 font-body">
                We have vet support on call 24/7. In case of emergency, we'll contact you immediately and take your dog to our trusted veterinary clinic for assessment and treatment.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-heading text-black mb-3">Do you offer trial stays or meet-and-greets?</h3>
              <p className="text-gray-600 font-body">
                Absolutely! We encourage first-time guests to come for a visit so both you and your dog can see our facility and meet our team. Contact us to arrange a meet-and-greet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-heading text-black mb-8">Get in Touch</h2>
          <p className="text-xl text-gray-600 font-body mb-12">
            Have questions or ready to book? We'd love to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <MapPin className="h-10 w-10 text-cyan-600 mb-3" />
              <h3 className="text-lg font-heading text-black mb-2">Location</h3>
              <p className="text-gray-600 font-body">Auckland, New Zealand</p>
            </div>

            <div className="flex flex-col items-center">
              <Phone className="h-10 w-10 text-cyan-600 mb-3" />
              <h3 className="text-lg font-heading text-black mb-2">Phone</h3>
              <p className="text-gray-600 font-body">Available upon booking</p>
            </div>

            <div className="flex flex-col items-center">
              <Mail className="h-10 w-10 text-cyan-600 mb-3" />
              <h3 className="text-lg font-heading text-black mb-2">Email</h3>
              <p className="text-gray-600 font-body">Contact via booking system</p>
            </div>
          </div>

          <Link
            href={isSignedIn ? "/book" : "/sign-up"}
            className="bg-cyan-500 text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-cyan-600 transition-colors inline-flex items-center"
          >
            {isSignedIn ? "Book Now" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/images/100-K9-logo-horizontal.png"
                alt="100% K9 Dog Boarding"
                width={200}
                height={46}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-400 font-body mb-4">
              Professional dog boarding and homestay services
            </p>
            <div className="flex justify-center space-x-6 mb-4">
              <Link href="/" className="text-gray-400 hover:text-white font-body">
                Home
              </Link>
              <Link href="/services" className="text-gray-400 hover:text-white font-body">
                Services
              </Link>
              <Link href="/learn-more" className="text-gray-400 hover:text-white font-body">
                About Us
              </Link>
            </div>
            <p className="text-gray-500 text-sm font-body">
              © 2025 100% K9. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
