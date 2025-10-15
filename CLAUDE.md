# Dog Boarding Booking System - Development Guide

## Project Overview
A Next.js web application for managing dog boarding bookings with integrated GoHighLevel CRM and Xero invoicing. This system handles customer management, dog profiles, dynamic pricing, automated workflow integration, and email notifications. **FULLY OPERATIONAL - Production Ready!**

### Key Features
- ✅ **Multiple Bookings**: Customers can make unlimited repeat bookings
- ✅ **GoHighLevel CRM**: Automatic contact creation and updates
- ✅ **Xero Invoicing**: Automated invoice generation for each booking
- ✅ **Email Notifications**: Professional HTML confirmations with invoice links
- ✅ **Multi-Dog Management**: Track multiple dogs per customer
- ✅ **Dynamic Pricing**: Automatic calculation with additional services

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript
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

### Core Components
- `app/page.tsx` - Main booking form page
- `components/BookingForm.tsx` - Main form component
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
DATABASE_URL=postgresql://...
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret
XERO_REDIRECT_URI=http://localhost:3000/api/xero/callback
GOHIGHLEVEL_API_KEY=your_ghl_private_integration_token
GOHIGHLEVEL_LOCATION_ID=your_ghl_location_id
```

## Current Working Configuration
- **Database**: Neon PostgreSQL (✅ Connected)
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
- ✅ **Xero Integration**: Smart item code selection based on stay duration with 15% GST
  - Proper item codes: 4010-01 (Short), 4010-02 (Standard), 4010-03 (Long-term), 4010-08 (Services)
  - Automatic invoice email sending via Xero API
  - Account 228 (Homestays) with OUTPUT2 tax type
- ✅ **Email System**: Professional HTML notifications with booking details and invoice links
- ✅ **Environment Variables**: Resolved caching issues with proper credential loading
- ✅ **Contact Management**: Smart customer/dog record updates for existing users

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

## Test Results (Latest)
- Advanced pricing system: ✅ All NZ holidays and tiers loaded in database
- Deposit payment logic: ✅ Smart timing based on booking date
- Peak period detection: ✅ Automatic 20% surcharge calculation
- Multiple dog bookings: ✅ Same customer, different dogs (Max, Buddy, Charlie, Luna, Rex, Bella, Item Code Test)
- Xero integration: ✅ GST, item codes, automatic emails working

## Deployment Notes
- Configure environment variables on hosting platform
- Ensure PostgreSQL database is accessible
- Run `npm run build` to verify production build
- Consider using Vercel, Railway, or similar for easy deployment

## Domain Configuration
- **Production URL**: https://booking.100percentk9.co.nz/
- **DNS Setup**: CNAME record pointing `booking.100percentk9.co.nz` to `cname.vercel-dns.com`