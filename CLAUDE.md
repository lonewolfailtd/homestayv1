# Dog Boarding Booking System - Development Guide

## Project Overview
A modern Next.js web application for managing dog boarding bookings with user authentication, multi-step booking form, dashboard management, integrated GoHighLevel CRM, and Xero invoicing. **PHASE 4 COMPLETE - Booking Modification & Cancellation System!**

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

### Key Features - Phase 2 (COMPLETED Oct 17, 2025)
- ✅ **Quick Rebooking**: Streamlined booking for existing customers with saved dogs
- ✅ **File Upload System**: Upload vet records, vaccination photos, and dog photos
- ✅ **Storage Management**: Secure file storage with user-specific directories
- ✅ **Profile Management**: Update personal details and dog information
- ✅ **Onboarding Wizard**: 4-step guided setup for new users
- ✅ **Service Showcase**: Comprehensive service discovery pages
- ✅ **Brand Color Update**: Removed purple, implemented 100% K9 brand colors
- ✅ **Document Management**: File categorization and deletion capabilities
- ✅ **Dashboard Layout Optimization**: Fixed positioning and sizing for optimal UX

### Key Features - Phase 3 (COMPLETED Oct 19, 2025)
- ✅ **Payment Method Tracking**: Complete cash/card/bank transfer tracking across all dashboard pages
- ✅ **Branded Email Templates**: 100% K9 branded booking confirmations with payment-specific instructions
- ✅ **Dashboard Enhancement**: Added payment tracking to Bookings, History, and Invoices pages
- ✅ **Accounting Integration**: Full Xero invoice generation for all payment methods including cash
- ✅ **Payment Badges**: Visual payment method indicators (💵 Cash, 💳 Card, 🏦 Bank Transfer)

### Key Features - Phase 4 (COMPLETED Oct 19, 2025)
- ✅ **Booking Modifications**: Customers can change booking dates with automatic price recalculation
- ✅ **Cancellation System**: Self-service booking cancellations with tiered refund policy
- ✅ **Refund Calculator**: Real-time refund calculation (30+ days: 100%, 14-29: 75%, 7-13: 50%, <7: 0%)
- ✅ **Modification History**: Complete audit trail of all booking changes
- ✅ **Business Rules Enforcement**: 7-day modification window automatically enforced
- ✅ **Price Recalculation**: Smart pricing updates with peak period and tier detection
- ✅ **Booking Detail Page**: Comprehensive view with modification and cancellation options
- ✅ **Status Badges**: Visual indicators for cancelled and pending modification bookings

### Production Deployment Fixes (Oct 19, 2025)
- ✅ **Resend Email Integration**: Production-ready email sending with Resend API
- ✅ **Invoice Download URLs**: Direct links to Xero invoices for customer access
- ✅ **Graceful Email Fallback**: Works in development without API keys, production-ready with keys
- ⏳ **Clerk Production Keys**: Requires manual update in Vercel (see `/docs/PRODUCTION_FIXES_REQUIRED.md`)
- ⏳ **Apple Sign-In**: Future enhancement (see `/docs/APPLE_SIGNIN_SETUP.md`)

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

## Development Best Practices

### Task Management & Commits
- **Complete Related Work Before Committing**: Always finish all related tasks in your todo list before committing, unless you have a very large todo list (5+ items), then commit after completing logical groups
- **Use TodoWrite Tool**: Track all tasks and mark them completed as you finish them
- **Batch Related Changes**: Group related fixes (UI updates, bug fixes, new features) into single commits
- **Clear Commit Messages**: Use descriptive commit messages that explain both what changed and why

### Code Quality Standards
- **Test Changes**: Always test functionality after making changes
- **Follow Existing Patterns**: Match existing code style and architectural patterns
- **Brand Consistency**: Ensure all UI changes align with 100% K9 brand colors (cyan, black, gray)
- **Mobile Responsive**: Test all changes on mobile devices
- **NZ English Standards**: All user-facing text MUST use New Zealand English spelling and grammar
  - Use "s" not "z": organise, personalise, customise, recognise
  - Use "our" not "or": colour, favour, honour, behaviour
  - Use "re" not "er": centre, metre, litre
  - Use "ise" not "ize": realise, specialise, emphasise
  - Use "ogue" not "og": dialogue, catalogue
  - **No Oxford comma**: Remove comma before "and" in lists (e.g., "monitoring, exercise and care" not "monitoring, exercise, and care")
  - Date format: DD/MM/YYYY (e.g., 25/12/2025)
  - Common NZ terms: vet (not veterinarian), mum/dad (not mom), mobile (not cell phone)
  - **IMPORTANT**: Apply these standards to ALL user-facing text including:
    - UI components, buttons, labels
    - Form fields and validation messages
    - Email templates and notifications
    - Marketing copy and descriptions
    - Error messages and help text
    - SEO metadata and page titles

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

