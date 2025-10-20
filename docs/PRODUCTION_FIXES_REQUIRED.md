# Production Issues & Fixes Required

**Date:** October 19, 2025
**Environment:** https://booking.100percentk9.co.nz (Vercel Production)
**Status:** 🔴 Action Required

---

## Issues Identified

### 1. 🔑 Clerk Development Keys in Production (CRITICAL)
**Error Message:**
```
Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production.
```

**Current State:**
- Using `pk_test_...` (development publishable key)
- Using `sk_test_...` (development secret key)
- These keys have strict rate limits and are not production-ready

**Impact:**
- Rate limiting on authentication
- Features may be disabled
- Not suitable for customer-facing production

---

### 2. 📧 Email Confirmations Not Sending (CRITICAL)
**Current State:**
- Email function only logs to console (development mode)
- `sendBookingConfirmation()` doesn't actually send emails
- Nodemailer code is commented out

**Impact:**
- Customers don't receive booking confirmations
- No calendar invites sent
- Poor customer experience

---

### 3. 📄 Invoice Download Not Working
**Current State:**
- `downloadUrl` field not populated from Xero
- Download button shows "Invoice download not available yet"

**Impact:**
- Customers cannot download invoices
- Must rely on email-only access

---

### 4. ⚠️ Clerk Deprecation Warnings
**Warning Message:**
```
The prop "afterSignInUrl" is deprecated and should be replaced with "fallbackRedirectUrl" or "forceRedirectUrl"
```

**Impact:**
- Future compatibility issues
- May break in future Clerk updates

---

## Solutions

## 🔴 PRIORITY 1: Fix Clerk Production Keys

### Step 1: Create Production Instance in Clerk

1. Go to https://dashboard.clerk.com/
2. Click your current app ("100% K9 Booking System" or similar)
3. Look for environment switcher (top left, might say "Development")
4. Click **"Go to Production"** or **"Create Production Instance"**
5. This will create production keys

### Step 2: Get Production Keys

Once in production environment:
1. Go to **API Keys** in left sidebar
2. Copy the **Publishable key** (starts with `pk_live_...`)
3. Copy the **Secret key** (starts with `sk_live_...`)
4. Go to **Webhooks** tab
5. Create new webhook endpoint or copy existing webhook secret

### Step 3: Update Vercel Environment Variables

1. Go to https://vercel.com/
2. Select your project (homestayv1 or booking-100percentk9)
3. Go to **Settings** → **Environment Variables**
4. Update these variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_<your_publishable_key>
CLERK_SECRET_KEY=sk_live_<your_secret_key>
CLERK_WEBHOOK_SECRET=whsec_<your_webhook_secret>
```

5. **IMPORTANT:** Make sure these are set for "Production" environment only
6. Keep development keys in your local `.env.local` file

### Step 4: Redeploy

1. In Vercel dashboard, go to **Deployments**
2. Click **...** menu on latest deployment
3. Click **Redeploy**
4. Verify the warning disappears

---

## 🔴 PRIORITY 2: Set Up Email Service (Resend API - Recommended)

### Why Resend?
- ✅ Free tier: 3,000 emails/month
- ✅ 100 emails/day on free plan
- ✅ New Zealand support
- ✅ Simple API, excellent deliverability
- ✅ Built specifically for transactional emails
- ✅ No SMTP configuration needed

### Step 1: Create Resend Account

1. Go to https://resend.com/signup
2. Sign up with your email (training@100percentk9.co.nz)
3. Verify your email address

### Step 2: Add Domain or Use Onboarding Email

**Option A: Use Onboarding Domain (Fastest)**
- Resend provides onboarding@resend.dev for testing
- Limited to 1 email/day, good for initial testing
- **Skip to Step 3**

**Option B: Add Your Own Domain (Recommended for Production)**

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `100percentk9.co.nz`
4. Add the DNS records Resend provides to your domain registrar:
   ```
   Type: TXT
   Name: @
   Value: [Resend will provide this]

   Type: DKIM (TXT)
   Name: resend._domainkey
   Value: [Resend will provide this]
   ```
5. Wait for verification (usually 5-15 minutes)

### Step 3: Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name: "Production Booking System"
4. Permission: **Sending access**
5. Copy the key (starts with `re_...`)

### Step 4: Install Resend SDK

```bash
npm install resend
```

### Step 5: Update Environment Variables

Add to Vercel (Production only):
```
RESEND_API_KEY=re_<your_resend_api_key>
EMAIL_FROM=bookings@100percentk9.co.nz
EMAIL_CC=training@100percentk9.co.nz
```

### Step 6: Update Email Code

I'll need to update `/lib/email.ts` to use Resend instead of console.log.

**Modified Code:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(bookingData: BookingEmailData) {
  try {
    const calendarLinks = generateAllCalendarLinks({...});

    const emailHtml = `...`; // Existing HTML template

    // Send with Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'bookings@100percentk9.co.nz',
      to: [bookingData.customerEmail],
      cc: [process.env.EMAIL_CC || 'training@100percentk9.co.nz'],
      subject: `Booking Confirmation - ${bookingData.dogName} at 100% K9`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email sent successfully:', data);
    return { success: true, emailId: data.id };

  } catch (error) {
    console.error('Email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    };
  }
}
```

