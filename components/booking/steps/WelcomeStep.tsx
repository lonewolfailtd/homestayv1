'use client';

import { Heart, Shield, Star, Users } from 'lucide-react';
import { useFormContext } from '../FormContext';

interface WelcomeStepProps {
  nextStep: () => void;
}

const highlights = [
  {
    icon: Heart,
    title: 'Loving Care',
    description: 'Your dog joins our family with personalized attention and daily exercise.'
  },
  {
    icon: Shield,
    title: 'Professional Service',
    description: 'Licensed, insured, and experienced in dog behavior and care.'
  },
  {
    icon: Star,
    title: 'Premium Amenities',
    description: 'Grooming, training, adventure walks, and specialized services available.'
  },
  {
    icon: Users,
    title: 'Peace of Mind',
    description: '24/7 monitoring, daily updates, and emergency veterinary support.'
  }
];

export default function WelcomeStep({ nextStep }: WelcomeStepProps) {
  const { user } = useFormContext();

  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-heading text-black mb-4">
          Welcome {user?.firstName}! 👋
        </h2>
        <p className="text-lg text-gray-600 font-body">
          Let's book the perfect homestay experience for your furry family member. 
          We provide professional overnight care with the comfort of a family environment.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {highlights.map((highlight, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6 text-left">
            <div className="bg-purple-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
              <highlight.icon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-button font-semibold text-black mb-2">
              {highlight.title}
            </h3>
            <p className="text-gray-600 font-body text-sm">
              {highlight.description}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Info */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-heading text-purple-600 mb-1">$75-85</div>
            <div className="text-sm text-gray-600 font-body">Per day</div>
          </div>
          <div>
            <div className="text-2xl font-heading text-purple-600 mb-1">FREE</div>
            <div className="text-sm text-gray-600 font-body">Pick-up & drop-off</div>
          </div>
          <div>
            <div className="text-2xl font-heading text-purple-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600 font-body">Care & monitoring</div>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="text-left bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-button font-semibold text-black mb-4">What's Included in Every Stay:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-body text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
            Premium overnight care with structure
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
            Daily exercise with our farm dogs
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
            Professional daily routines
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
            Training support & enrichment
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
            Home-based environment
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
            Behavioral & emotional care
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8">
        <button
          onClick={nextStep}
          className="btn-primary px-8 py-4 text-lg"
        >
          Let's Get Started
        </button>
      </div>
    </div>
  );
}