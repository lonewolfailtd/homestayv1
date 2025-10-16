'use client';

import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  ArrowRight, 
  Shield, 
  Heart, 
  Star, 
  Dog, 
  Calendar,
  CheckCircle,
  Users
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Professional Care',
    description: 'Licensed and insured with 24/7 monitoring and veterinary support.'
  },
  {
    icon: Heart,
    title: 'Loving Environment',
    description: 'Home-based boarding with daily exercise and personalized attention.'
  },
  {
    icon: Star,
    title: 'Premium Service',
    description: 'Additional services including grooming, training, and adventure walks.'
  },
  {
    icon: Users,
    title: 'Family Atmosphere',
    description: 'Your dog joins our family with structured routines and social interaction.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'Auckland',
    rating: 5,
    text: 'Amazing care for Max! He came back happy and well-exercised. The daily updates gave me peace of mind.',
    dogName: 'Max'
  },
  {
    name: 'Mike Chen',
    location: 'Wellington',
    rating: 5,
    text: 'Professional service with genuine love for dogs. Bella has stayed here multiple times and loves it.',
    dogName: 'Bella'
  }
];

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-heading text-sm font-bold">K9</span>
              </div>
              <h1 className="font-heading text-xl text-black">100% K9</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-body text-gray-600">
                    Welcome back, {user.firstName}!
                  </span>
                  <Link
                    href="/dashboard"
                    className="btn-primary"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <SignInButton mode="modal">
                    <button className="btn-secondary">
                      Sign In
                    </button>
                  </SignInButton>
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
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-heading mb-6">
              Premium Dog Boarding & Homestay
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto font-body">
              Professional overnight care with full structure, enrichment, and daily exercise on our farm. 
              Your dog's home away from home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isSignedIn ? (
                <Link
                  href="/book"
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-purple-50 transition-colors flex items-center"
                >
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-purple-50 transition-colors flex items-center"
                >
                  Start Booking
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
              <Link
                href="#features"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-heading mb-2">500+</div>
                <div className="text-purple-200 font-body">Happy Dogs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading mb-2">5★</div>
                <div className="text-purple-200 font-body">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading mb-2">24/7</div>
                <div className="text-purple-200 font-body">Care & Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-black mb-4">
              Why Choose 100% K9?
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
              Professional dog boarding with the comfort and care of a family home environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-purple-100 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-heading text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 font-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-black mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 font-body">
              Comprehensive care tailored to your dog's needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <Dog className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-heading text-black mb-3">Homestay Boarding</h3>
              <p className="text-gray-600 font-body mb-4">
                Overnight care in a family environment with daily exercise and enrichment.
              </p>
              <div className="text-sm text-gray-500 font-body">From $75/day</div>
            </div>

            <div className="card p-8 text-center">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-heading text-black mb-3">Adventure Walks</h3>
              <p className="text-gray-600 font-body mb-4">
                4-hour outdoor adventures with structured freedom and recall practice.
              </p>
              <div className="text-sm text-gray-500 font-body">$30/walk</div>
            </div>

            <div className="card p-8 text-center">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-heading text-black mb-3">Additional Services</h3>
              <p className="text-gray-600 font-body mb-4">
                Grooming, training, raw meals, and specialized care for your dog.
              </p>
              <div className="text-sm text-gray-500 font-body">Various prices</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading text-black mb-4">
              What Pet Parents Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-body mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Dog className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-button font-medium text-black">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 font-body">
                      {testimonial.location} • {testimonial.dogName}'s parent
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading mb-4">
            Ready to Book Your Dog's Stay?
          </h2>
          <p className="text-xl text-purple-100 mb-8 font-body">
            {isSignedIn 
              ? "Welcome back! Book your next adventure in just a few clicks."
              : "Join hundreds of happy pet parents who trust us with their furry family members."
            }
          </p>
          
          {isSignedIn ? (
            <Link
              href="/book"
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-purple-50 transition-colors inline-flex items-center"
            >
              Book Your Stay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-purple-50 transition-colors inline-flex items-center"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <SignInButton mode="modal">
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-black font-heading text-sm font-bold">K9</span>
              </div>
              <h3 className="font-heading text-xl">100% K9</h3>
            </div>
            <p className="text-gray-400 font-body mb-4">
              Professional dog boarding and homestay services
            </p>
            <p className="text-gray-500 text-sm font-body">
              © 2025 100% K9. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}