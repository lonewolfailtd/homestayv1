import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat'
})

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Dog Boarding Auckland | Premium Homestay Services | 100% K9',
  description: 'Professional dog boarding in Auckland. Premium homestay care with 24/7 monitoring, farm-based exercise, and personalised attention. Book your dog\'s Auckland stay today!',
  keywords: ['dog boarding Auckland', 'dog homestay Auckland', 'pet boarding Auckland', 'dog kennels Auckland', 'dog daycare Auckland', 'premium dog care Auckland', 'farm dog boarding', 'dog sitting Auckland'],
  authors: [{ name: '100% K9' }],
  icons: {
    icon: '/images/100-K9-logo-stacked.png',
    apple: '/images/100-K9-logo-stacked.png',
  },
  openGraph: {
    title: 'Dog Boarding Auckland | Premium Homestay Services | 100% K9',
    description: 'Professional dog boarding in Auckland with farm-based exercise, 24/7 care, and personalised attention. Trusted by 500+ happy dog owners.',
    url: 'https://booking.100percentk9.co.nz',
    siteName: '100% K9 Dog Boarding',
    locale: 'en_NZ',
    type: 'website',
    images: [
      {
        url: '/images/dog-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional dog boarding services in Auckland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dog Boarding Auckland | 100% K9',
    description: 'Premium dog boarding and homestay services in Auckland. Book your dog\'s farm stay today!',
    images: ['/images/dog-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://booking.100percentk9.co.nz',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} ${montserrat.variable} ${inter.variable}`}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}