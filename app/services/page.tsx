'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Dog, 
  Heart, 
  Shield, 
  Star, 
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  ArrowRight,
  Users,
  Scissors,
  GraduationCap,
  Mountain,
  ChefHat
} from 'lucide-react';

const mainServices = [
  {
    id: 'homestay',
    icon: Dog,
    title: 'Homestay Boarding',
    description: 'Your dog joins our family in a loving home environment with structured care.',
    features: [
      'Home-based boarding (no kennels)',
      'Daily farm walks and exercise',
      'Structured feeding schedules',
      'Socialization with other dogs',
      '24/7 monitoring and care',
      'Daily photo updates'
    ],
    pricing: {
      shortStay: 85,
      standardStay: 80,
      longStay: 75
    },
    image: '/images/homestay-boarding.jpg',
    popular: true
  }
];

const additionalServices = [
  {
    id: 'grooming',
    icon: Scissors,
    title: 'Professional Grooming',
    description: 'Full grooming service including bath, trim, nail clipping, and ear cleaning.',
    price: 85,
    duration: '2-3 hours',
    features: [
      'Full wash and blow dry',
      'Breed-appropriate trim',
      'Nail clipping and filing',
      'Ear cleaning',
      'Teeth brushing',
      'Cologne and bow (optional)'
    ]
  },
  {
    id: 'training',
    icon: GraduationCap,
    title: 'Training Sessions',
    description: 'One-on-one training with certified dog trainers.',
    price: 120,
    duration: '1 hour',
    features: [
      'Basic obedience training',
      'Behavioral correction',
      'Leash training',
      'Socialization skills',
      'Customized training plans',
      'Progress reports'
    ]
  },
  {
    id: 'adventure-walks',
    icon: Mountain,
    title: 'Adventure Walks',
    description: 'Extended walks in scenic New Zealand locations.',
    price: 45,
    duration: '1-2 hours',
    features: [
      'Scenic trail walks',
      'Beach adventures',
      'Photography included',
      'Exercise and enrichment',
      'Perfect for high-energy dogs',
      'Weather permitting'
    ]
  },
  {
    id: 'premium-meals',
    icon: ChefHat,
    title: 'Premium Meals',
    description: 'High-quality, specialized meal preparation for dietary needs.',
    price: 25,
    duration: 'Per day',
    features: [
      'Fresh, high-quality ingredients',
      'Dietary restriction accommodation',
      'Prescription diet preparation',
      'Portion control',
      'Feeding schedule maintenance',
      'Nutritional consultation'
    ]
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'Auckland',
    text: 'Amazing care for Max! The daily updates and photos gave me complete peace of mind.',
    dogName: 'Max',
    service: 'Homestay Boarding',
    rating: 5
  },
  {
    name: 'Mike Chen',
    location: 'Wellington',
    text: 'The grooming service is fantastic. Bella came back looking and smelling wonderful!',
    dogName: 'Bella',
    service: 'Professional Grooming',
    rating: 5
  },
  {
    name: 'Emma Roberts',
    location: 'Christchurch',
    text: 'The training sessions really helped with Charlie\'s behavior. Highly recommend!',
    dogName: 'Charlie',
    service: 'Training Sessions',
    rating: 5
  }
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-heading mb-6">
              Premium Dog Care Services
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto font-body">
              Comprehensive boarding and additional services designed for your dog's comfort, happiness, and wellbeing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book" className="btn-primary">
                Book Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link href="#services" className="btn-secondary">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Service */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-black mb-4">Our Signature Service</h2>
            <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
              More than just boarding - your dog becomes part of our family
            </p>
          </div>

          {mainServices.map((service) => (
            <div key={service.id} className="card p-8 mb-12 relative">
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cyan-500 text-white px-6 py-2 rounded-full text-sm font-button font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-gray-100 rounded-xl p-4 mr-4">
                      <service.icon className="h-8 w-8 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-heading text-black">{service.title}</h3>
                      <p className="text-gray-600 font-body">{service.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 font-body text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-heading text-black mb-4">Pricing Structure</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-heading text-black">${service.pricing.shortStay}</div>
                        <div className="text-sm text-gray-600 font-body">Short Stay (1-4 days)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-heading text-black">${service.pricing.standardStay}</div>
                        <div className="text-sm text-gray-600 font-body">Standard Stay (5-30 days)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-heading text-black">${service.pricing.longStay}</div>
                        <div className="text-sm text-gray-600 font-body">Long Stay (31+ days)</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-body mt-3 text-center">
                      *Peak period surcharges may apply during holidays
                    </p>
                  </div>
                </div>

                <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Dog className="h-16 w-16 mx-auto mb-4" />
                    <p className="font-body">Service Image Placeholder</p>
                    <p className="font-body text-sm">Happy dogs in our care</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/book" className="btn-primary">
                  Book Homestay Boarding
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-black mb-4">Additional Services</h2>
            <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
              Enhance your dog's stay with our premium add-on services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {additionalServices.map((service) => (
              <div key={service.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-lg p-3 mr-4">
                      <service.icon className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading text-black">{service.title}</h3>
                      <p className="text-gray-600 font-body text-sm">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-heading text-black">${service.price}</div>
                    <div className="text-sm text-gray-500 font-body">{service.duration}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 font-body text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedService(service.id)}
                  className="w-full btn-secondary"
                >
                  Add to Booking
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 font-body mb-6">
              Ready to book? Our services can be added during the booking process.
            </p>
            <Link href="/book" className="btn-primary">
              Start Booking Process
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-black mb-4">Why Choose 100% K9?</h2>
            <p className="text-xl text-gray-600 font-body max-w-3xl mx-auto">
              What sets us apart from other boarding services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <Shield className="h-12 w-12 text-black mx-auto mb-6" />
              <h3 className="text-xl font-heading text-black mb-4">Licensed & Insured</h3>
              <p className="text-gray-600 font-body">
                Fully licensed facility with comprehensive insurance coverage for your peace of mind.
              </p>
            </div>
            <div className="card p-8 text-center">
              <Heart className="h-12 w-12 text-black mx-auto mb-6" />
              <h3 className="text-xl font-heading text-black mb-4">Family Environment</h3>
              <p className="text-gray-600 font-body">
                Your dog stays in our family home, not a kennel, receiving personal attention and love.
              </p>
            </div>
            <div className="card p-8 text-center">
              <Clock className="h-12 w-12 text-black mx-auto mb-6" />
              <h3 className="text-xl font-heading text-black mb-4">24/7 Care</h3>
              <p className="text-gray-600 font-body">
                Round-the-clock monitoring and care with immediate access to veterinary services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-black mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 font-body">
              Real feedback from happy dog parents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 font-body mb-4">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-full p-2 mr-3">
                    <Dog className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <div className="font-heading text-black">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 font-body">
                      {testimonial.dogName} • {testimonial.location}
                    </div>
                    <div className="text-xs text-cyan-600 font-body">{testimonial.service}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-heading text-black mb-6">Visit Our Facility</h2>
              <p className="text-gray-600 font-body mb-8">
                We welcome visits by appointment so you can see where your dog will be staying and meet our team.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="font-body text-gray-700">Rural Canterbury, New Zealand</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="font-body text-gray-700">Contact via booking form</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="font-body text-gray-700">Family-operated since 2020</span>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/book" className="btn-primary">
                  Schedule a Visit
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>

            <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-16 w-16 mx-auto mb-4" />
                <p className="font-body">Facility Image Placeholder</p>
                <p className="font-body text-sm">Our beautiful rural property</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-black to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-heading mb-4">Ready to Book?</h2>
          <p className="text-xl text-gray-200 mb-8 font-body">
            Give your dog the care and attention they deserve with our premium boarding services.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn-primary">
              Book Your Stay
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            <Link href="/sign-up" className="btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}