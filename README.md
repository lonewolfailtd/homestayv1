# Dog Boarding Booking System

A Next.js web application for managing dog boarding bookings with integrated GoHighLevel CRM and Xero invoicing. Live at booking.100percentk9.co.nz

## Features

- **Customer Management**: Support for both new and existing customers
- **Comprehensive Dog Profiles**: Complete health, behavior, and care information
- **Dynamic Pricing**: Automatic calculation based on stay duration and selected services
- **GoHighLevel Integration**: Automatic contact creation/updates in CRM
- **Xero Integration**: Automated invoice generation and sending
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Integrations**: 
  - Xero Node SDK for accounting
  - GoHighLevel REST API for CRM
- **Language**: TypeScript

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `XERO_CLIENT_ID`: Your Xero app client ID
- `XERO_CLIENT_SECRET`: Your Xero app client secret
- `GOHIGHLEVEL_API_KEY`: Your GoHighLevel API key
- `GOHIGHLEVEL_LOCATION_ID`: Your GoHighLevel location ID

### 2. Database Setup

```bash
# Install dependencies (when disk space allows)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed with sample pricing data
npx prisma db seed
```

### 3. GoHighLevel Setup

1. Log into your GoHighLevel account
2. Go to Settings > Integrations > API
3. Create a new API key with the following permissions:
   - contacts.write
   - contacts.read
   - conversations.write
4. Copy the API key to your `.env.local` file

### 4. Xero Setup

1. Create a Xero developer account at https://developer.xero.com/
2. Create a new app with the following scopes:
   - accounting.settings
   - accounting.transactions
   - offline_access
3. Set redirect URI to: `http://localhost:3000/api/xero/callback`
4. Copy client credentials to your `.env.local` file

### 5. Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the booking form.

## API Endpoints

- `GET /api/customers?email=<email>` - Check for existing customer
- `POST /api/pricing/calculate` - Calculate booking price
- `POST /api/booking/submit` - Submit booking form
- `GET /api/xero/auth` - Initialize Xero OAuth flow
- `POST /api/gohighlevel/webhook` - Receive GHL webhooks

## Form Fields

### Customer Information (New Customers)
- Name, email, phone, address
- Emergency contact details

### Dog Profile
- Basic info: name, age, sex, breed
- Health: vaccination status, vet info, medications
- Behavior: socialization, training, special needs

### Booking Details
- Check-in/out dates
- Boarding type (Standard/Luxury)
- Additional services
- Special instructions

## Integration Flow

1. User submits booking form
2. Calculate pricing based on dates and services
3. Create/update contact in GoHighLevel CRM
4. Generate and send invoice via Xero
5. Store booking record in database
6. Return confirmation with invoice link

## Database Schema

- `customers` - Customer contact information
- `dogs` - Dog profiles and health/behavior data  
- `bookings` - Booking records with pricing and status
- `pricing_rules` - Configurable pricing by boarding type

## Deployment

The application is designed to deploy easily on platforms like Vercel, Netlify, or Railway with PostgreSQL databases.

## Support

For setup assistance or questions, please check the documentation or create an issue.