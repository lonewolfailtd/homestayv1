# Dog Boarding Booking System - Development Guide

## Project Overview
A modern Next.js web application for managing dog boarding bookings with user authentication, multi-step booking form, dashboard management, integrated GoHighLevel CRM, and Xero invoicing. **PHASE 1 COMPLETE - Enhanced UI/UX Ready for Phase 2!**

### Key Features - Phase 1 (COMPLETED Oct 16, 2025)
- ✅ **User Authentication**: Clerk-based sign-up/sign-in with branded UI
- ✅ **Modern Homepage**: Professional landing page with authentication integration
- ✅ **Multi-Step Booking**: 6-step progressive form with interactive calendar
- ✅ **Interactive Calendar**: Custom date picker matching design inspiration
- ✅ **Brand Design System**: 100% K9 colors, fonts, and professional styling
- ✅ **User Dashboard**: Overview page with stats and quick actions
- ✅ **Multiple Bookings**: Customers can make unlimited repeat bookings
- ✅ **GoHighLevel CRM**: Automatic contact creation and updates
- ✅ **Xero Invoicing**: Automated invoice generation with GST-inclusive pricing
- ✅ **Email Notifications**: Professional HTML confirmations with invoice links
- ✅ **Multi-Dog Management**: Track multiple dogs per customer
- ✅ **Dynamic Pricing**: Automatic calculation with additional services

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk with custom styling
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom design system
- **Language**: TypeScript
- **UI Components**: Custom components + Framer Motion
- **Form Management**: React Hook Form + Zod validation
- **Calendar**: Custom interactive calendar with react-day-picker
- **Notifications**: Sonner toasts
- **Integrations**: Xero Node SDK, GoHighLevel REST API

## Development Commands

### Setup
```bash
npm install
npx prisma generate
npx prisma db push
```

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open database GUI
```

## Key Files & Structure

### Core Components - Phase 1 Complete
- `app/page.tsx` - Modern homepage with authentication integration
- `app/book/page.tsx` - Multi-step booking form
- `app/dashboard/` - User dashboard with overview and navigation
- `components/booking/MultiStepBookingForm.tsx` - 6-step progressive form
- `components/booking/InteractiveCalendar.tsx` - Custom date picker
- `components/booking/steps/` - Individual form steps (Welcome, Customer, Dog, Date, Services, Summary)
- `lib/db.ts` - Database connection
- `lib/xero.ts` - Xero integration (✅ Working)
- `lib/gohighlevel.ts` - GoHighLevel integration (✅ Working)
- `lib/email.ts` - Email notification system (✅ Working)

### API Routes
- `app/api/customers/route.ts` - Customer lookup
- `app/api/pricing/calculate/route.ts` - Price calculation
- `app/api/booking/submit/route.ts` - Booking submission
- `app/api/xero/auth/route.ts` - Xero OAuth
- `app/api/gohighlevel/webhook/route.ts` - GHL webhooks

### Database Schema
- `prisma/schema.prisma` - Database models

## Environment Variables Required
```
# Database
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Xero Integration
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_REDIRECT_URI=http://localhost:3000/api/xero/callback

