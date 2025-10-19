'use client';

import { UserButton, useUser, SignOutButton } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  History,
  Dog,
  User,
  FileText,
  Menu,
  X,
  Plus,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'New Booking', href: '/book', icon: Plus },
  { name: 'Upcoming', href: '/dashboard/bookings', icon: Calendar },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'My Dogs', href: '/dashboard/dogs', icon: Dog },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-500 ease-in-out lg:hidden ${
          sidebarOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-500 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ willChange: sidebarOpen ? 'transform' : 'auto' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-80 active:opacity-60">
              <Image
                src="/images/100-K9-logo-horizontal.png"
                alt="100% K9 Dog Boarding"
                width={260}
                height={60}
                className="h-16 w-auto"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 active:bg-gray-100 touch-manipulation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-3 rounded-xl text-sm font-button transition-colors touch-manipulation
                    ${isActive 
                      ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-cyan-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-button font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate font-body">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
            <SignOutButton>
              <button className="w-full flex items-center justify-center px-3 py-2 text-sm font-button font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 rounded-md text-gray-400 hover:text-gray-600 active:bg-gray-100 touch-manipulation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-80 active:opacity-60">
              <Image
                src="/images/100-K9-logo-horizontal.png"
                alt="100% K9 Dog Boarding"
                width={130}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
            <div className="w-8"> {/* Spacer */}</div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}