---

## 🟡 PRIORITY 3: Fix Invoice Downloads

### Issue
The Xero API provides invoice PDFs, but we're not fetching the download URL.

### Solution

Update `/app/api/user/invoices/route.ts` to fetch PDF URLs from Xero:

```typescript
// For each invoice, fetch the PDF URL
if (booking.depositInvoiceId) {
  try {
    const invoiceResponse = await xero.accountingApi.getInvoice(
      tenantId,
      booking.depositInvoiceId
    );

    const invoice = invoiceResponse.body.invoices?.[0];
    if (invoice?.invoiceID) {
      // Get PDF URL
      const pdfUrl = `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${invoice.invoiceID}`;

      // Or use Xero API to get actual PDF
      depositInvoice.downloadUrl = pdfUrl;
    }
  } catch (error) {
    console.error('Failed to fetch invoice URL:', error);
  }
}
```

**Better Approach:** Link directly to Xero's online invoice view:
```typescript
downloadUrl: booking.depositInvoiceId
  ? `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${booking.depositInvoiceId}`
  : undefined
```

---

## 🟡 PRIORITY 4: Fix Clerk Deprecation Warnings

### Update Middleware Configuration

File: `/middleware.ts`

**Find:**
```typescript
export default clerkMiddleware({
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
});
```

**Replace with:**
```typescript
export default clerkMiddleware({
  fallbackRedirectUrl: '/dashboard',
});
```

### Update Environment Variables

In `.env.local` and Vercel:

**Remove (deprecated):**
```
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Replace with:**
```
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

---

## 🔍 Additional Checks

### Xero Invoice Email Configuration

Xero should be sending invoice emails automatically. To verify:

1. Check Xero console logs in Vercel deployment logs
2. Look for: `"Invoice emailed successfully to:"`
3. If seeing errors, check:
   - Xero token is valid and not expired
   - Customer email is correctly set in Xero contact
   - Invoice has valid email address

### Check Vercel Logs

1. Go to Vercel dashboard → Your project
2. Click **Logs** tab
3. Filter for recent booking
4. Look for:
   - ✅ "Invoice emailed successfully"
   - ❌ Email errors
   - ❌ Xero API errors

---

## Implementation Checklist

### Immediate Actions (Before Next Booking)
- [ ] Switch Clerk to production keys
- [ ] Set up Resend account and verify domain
- [ ] Update email.ts to use Resend
- [ ] Test email sending in production
- [ ] Fix invoice download URLs
- [ ] Update Clerk deprecation warnings
- [ ] Deploy to Vercel
- [ ] Test complete booking flow

### Testing Checklist
- [ ] Create test booking on production
- [ ] Verify email received (customer + CC to owner)
- [ ] Check calendar invite works
- [ ] Verify Xero invoice email received
- [ ] Test invoice download button
- [ ] Confirm no Clerk warnings in console
- [ ] Check Vercel logs for errors

### Monitoring (First Week)
- [ ] Check Resend dashboard daily for delivery status
- [ ] Monitor Vercel logs for errors
- [ ] Review Clerk usage (should be within production limits)
- [ ] Confirm all customers receiving confirmations

---

## Estimated Costs

### Resend Email Service
- **Free Tier:** 3,000 emails/month, 100/day
- **Paid Plan:** $20/month for 50,000 emails (if needed)
- **Expected Usage:** ~100-200 emails/month (well within free tier)

### Clerk Authentication
- **Free Tier:** 10,000 MAU (Monthly Active Users)
- **Expected Usage:** <100 MAU (well within free tier)

**Total Additional Cost:** $0/month (free tiers sufficient)

---

## Questions?

- **Resend not working?** Check API key is correct in Vercel env vars
- **Emails going to spam?** Verify domain DNS records are correct
- **Clerk still showing dev keys?** Make sure to redeploy after env var changes
- **Invoice downloads broken?** Check Xero connection is active

---

## Next Steps After Fixes

1. **Monitor email deliverability** for first week
2. **Set up email templates** for modifications/cancellations (Phase 4 enhancement)
3. **Add SMS notifications** (optional, future enhancement)
4. **Xero credit notes** for refunds (Phase 4 enhancement)

---

**Created:** October 19, 2025
**Status:** Ready for Implementation
**Priority:** CRITICAL - Fix before next customer booking