# GoHighLevel Integration
GOHIGHLEVEL_API_KEY=your_ghl_private_integration_token
GOHIGHLEVEL_LOCATION_ID=your_ghl_location_id
```

## Current Working Configuration - Phase 1
- **Authentication**: Clerk fully integrated (✅ Working)
  - Custom branded sign-in/sign-up pages
  - User dashboard with protected routes
  - Middleware-based route protection
- **Database**: Neon PostgreSQL (✅ Connected)
- **UI/UX**: Modern design system (✅ Complete)
  - 100% K9 brand colors and fonts
  - Multi-step booking form with 6 steps
  - Interactive calendar with peak period highlighting
  - Mobile-responsive design
- **Xero**: OAuth integrated with Smart Item Code Selection (✅ Working)
  - Short Stay (1-4 days): Item Code `4010-01`
  - Standard Stay (5-30 days): Item Code `4010-02` 
  - Long-Term Stay (31+ days): Item Code `4010-03`
  - Additional Services: Item Code `4010-08`
  - Account 228 (Homestays), 15% GST (OUTPUT2)
  - Automatic invoice email via Xero
- **GoHighLevel**: V2 API with Private Integration token (✅ Working)
- **Email**: Notification system with HTML templates (✅ Working)

## Common Tasks

### Adding New Features
1. Update database schema in `prisma/schema.prisma` if needed
2. Run `npx prisma db push` to update database
3. Update TypeScript types
4. Add API routes in `app/api/`
5. Update frontend components
6. Test with `npm run dev`

### Debugging
- Check browser console for client-side errors
- Check terminal for server-side errors
- Use `console.log` in API routes for debugging
- Use Prisma Studio to inspect database: `npx prisma studio`

### Troubleshooting Database Issues
- If Prisma can't connect to Neon database, check if environment variables are cached
- Close terminal completely and open fresh one to clear cached environment variables
- Verify DATABASE_URL in `.env.local` matches Neon dashboard connection string
- Ensure Neon database is awake (databases sleep after inactivity)

### Testing Integrations
- Xero: Use `/api/xero/auth` to authenticate (✅ Working)
- GoHighLevel: Direct contact lookup via contact ID (✅ Working)
- Database: Use Prisma Studio to verify data storage (✅ Working)
- Email: HTML notifications sent for each booking (✅ Working)

## Recent Fixes Completed (Oct 2025)
- ✅ **Multiple Bookings**: Fixed database constraints to allow repeat customers
- ✅ **GoHighLevel Integration**: Fixed V2 API contact search and update (contact ID: klHqwVP94twjcZDHn0nt)
- ✅ **Xero Integration**: Smart item code selection based on stay duration with GST-inclusive pricing
  - Proper item codes: 4010-01 (Short), 4010-02 (Standard), 4010-03 (Long-term), 4010-08 (Services)
  - Automatic invoice email sending via Xero API
  - Account 228 (Homestays) with OUTPUT2 tax type
  - **NEW**: GST-inclusive pricing (lineAmountTypes: 'Inclusive') - prices include 15% GST
- ✅ **Email System**: Professional HTML notifications with booking details and invoice links
- ✅ **Environment Variables**: Resolved caching issues with proper credential loading
- ✅ **Contact Management**: Smart customer/dog record updates for existing users
- ✅ **Date Validation**: Prevents past date selection in booking form (Oct 16, 2025)
  - Check-in date minimum: today's date
  - Check-out date minimum: day after check-in
  - Fixes last-minute booking calculation bug
- ✅ **Individual Service Line Items**: Separate Xero invoice lines for each service (Oct 16, 2025)
  - Instead of grouped "Additional services", each service gets its own line
  - Proper item codes and quantities for grooming, training, walks, meals
  - Works for both deposit and balance invoices

## Advanced Pricing System (Oct 2025)
- ✅ **Comprehensive Database Schema**: Peak periods, pricing tiers, services with prerequisites
- ✅ **NZ Public Holiday Calendar**: All 2025 holidays with 20% surcharges automatically applied
- ✅ **Dynamic Pricing Engine**: Smart rate calculation based on stay duration and peak periods
- ✅ **Deposit Payment System**: 50% upfront, balance 3 weeks before check-in with smart timing
- ✅ **Enhanced Xero Integration**: GST, correct item codes, automatic invoice emails
- ✅ **Business Logic Implementation**: Christmas 7-day minimum, last-minute full payment

## Peak Periods 2025 (20% Surcharge)
- New Year's Period: Dec 28, 2024 – Jan 5, 2025
- Auckland Anniversary: Jan 25-27, 2025
- Waitangi Day: Feb 7-9, 2025  
- Easter Weekend: Apr 18-21, 2025
- ANZAC Day: Apr 25-27, 2025
- King's Birthday: May 31-Jun 2, 2025
- Matariki: Jun 20-22, 2025
- Labour Day: Oct 25-27, 2025
- Christmas/Boxing Day: Dec 20-28, 2025 (7-day minimum)

## Pricing Tiers
- Short Stay (1-4 days): $85/day
- Standard Stay (5-30 days): $80/day  
- Long Stay (31+ days): $75/day

## Test Results (Latest - Oct 16, 2025)
- Advanced pricing system: ✅ All NZ holidays and tiers loaded in database
- Deposit payment logic: ✅ Smart timing based on booking date (59+ days = 2 invoices)
- Peak period detection: ✅ Automatic 20% surcharge calculation (Christmas detected)
- Multiple dog bookings: ✅ Same customer, different dogs (Max, Buddy, Charlie, Luna, Rex, Bella, Item Code Test)
- Xero integration: ✅ GST-inclusive pricing, separate service line items, automatic emails
- Date validation: ✅ Prevents past dates, enforces check-out > check-in
- Service line items: ✅ Individual lines for grooming, training, walks (no more grouping)
- Two-invoice system: ✅ Deposit (immediate) + Balance (5 weeks before check-in)

## Deployment Notes
- Configure environment variables on hosting platform
- Ensure PostgreSQL database is accessible
- Run `npm run build` to verify production build
- Consider using Vercel, Railway, or similar for easy deployment

## Phase 1 Complete - UI/UX Enhancement (Oct 16, 2025)

### What Was Accomplished
- ✅ **Modern Authentication System**: Clerk integration with branded UI
- ✅ **Complete UI Overhaul**: Professional design matching 100% K9 brand
- ✅ **Multi-Step Booking Form**: 6-step progressive form with validation
- ✅ **Interactive Calendar**: Custom date picker with peak period highlighting
- ✅ **User Dashboard**: Overview page with navigation structure
- ✅ **Mobile-First Design**: Responsive layout with touch-friendly interactions
- ✅ **Enhanced Forms**: Auto-populated user data, validation, progress tracking
- ✅ **Brand Consistency**: Jacques Francois headings, DM Sans body, Poppins buttons

### New User Experience Flow
1. **Landing Page**: Modern homepage with authentication options
2. **Sign Up/Sign In**: Branded auth pages with custom styling
3. **Dashboard**: User overview with stats and quick actions
4. **Booking Flow**: 6-step form (Welcome → Customer → Dog → Dates → Services → Summary)
5. **Calendar Selection**: Interactive date picker with availability and pricing
6. **Service Selection**: Visual cards with quantity controls
7. **Review & Confirm**: Complete summary with payment information

### File Structure Added
```
components/booking/
├── MultiStepBookingForm.tsx       # Main form container
├── InteractiveCalendar.tsx        # Custom calendar component
├── ProgressIndicator.tsx          # Step progress tracker
├── StepNavigation.tsx            # Next/Previous navigation
├── FormContext.tsx               # Form state management
└── steps/
    ├── WelcomeStep.tsx           # Introduction and features
    ├── CustomerStep.tsx          # User details (auto-populated)
    ├── DogStep.tsx               # Dog profile and behavior
    ├── DateStep.tsx              # Interactive calendar selection
    ├── ServicesStep.tsx          # Additional services
    └── SummaryStep.tsx           # Review and confirmation

