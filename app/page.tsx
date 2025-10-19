'use client';

import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
    description: 'Home-based boarding with daily exercise and personalised attention.'
  },
  {
    icon: Star,
    title: 'Premium Service',
    description: 'Additional services including grooming, training and adventure walks.'
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
    location: 'Ponsonby, Auckland',
    rating: 5,
    text: 'Best dog boarding in Auckland! Amazing care for Max! He came back happy and well-exercised. The daily updates gave me peace of mind.',
    dogName: 'Max'
  },
  {
    name: 'Mike Chen',
    location: 'Mission Bay, Auckland',
    rating: 5,
    text: 'We\'ve tried other Auckland dog boarding services, but 100% K9 is by far the best. Professional service with genuine love for dogs. Bella has stayed here multiple times and loves the farm!',
    dogName: 'Bella'
  }
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PetBoarding",
    "name": "100% K9 Dog Boarding",
    "description": "Professional dog boarding and homestay services in Auckland with farm-based exercise, 24/7 monitoring and personalised care",
    "url": "https://booking.100percentk9.co.nz",
    "telephone": "+64-XXXX-XXXX",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Auckland",
      "addressRegion": "Auckland",
      "addressCountry": "NZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -36.8485,
      "longitude": 174.7633
    },
    "areaServed": {
      "@type": "City",
      "name": "Auckland"
    },
    "priceRange": "$$",
    "image": "https://booking.100percentk9.co.nz/images/dog-hero.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "500"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "24/7 Monitoring" },
      { "@type": "LocationFeatureSpecification", "name": "Farm-based Exercise" },
      { "@type": "LocationFeatureSpecification", "name": "Veterinary Support" },
      { "@type": "LocationFeatureSpecification", "name": "Daily Updates" }
    ]
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
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
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 text-white py-20 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/dog-hero.jpg"
            alt="Happy dog in outdoor setting"
            fill
            sizes="100vw"
            className="object-cover object-[center_35%]"
            priority
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-gray-900/25 to-black/35"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1
              className="text-5xl md:text-6xl font-heading mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
            >
              Premium Dog Boarding & Homestay in Auckland
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto font-body drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Auckland's trusted dog boarding service with professional overnight care, full structure, enrichment and daily exercise on our farm.
              Your dog's home away from home.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {isSignedIn ? (
                <Link
                  href="/book"
                  className="bg-cyan-500 text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-cyan-600 transition-colors flex items-center"
                >
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="bg-cyan-500 text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-cyan-600 transition-colors flex items-center"
                >
                  Start Booking
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
              <Link
                href="/learn-more"
                className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-white hover:text-black transition-colors shadow-lg"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              transition={{ delay: 0.6 }}
            >
              <motion.div className="text-center" variants={scaleIn}>
                <div className="text-3xl font-heading mb-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">500+</div>
                <div className="text-white font-body drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Happy Dogs</div>
              </motion.div>
              <motion.div className="text-center" variants={scaleIn}>
                <div className="text-3xl font-heading mb-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">5★</div>
                <div className="text-white font-body drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Average Rating</div>
              </motion.div>
              <motion.div className="text-center" variants={scaleIn}>
                <div className="text-3xl font-heading mb-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">24/7</div>
                <div className="text-white font-body drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Care & Monitoring</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-heading text-black mb-4">
              Why Choose 100% K9?
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
              Professional dog boarding with the comfort and care of a family home environment.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div key={index} className="text-center" variants={fadeInUp}>
                <div className="bg-cyan-50 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-heading text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 font-body">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
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
              <Dog className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
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
                Grooming, training, raw meals and specialised care for your dog.
              </p>
              <div className="text-sm text-gray-500 font-body">Various prices</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-heading text-black mb-4">
              What Pet Parents Say
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="card p-8"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-body mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-full p-2 mr-3">
                    <Dog className="h-5 w-5 text-black" />
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading mb-4">
            Ready to Book Your Dog's Stay?
          </h2>
          <p className="text-xl text-gray-200 mb-8 font-body">
            {isSignedIn 
              ? "Welcome back! Book your next adventure in just a few clicks."
              : "Join hundreds of happy pet parents who trust us with their furry family members."
            }
          </p>
          
          {isSignedIn ? (
            <Link
              href="/book"
              className="bg-cyan-500 text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-cyan-600 transition-colors inline-flex items-center"
            >
              Book Your Stay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-cyan-500 text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-cyan-600 transition-colors inline-flex items-center"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <SignInButton mode="modal">
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-button font-semibold text-lg hover:bg-white hover:text-black transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
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
            <p className="text-gray-500 text-sm font-body">
              © 2025 100% K9. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}