### New Components - Phase 2 Complete
- `app/dashboard/rebook/page.tsx` - Quick rebooking for existing customers
- `app/dashboard/dogs/[id]/edit/page.tsx` - Dog profile editing with file uploads
- `app/onboarding/page.tsx` - 4-step onboarding wizard for new users
- `app/services/page.tsx` - Service showcase and discovery page
- `components/ui/FileUpload.tsx` - Reusable file upload component
- `public/images/` - Brand asset storage directory

### Enhanced Components - Phase 3 Complete
- `lib/email.ts` - Fully branded email templates with payment-specific instructions
- `app/dashboard/bookings/page.tsx` - Enhanced with payment method badges
- `app/dashboard/history/page.tsx` - Enhanced with payment tracking
- `app/dashboard/invoices/page.tsx` - Enhanced with payment method display
- `components/booking/steps/SummaryStep.tsx` - Added payment method selection

### New Components - Phase 4 Complete
- `app/dashboard/bookings/[id]/page.tsx` - Booking detail page with modification/cancellation options
- `components/booking/ModifyBookingModal.tsx` - Date modification modal with validation
- `components/booking/CancelBookingModal.tsx` - Cancellation modal with refund calculator
- `lib/booking-modifications.ts` - Business logic library for modifications and refunds (470 lines)
- `app/api/booking/[id]/route.ts` - Booking detail endpoint
- `app/api/booking/[id]/modify/route.ts` - Modification API with price recalculation
- `app/api/booking/[id]/cancel/route.ts` - Cancellation API with refund processing

### API Routes
- `app/api/customers/route.ts` - Customer lookup
- `app/api/customers/dogs/route.ts` - Fetch user's saved dogs
- `app/api/pricing/calculate/route.ts` - Price calculation
- `app/api/booking/submit/route.ts` - Booking submission with payment method tracking
- `app/api/booking/rebook/route.ts` - Quick rebooking for existing customers
- `app/api/dogs/[id]/route.ts` - Dog profile management (GET/PUT)
- `app/api/dogs/[id]/files/[fileId]/route.ts` - File deletion
- `app/api/upload/route.ts` - File upload handling
- `app/api/user/profile/route.ts` - User profile management
- `app/api/user/bookings/route.ts` - Fetch user bookings with payment tracking
- `app/api/user/invoices/route.ts` - Generate invoice list with payment method data
- `app/api/xero/auth/route.ts` - Xero OAuth
- `app/api/gohighlevel/webhook/route.ts` - GHL webhooks

### Database Schema
- `prisma/schema.prisma` - Database models
  - Added `BookingModification` model for audit trail (Phase 4)
  - Added cancellation tracking fields to Booking model (Phase 4)

## Environment Variables Required

### Local Development (.env.local)
```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...

# Clerk Authentication (Development Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Email Configuration (Resend) - Optional for local dev
# RESEND_API_KEY=re_... (commented out - emails log to console in dev)
# EMAIL_FROM=bookings@100percentk9.co.nz
# EMAIL_CC=training@100percentk9.co.nz

# Xero Integration
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_REDIRECT_URI=http://localhost:3000/api/xero/callback

# GoHighLevel Integration
GOHIGHLEVEL_API_KEY=your_ghl_private_integration_token
GOHIGHLEVEL_LOCATION_ID=your_ghl_location_id
```

### Production (Vercel Environment Variables)
```bash
# Database - Same as development
DATABASE_URL=postgresql://...

# Clerk Authentication (Production Keys - REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Email Configuration (Resend) - REQUIRED for production emails
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=bookings@100percentk9.co.nz
EMAIL_CC=training@100percentk9.co.nz

# Xero Integration - Same as development
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_REDIRECT_URI=https://booking.100percentk9.co.nz/api/xero/callback

# GoHighLevel Integration - Same as development
GOHIGHLEVEL_API_KEY=your_ghl_private_integration_token
GOHIGHLEVEL_LOCATION_ID=your_ghl_location_id
```

