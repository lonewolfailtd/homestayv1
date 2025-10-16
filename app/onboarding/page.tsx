'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  Dog, 
  Heart, 
  Star,
  Calendar,
  Users,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingData {
  welcomeComplete: boolean;
  profileComplete: boolean;
  tourComplete: boolean;
  preferences: {
    notifications: boolean;
    marketing: boolean;
  };
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to 100% K9!',
    description: 'Your premium dog boarding experience starts here',
    component: 'WelcomeStep'
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Help us personalize your experience',
    component: 'ProfileStep'
  },
  {
    id: 'tour',
    title: 'Discover Our Services',
    description: 'Learn about what makes us special',
    component: 'TourStep'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Ready to book your first stay',
    component: 'CompleteStep'
  }
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    welcomeComplete: false,
    profileComplete: false,
    tourComplete: false,
    preferences: {
      notifications: true,
      marketing: false
    }
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding completion status
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          preferences: onboardingData.preferences
        })
      });

      if (response.ok) {
        toast.success('Welcome! Your account is ready to go.');
        router.push('/dashboard');
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNextStep} />;
      case 1:
        return <ProfileStep onNext={handleNextStep} onPrev={handlePrevStep} />;
      case 2:
        return <TourStep onNext={handleNextStep} onPrev={handlePrevStep} />;
      case 3:
        return <CompleteStep onComplete={handleComplete} onPrev={handlePrevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-lg font-heading text-black">Setup Progress</div>
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`step-indicator ${
                        index < currentStep ? 'step-completed' :
                        index === currentStep ? 'step-active' : 'step-pending'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 font-body text-sm"
            >
              Skip Setup
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderStepContent()}
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-8 text-white mb-8">
          <Heart className="h-16 w-16 text-gray-200 mx-auto mb-6" />
          <h1 className="text-4xl font-heading mb-4">Welcome to 100% K9!</h1>
          <p className="text-xl text-gray-200 font-body">
            New Zealand's premier dog boarding and homestay service
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <Shield className="h-12 w-12 text-black mx-auto mb-4" />
            <h3 className="text-lg font-heading text-black mb-2">Professional Care</h3>
            <p className="text-gray-600 font-body text-sm">Licensed, insured, and experienced</p>
          </div>
          <div className="card p-6 text-center">
            <Heart className="h-12 w-12 text-black mx-auto mb-4" />
            <h3 className="text-lg font-heading text-black mb-2">Home Environment</h3>
            <p className="text-gray-600 font-body text-sm">Your dog stays in a loving home</p>
          </div>
          <div className="card p-6 text-center">
            <Star className="h-12 w-12 text-black mx-auto mb-4" />
            <h3 className="text-lg font-heading text-black mb-2">Premium Service</h3>
            <p className="text-gray-600 font-body text-sm">Grooming, training, and more</p>
          </div>
        </div>
      </div>
      
      <button onClick={onNext} className="btn-primary">
        Get Started
        <ArrowRight className="h-4 w-4 ml-2" />
      </button>
    </div>
  );
}

// Profile Step Component
function ProfileStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [profileData, setProfileData] = useState({
    hasCompletedProfile: false,
    needsEmergencyContact: true
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Users className="h-16 w-16 text-black mx-auto mb-4" />
        <h1 className="text-3xl font-heading text-black mb-4">Complete Your Profile</h1>
        <p className="text-gray-600 font-body">
          We need a few details to provide the best service for you and your dog
        </p>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-heading text-black mb-4">Quick Setup Options</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-body font-medium text-black">Complete Profile Later</h4>
                <p className="text-sm text-gray-600 font-body">You can add details when booking</p>
              </div>
              <button 
                onClick={onNext}
                className="btn-secondary"
              >
                Continue
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <div>
                <h4 className="font-body font-medium text-black">Complete Profile Now</h4>
                <p className="text-sm text-gray-600 font-body">Get personalized recommendations</p>
              </div>
              <button 
                onClick={() => window.open('/dashboard/profile', '_blank')}
                className="btn-accent"
              >
                Open Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={onPrev} className="btn-secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
}

// Tour Step Component
function TourStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Calendar className="h-16 w-16 text-black mx-auto mb-4" />
        <h1 className="text-3xl font-heading text-black mb-4">Discover Our Services</h1>
        <p className="text-gray-600 font-body">
          Everything you need for your dog's perfect stay
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="bg-gray-100 rounded-lg p-4 w-16 h-16 mb-6 flex items-center justify-center">
            <Dog className="h-8 w-8 text-black" />
          </div>
          <h3 className="text-xl font-heading text-black mb-3">Homestay Boarding</h3>
          <p className="text-gray-600 font-body mb-4">
            Your dog stays in our family home with daily exercise, structured routines, and lots of love.
          </p>
          <ul className="text-sm text-gray-600 font-body space-y-2">
            <li>• Daily farm walks and playtime</li>
            <li>• Structured feeding schedule</li>
            <li>• Socialization with other dogs</li>
            <li>• 24/7 monitoring and care</li>
          </ul>
        </div>

        <div className="card p-6">
          <div className="bg-gray-100 rounded-lg p-4 w-16 h-16 mb-6 flex items-center justify-center">
            <Star className="h-8 w-8 text-black" />
          </div>
          <h3 className="text-xl font-heading text-black mb-3">Additional Services</h3>
          <p className="text-gray-600 font-body mb-4">
            Enhance your dog's stay with our premium add-on services.
          </p>
          <ul className="text-sm text-gray-600 font-body space-y-2">
            <li>• Professional grooming sessions</li>
            <li>• One-on-one training with certified trainers</li>
            <li>• Adventure walks in scenic locations</li>
            <li>• Premium meal preparation</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={onPrev} className="btn-secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Almost Done!
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
}

// Complete Step Component
function CompleteStep({ onComplete, onPrev }: { onComplete: () => void; onPrev: () => void }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white mb-8">
          <CheckCircle className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl font-heading mb-4">You're All Set!</h1>
          <p className="text-xl text-green-100 font-body">
            Your account is ready. Time to book your dog's first adventure!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <Calendar className="h-12 w-12 text-black mx-auto mb-4" />
            <h3 className="text-lg font-heading text-black mb-2">Book Your First Stay</h3>
            <p className="text-gray-600 font-body text-sm mb-4">
              Our multi-step booking form makes it easy to get started
            </p>
            <button 
              onClick={() => window.open('/book', '_blank')}
              className="btn-primary w-full"
            >
              Start Booking
            </button>
          </div>
          <div className="card p-6">
            <Heart className="h-12 w-12 text-black mx-auto mb-4" />
            <h3 className="text-lg font-heading text-black mb-2">Explore Your Dashboard</h3>
            <p className="text-gray-600 font-body text-sm mb-4">
              Manage bookings, dogs, and view your stay history
            </p>
            <button 
              onClick={onComplete}
              className="btn-secondary w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mt-8">
        <button onClick={onPrev} className="btn-secondary mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <button onClick={onComplete} className="btn-primary">
          Complete Setup
          <CheckCircle className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
}