app/
├── page.tsx                      # Modern homepage
├── book/page.tsx                 # Multi-step booking
├── sign-in/[[...sign-in]]/       # Clerk auth pages
├── sign-up/[[...sign-up]]/       # Clerk auth pages
└── dashboard/
    ├── layout.tsx                # Dashboard navigation
    └── page.tsx                  # Overview dashboard
```

## Phase 2 - Next Steps (See docs/REMAINING_IMPLEMENTATION.md)

### High Priority
1. **Database Schema Updates**: Add User, SavedDog, BookingView models
2. **API Integration**: Link bookings to authenticated users
3. **Clerk Webhook**: Sync user data with database
4. **Dashboard Pages**: Bookings, History, Dogs, Profile management

### Medium Priority
5. **Mobile Optimization**: Responsive calendar, touch gestures
6. **Performance**: Loading states, optimistic updates
7. **Error Handling**: Comprehensive error boundaries

### Success Metrics Target
- Booking completion rate: 35% → 65%
- Mobile conversions: +50%
- Repeat customers: 40% → 70%
- User registration: 80% of bookings

## Domain Configuration
- **Production URL**: https://booking.100percentk9.co.nz/
- **DNS Setup**: CNAME record pointing `booking.100percentk9.co.nz` to `cname.vercel-dns.com`