### Key Differences: Development vs Production
- **Clerk Keys**: `pk_test_` vs `pk_live_`, `sk_test_` vs `sk_live_`
- **Resend Email**: Optional in dev (logs to console), Required in prod (sends real emails)
- **Xero Redirect**: localhost vs production domain
- **All other variables**: Same in both environments

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

### Production Deployment Fixes (Oct 19, 2025)
- ✅ **Resend Email Integration**: Complete production-ready email system
  - Installed Resend SDK package
  - Integrated with booking confirmation flow
  - Graceful fallback: logs to console in dev, sends emails in prod
  - Updated CC email to training@100percentk9.co.nz
  - Free tier: 3,000 emails/month (100/day)
- ✅ **Invoice Download URLs**: Fixed customer invoice access
  - Added Xero online invoice view URLs
  - Works for deposit, balance, and legacy invoices
  - Format: `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID={id}`
- ✅ **Clerk Production Keys**: Updated configuration
  - Local development uses `pk_test_` / `sk_test_` keys
  - Production ready with `pk_live_` / `sk_live_` keys
  - Eliminates development key warnings in production
- ✅ **Documentation Updates**: Comprehensive deployment guides
  - Created `/docs/PRODUCTION_FIXES_REQUIRED.md` - Critical deployment checklist
  - Created `/docs/APPLE_SIGNIN_SETUP.md` - Future Apple Sign-In guide
  - Updated CLAUDE.md with Phase 5 roadmap and deployment status

### Earlier Fixes (Oct 16-18, 2025)
- ✅ **Dashboard Layout Fix**: Corrected sidebar positioning for proper content alignment (Oct 19, 2025)
  - Removed `lg:static` from sidebar - now fixed at all screen sizes
  - Added proper vertical padding to main content area (`py-6 lg:py-8`)
  - Removed problematic negative margin approach from dashboard page
  - Content now starts at top of viewport, properly aligned with sidebar logo
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

## Phase 2 - Customer Journey Implementation (Oct 17, 2025)

### What Was Accomplished
- ✅ **Enhanced Color Scheme**: Completely removed purple, implemented proper 100% K9 brand colors (black, gray, cyan accents)
- ✅ **Quick Rebooking System**: Streamlined booking flow for returning customers with saved dog profiles
- ✅ **File Management System**: Complete upload/storage solution for vet records, vaccination photos, and dog images
- ✅ **Profile Management**: Enhanced user and dog profile editing with document attachment capabilities
- ✅ **Onboarding Experience**: 4-step wizard for new user setup and service discovery
- ✅ **Service Discovery**: Professional service showcase pages with pricing and testimonials
- ✅ **Brand Asset Management**: Proper folder structure for logos and brand materials

### New Customer Journey Flow
1. **Landing Page** → Professional homepage with clear CTAs for login/signup
2. **Registration** → Clerk authentication with branded styling  
3. **Onboarding** → 4-step guided setup (Welcome → Profile → Tour → Complete)
4. **Dashboard Hub** → Central location with quick actions and rebooking
5. **Service Discovery** → `/services` page for exploring offerings before booking
6. **Full Booking** → Multi-step form for first-time bookings
7. **Quick Rebooking** → Simplified flow using saved dog profiles
8. **Profile Management** → Update details and upload important documents

### File Management Features
- **Upload Types**: Images (JPG, PNG, GIF), PDF, Word documents
- **File Categories**: Vaccination records, vet certificates, dog photos, general documents  
- **Storage**: User-specific directories with secure access
- **Management**: View, download, and delete uploaded files
- **Integration**: Seamlessly integrated into dog profile editing

### Database Enhancements
- **DogFile Model**: Complete file metadata storage with categorization
- **User-Dog Relationships**: Enhanced linking for quick rebooking
- **File Security**: User-scoped access and proper cleanup on deletion

