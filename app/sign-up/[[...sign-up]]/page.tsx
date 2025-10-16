'use client';

import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex justify-center mb-4">
            <Image
              src="/images/100%K9 on Transparent HORIZONTAL.png"
              alt="100% K9 Dog Boarding"
              width={200}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </div>
          <h2 className="mt-6 text-3xl font-heading text-black">
            Join 100% K9
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-body">
            Create your account to book homestays and manage your dog's care
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'btn-primary',
                socialButtonsBlockButton: 'btn-secondary text-sm',
                formFieldInput: 'input-field',
                footerActionLink: 'text-purple-600 hover:text-purple-700',
                card: 'card shadow-lg',
                headerTitle: 'font-heading text-black',
                headerSubtitle: 'font-body text-gray-600',
                socialButtonsBlockButtonText: 'font-button',
                formFieldLabel: 'font-body text-gray-700 font-medium',
                dividerLine: 'bg-gray-200',
                dividerText: 'text-gray-500 font-body text-sm',
                formResendCodeLink: 'text-purple-600 hover:text-purple-700 font-body',
                identityPreviewText: 'font-body',
                identityPreviewEditButtonIcon: 'text-purple-600',
                verificationLinkStatusText: 'font-body',
                verificationLinkStatusIconBox: 'border-purple-200',
              },
              variables: {
                colorPrimary: '#6B46C1',
                colorText: '#1a1a1a',
                colorTextSecondary: '#666666',
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#1a1a1a',
                borderRadius: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
              }
            }}
            redirectUrl="/dashboard"
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 font-body">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}