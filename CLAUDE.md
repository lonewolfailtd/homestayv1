# Dog Boarding Booking System - Development Guide

## Project Overview
A Next.js web application for managing dog boarding bookings with integrated GoHighLevel CRM and Xero invoicing. This system handles customer management, dog profiles, dynamic pricing, and automated workflow integration.

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
- `lib/xero.ts` - Xero integration
- `lib/gohighlevel.ts` - GoHighLevel integration

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
GOHIGHLEVEL_API_KEY=your_ghl_api_key
GOHIGHLEVEL_LOCATION_ID=your_ghl_location_id
```

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

### Testing Integrations
- Xero: Use `/api/xero/auth` to authenticate
- GoHighLevel: Test webhook endpoint with sample data
- Database: Use Prisma Studio to verify data storage

## Deployment Notes
- Configure environment variables on hosting platform
- Ensure PostgreSQL database is accessible
- Run `npm run build` to verify production build
- Consider using Vercel, Railway, or similar for easy deployment