### API Endpoints Added
- `/api/upload` - File upload handling with validation
- `/api/booking/rebook` - Quick rebooking for existing customers
- `/api/customers/dogs` - Fetch user's saved dog profiles
- `/api/dogs/[id]` - Dog profile management (view/edit)
- `/api/dogs/[id]/files/[fileId]` - File management operations

## Domain Configuration
- **Production URL**: https://booking.100percentk9.co.nz/
- **DNS Setup**: CNAME record pointing `booking.100percentk9.co.nz` to `cname.vercel-dns.com`

## Recent Updates (Oct 19, 2025)
- 🎨 **Brand Consistency**: All purple references removed, proper K9 colors implemented
- 🚀 **Quick Rebooking**: Repeat customers can book in 3 clicks with saved dogs
- 📁 **File Uploads**: Secure document management for vet records and photos
- 👤 **Profile Management**: Enhanced user and dog profile editing capabilities
- 🎯 **Onboarding**: Guided setup for new users with service discovery
- 🏪 **Service Pages**: Professional showcase of all boarding and additional services
- 💾 **File Storage**: Organized user-specific file storage with proper cleanup
- 🔗 **Enhanced APIs**: New endpoints for rebooking, file management, and profiles
- 📐 **Dashboard Layout**: Optimized positioning and responsive design
- 🗂️ **Separate File Tabs**: Photos and vaccinations now properly separated with context-aware categorization
- 📋 **Profile Progress Modal**: Click-outside to close functionality added
- ✅ **Profile Completeness**: Real-time tracking with on-demand progress checking
- 💳 **Payment Method Tracking**: Complete tracking system for cash, card, and bank transfer payments
- 📧 **Branded Email Templates**: 100% K9 branded booking confirmations with payment-specific instructions
- 📊 **Dashboard Payment Tracking**: Payment method badges across all dashboard pages (Bookings, History, Invoices)

## Dashboard Layout Configuration

### Key Positioning Settings
- **Sidebar**: `fixed inset-y-0 left-0 w-64` - Fixed positioning at all screen sizes (mobile slides in/out with transform)
- **Main Content Area**: `lg:pl-64 px-4 py-6 lg:py-8` - Left padding for sidebar width, responsive vertical spacing
- **Dashboard Container**: `space-y-6` - Simple vertical spacing between sections
- **Logo Size**: `h-16 w-auto` (260px width, 60px height) - Prominent sidebar branding
- **Grid Spacing**: `gap-4` - Consistent spacing between stat cards and content sections

### Layout Architecture
- **Sidebar**: Fixed 256px width at all screen sizes, removed from document flow
- **Main Content**: `lg:pl-64` offset compensates for fixed sidebar width
- **Responsive**: Mobile sidebar slides in/out with `translateX`, desktop sidebar always visible and fixed
- **Grid System**: 5-column stats grid on large screens, responsive breakpoints
- **Vertical Spacing**: Clean padding-based approach (`py-6 lg:py-8`) replaces old negative margin system

**IMPORTANT**: The sidebar must remain `fixed` at all screen sizes. Do NOT use `lg:static` as it breaks the layout by inserting the sidebar into document flow, pushing content down.
- 🎯 **Horizontal Logo**: 100% K9 branding implemented across all pages
- 🔧 **Build Fixes**: Resolved all Vercel deployment errors for production release

## File Categorization System (Oct 19, 2025)

### Context-Aware File Upload
Files are automatically categorized based on which tab they're uploaded from:
- **Photos Tab** (activeTab='files'): All uploads → `fileCategory: 'photo'`
- **Vaccinations Tab** (activeTab='vaccinations'): All uploads → `fileCategory: 'vaccination'`
- **Medical & Vet Tab**: Auto-detection based on filename/type

### Category Display Logic
- **Photos Tab**: Only displays files where `fileCategory === 'photo'`
- **Vaccinations Tab**: Only displays files where `fileCategory === 'vaccination'`
- Each tab is completely isolated from the others

### API Schema Requirements
The Zod validation schema in `/api/dogs/[id]/route.ts` must include `category: z.string().optional()` in the files array to allow the category field to pass through validation. Without this, Zod strips the category field during validation.

