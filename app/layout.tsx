import type { Metadata } from 'next'
import { Inter, Jacques_Francois, DM_Sans, Poppins } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import './globals.css'

// 100% K9 Brand Fonts
const jacquesFrancois = Jacques_Francois({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading'
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-body'
})

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-button'
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '100% K9 Dog Boarding & Homestay',
  description: 'Professional dog boarding and homestay services with premium care',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} ${jacquesFrancois.variable} ${dmSans.variable} ${poppins.variable}`}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}