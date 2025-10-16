'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';
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
  Plus
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-heading text-sm font-bold">K9</span>
              </div>
              <h1 className="font-heading text-xl text-black">100% K9</h1>
            </div>
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
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
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
            <div className="flex items-center">
              <div className="h-6 w-6 bg-black rounded flex items-center justify-center mr-2">
                <span className="text-white font-heading text-xs">K9</span>
              </div>
              <span className="font-heading text-lg text-black">100% K9</span>
            </div>
            <div className="w-8"> {/* Spacer */}</div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}