### Auto-Detection Fallback
If no category is provided (shouldn't happen with context-aware system), the API falls back to:
1. Images → 'photo'
2. Filenames with vaccine keywords → 'vaccination'
3. Filenames with vet keywords → 'vet'
4. Default → 'other'

### Database Schema
`DogFile.fileCategory`: String field storing 'photo' | 'vaccination' | 'vet' | 'other'

### Profile Completeness Integration
- `hasDogPhotos`: Checks for files where `fileCategory === 'photo'`
- `hasVaccinationRecords`: Checks for files where `fileCategory === 'vaccination'`

## Booking Modification & Cancellation System (Oct 19, 2025)

### Overview
Complete self-service booking modification and cancellation system with tiered refund policy, automatic price recalculation, and comprehensive audit trails.

### Key Features Implemented

**Booking Modifications:**
- ✅ Change booking dates with automatic price recalculation
- ✅ 7-day modification window enforcement (cannot modify within 7 days of check-in)
- ✅ Smart pricing updates detecting tier changes (short/standard/long stay)
- ✅ Peak period surcharge recalculation
- ✅ Price difference calculation (customer pays more or receives credit)
- ✅ Modification reason tracking

**Booking Cancellations:**
- ✅ Self-service cancellation with refund calculator
- ✅ Tiered refund policy based on days until check-in:
  - **30+ days**: 100% full refund
  - **14-29 days**: 75% refund
  - **7-13 days**: 50% refund
  - **<7 days**: No refund
- ✅ Real-time refund breakdown display
- ✅ Cancellation reason tracking
- ✅ Policy acknowledgement checkbox

**Audit Trail:**
- ✅ Complete modification history timeline
- ✅ Original vs new values preserved
- ✅ Status tracking (pending, approved, completed)
- ✅ Who made the change and when
- ✅ Price adjustments recorded

### User Experience Flow

**Viewing Booking Details:**
1. Navigate to Dashboard > Bookings
2. Click any booking card to view detail page
3. See comprehensive booking information:
   - Dog details and special needs
   - Check-in/check-out dates
   - Services included
   - Payment status
   - Modification history

**Modifying a Booking:**
1. Click "Modify Booking" button (only shows if 7+ days until check-in)
2. Select new check-in and check-out dates
3. Provide modification reason
4. System validates dates and recalculates price
5. Review current vs new dates comparison
6. Submit modification request
7. Booking updated with new dates and pricing

**Cancelling a Booking:**
1. Click "Cancel Booking" button
2. Review real-time refund calculation
3. See detailed refund breakdown:
   - Total booking price
   - Cancellation fee (based on tiered policy)
   - Final refund amount
   - Refund percentage
4. Provide cancellation reason
5. Acknowledge cancellation policy
6. Submit cancellation
7. Booking marked as cancelled with refund amount recorded

### Technical Implementation

**Database Schema:**
- `BookingModification` table stores all changes
- Booking model enhanced with cancellation fields:
  - `isCancelled`: Boolean flag
  - `cancellationDate`: When cancelled
  - `cancellationReason`: Why cancelled
  - `refundAmount`: Amount to be refunded

**Business Logic (`lib/booking-modifications.ts`):**
- `canModifyDates()` - Eligibility validation
- `canCancelBooking()` - Cancellation eligibility
- `calculateRefund()` - Tiered refund calculation
- `recalculateBookingPrice()` - Price recalculation with pricing engine integration
- `validateNewDates()` - Date validation

**API Endpoints:**
- `GET /api/booking/[id]` - Fetch booking details with modifications
- `GET /api/booking/[id]/modify` - Check modification eligibility
- `POST /api/booking/[id]/modify` - Calculate new price or confirm modification
- `GET /api/booking/[id]/cancel` - Get cancellation info with refund amount
- `POST /api/booking/[id]/cancel` - Process cancellation

**Frontend Components:**
- Booking detail page with responsive 3-column layout
- Modify booking modal with date picker and validation
- Cancel booking modal with refund calculator
- Modification history timeline
- Status badges (Cancelled, Modification Pending)

### Business Rules Enforced

**Modification Window:**
- Must be 7+ days before check-in
- Cannot modify if booking is already cancelled
- Cannot modify if balance payment is overdue

**Cancellation Policy:**
- Tiered refund based on notice period
- Cancellation reason required
- Policy acknowledgement required
- Refund amount calculated automatically

**Price Recalculation:**
- Integrates with existing pricing engine
- Detects peak period changes
- Recalculates pricing tier based on new duration
- Applies 20% surcharge if new dates include peak periods
- Accurate to the cent with GST handling

### Status Badges

**On Bookings List:**
- 🔴 "Cancelled" - Red badge for cancelled bookings
- 🟡 "Modification Pending" - Yellow badge for pending modifications
- 🟠 Peak period names - Amber badge for peak bookings

**On Detail Page:**
- Modification status with colour coding:
  - Pending: Yellow
  - Approved: Green
  - Rejected: Red

### Future Enhancements (Not Yet Implemented)

These features are documented but can be added later:
- ⏳ Email notifications for modifications/cancellations
- ⏳ Xero integration for credit notes (refund processing)
- ⏳ Calendar event updates (.ics files)
- ⏳ Admin approval workflow for special cases
- ⏳ Service modifications (add/remove services)
- ⏳ Modification rate limiting (max 3 per booking)

### Files Created

**Backend:**
1. `/lib/booking-modifications.ts` - Business logic library (470 lines)
2. `/app/api/booking/[id]/route.ts` - Booking detail endpoint (100 lines)
3. `/app/api/booking/[id]/modify/route.ts` - Modification API (270 lines)
4. `/app/api/booking/[id]/cancel/route.ts` - Cancellation API (230 lines)

**Frontend:**
1. `/app/dashboard/bookings/[id]/page.tsx` - Booking detail page (630 lines)
2. `/components/booking/ModifyBookingModal.tsx` - Modification modal (250 lines)
3. `/components/booking/CancelBookingModal.tsx` - Cancellation modal (280 lines)

**Documentation:**
1. `/docs/BOOKING_MODIFICATION_SYSTEM.md` - Complete design document (460 lines)
2. `/docs/BOOKING_MODIFICATION_IMPLEMENTATION_STATUS.md` - Implementation status (502 lines)

**Total Code:** ~2,330 lines
**Total Documentation:** ~962 lines

### Testing the System

**Prerequisites:**
- Have at least one booking in the database
- Booking must be 8+ days in the future to test modifications

**Test Scenarios:**

1. **View Booking Details:**
   - URL: `http://localhost:3002/dashboard/bookings`
   - Click any booking card
   - Verify all information displays correctly

2. **Modify Booking Dates:**
   - On booking detail page, click "Modify Booking"
   - Select new dates (at least 7 days from today)
   - Add modification reason
   - Submit and verify booking updates

3. **Cancel Booking:**
   - Click "Cancel Booking" button
   - Review refund calculation
   - Provide reason and acknowledge policy
   - Submit and verify cancellation

4. **View Modification History:**
   - After modification or cancellation
   - Scroll to "Modification History" section
   - Verify timeline shows all changes

## Payment Method Tracking System (Oct 19, 2025)

### Payment Method Options
- **Cash** (💵): Manual payment with Xero invoice for accounting reconciliation
- **Card** (💳): Online payment through Xero invoice link
- **Bank Transfer** (🏦): Direct bank deposit with invoice reference

### Implementation Details

**Database Schema:**
- Added `paymentMethod` field to Booking model (String, default: "card")
- Stores: "cash" | "card" | "bank_transfer"

**Booking Flow:**
1. Customer selects payment method in SummaryStep
2. Payment preference stored with booking submission
3. Xero invoice generated for ALL payment methods (including cash)
4. Email sent with payment-specific instructions

**Email Templates:**
- Complete redesign with 100% K9 branding
- Header image from Google Storage
- Payment method-specific instruction sections
- Brand colors: Cyan (#1FB6E0), Green (#9ACA3C)
- Footer with logo, contact info, social media links

**Dashboard Integration:**
- Payment method badges displayed on:
  - Upcoming Bookings page (`/dashboard/bookings`)
  - Booking History page (`/dashboard/history`)
  - Invoices & Receipts page (`/dashboard/invoices`)
- Visual indicators: 💵 Cash, 💳 Card, 🏦 Bank Transfer

**API Enhancements:**
- `/api/booking/submit` - Stores payment method with booking
- `/api/user/bookings` - Returns payment method in booking list
- `/api/user/invoices` - Includes payment method in invoice records

**Accounting Workflow:**
- All bookings create Xero invoices regardless of payment method
- Cash payments tracked for manual reconciliation
- Invoice emails sent automatically by Xero
- 3-week payment deadline applies to all payment methods

---

## Future Enhancements & Roadmap

### Immediate Actions Required (Before Next Customer Booking)

**Priority 1 - Production Environment Setup:**
- [ ] Add Clerk production keys to Vercel (see `/docs/PRODUCTION_FIXES_REQUIRED.md`)
  - Get `pk_live_...` and `sk_live_...` from Clerk dashboard
  - Update Vercel environment variables
  - Redeploy application
- [ ] Add Resend email keys to Vercel
  - `RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (get from Resend dashboard)
  - `EMAIL_FROM=bookings@100percentk9.co.nz`
  - `EMAIL_CC=training@100percentk9.co.nz`
- [ ] Test complete booking flow on production
- [ ] Verify emails are being sent
- [ ] Test invoice download buttons

### Optional Enhancements (Phase 5+)

**Authentication Improvements:**
- ⏳ **Apple Sign-In** - See `/docs/APPLE_SIGNIN_SETUP.md`
  - Cost: $99/year Apple Developer Program
  - Setup time: 30-60 minutes
  - Benefit: Better iOS user experience
  - When: After 50+ users or customer requests

**Email System Enhancements:**
- ⏳ **Modification/Cancellation Emails** - Automated notifications
- ⏳ **Email Templates for All Events** - Booking confirmed, balance due, check-in reminder
- ⏳ **Domain Verification in Resend** - Better email deliverability
  - Add DNS records for 100percentk9.co.nz
  - Prevent emails going to spam

**Xero Integration Enhancements:**
- ⏳ **Credit Notes for Refunds** - Automated refund processing via Xero
- ⏳ **Payment Reconciliation** - Auto-mark invoices as paid when payment received
- ⏳ **Expense Tracking** - Link booking-related expenses

**Booking System Improvements:**
- ⏳ **Calendar Event Updates** - Modify .ics files when bookings change
- ⏳ **SMS Notifications** - Check-in reminders via Twilio
- ⏳ **Admin Dashboard** - Staff interface for managing bookings
- ⏳ **Service Modification** - Allow adding/removing services post-booking

**Analytics & Reporting:**
- ⏳ **Booking Analytics** - Track conversion rates, popular services
- ⏳ **Revenue Reporting** - Financial dashboards and forecasting
- ⏳ **Customer Insights** - Repeat booking rates, customer lifetime value

### Known Limitations (Acceptable for MVP)

**Current Constraints:**
- Email sending limited to 3,000/month (Resend free tier) - Sufficient for launch
- Xero invoice emails may go to spam without domain verification - Can verify domain later
- No SMS notifications - Email sufficient for now
- Manual refund processing - Low volume initially
- No admin dashboard - Can manage via database/Vercel logs

### Success Metrics to Track

**Week 1 Post-Launch:**
- All bookings receive email confirmations ✅
- No Clerk warnings in browser console ✅
- Invoice downloads working ✅
- Zero booking submission errors ✅

**Month 1 Post-Launch:**
- Track: Booking completion rate (target: 65%+)
- Track: Email delivery rate (target: 95%+)
- Track: Customer satisfaction with booking process
- Track: Number of modification/cancellation requests

**Month 3 Post-Launch:**
- Evaluate: Need for Apple Sign-In based on iOS usage
- Evaluate: Email sending volume (approaching 3,000/month limit?)
- Evaluate: Admin dashboard necessity
- Evaluate: Additional features requested by customers

---

## Documentation Index

### Setup & Configuration Guides
- `/docs/PRODUCTION_FIXES_REQUIRED.md` - **CRITICAL** - Production deployment checklist
- `/docs/APPLE_SIGNIN_SETUP.md` - Future enhancement guide for Apple authentication
- `/docs/REMAINING_IMPLEMENTATION.md` - Original phase planning (historical)

### Feature Documentation
- `/docs/BOOKING_MODIFICATION_SYSTEM.md` - Complete design document for modifications/cancellations
- `/docs/BOOKING_MODIFICATION_IMPLEMENTATION_STATUS.md` - Implementation status and testing guide
- `CLAUDE.md` - This file - Master development guide

### Reference Materials
- `README.md` - Quick start guide
- `prisma/schema.prisma` - Database schema with comments
- `.env.local.example` - Environment variables template (if created)