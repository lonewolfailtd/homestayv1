# Apple Sign-In Setup Guide - Future Implementation

**Status:** ⏳ Planned for Future Enhancement
**Priority:** Low (Optional Enhancement)
**Cost:** $99 USD/year (Apple Developer Program)
**Setup Time:** 30-60 minutes

---

## Overview

This guide will help you add Apple Sign-In to your 100% K9 booking system once you're ready. This is **not required for launch** - the system works perfectly with Email/Password and Google Sign-In.

### When to Implement This

Add Apple Sign-In when:
- ✅ You have 50+ active users
- ✅ Customers specifically request it
- ✅ Analytics show high iPhone/iPad usage
- ✅ You want the most professional iOS experience
- ✅ You're ready to invest $99/year in Apple Developer Program

### Current Authentication Methods (Working Now)
- ✅ Email/Password (Clerk built-in)
- ✅ Google Sign-In (configured)
- ⏳ Apple Sign-In (this guide)

---

## Prerequisites

### Required Before Starting

1. **Apple Developer Program Membership**
   - Cost: $99 USD/year
   - Sign up: https://developer.apple.com/programs/
   - Processing time: 24-48 hours after payment
   - Requires: Apple ID, credit card, business verification

2. **Domain Setup**
   - Your domain must be live: `booking.100percentk9.co.nz`
   - DNS must be properly configured
   - HTTPS must be working

3. **Clerk Production Instance**
   - Already have production keys in Vercel
   - Callback URL: `https://clerk.booking.100percentk9.co.nz/v1/oauth_callback`

---

## Step-by-Step Setup Guide

### Phase 1: Apple Developer Portal Setup

#### Step 1: Create App ID

1. Go to https://developer.apple.com/account
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** in sidebar
4. Click the **+** button
5. Select **App IDs** → Continue
6. Choose **App** → Continue
7. Fill in details:
   ```
   Description: 100% K9 Booking System
   Bundle ID: nz.co.100percentk9.booking
   Platform: iOS (or choose appropriately)
   ```
8. Scroll to **Capabilities**
9. Enable **Sign In with Apple** ✅
10. Click **Continue** → **Register**

#### Step 2: Create Services ID (Web Authentication)

1. In Identifiers, click **+** button again
2. Select **Services IDs** → Continue
3. Fill in details:
   ```
   Description: 100% K9 Booking System - Web
   Identifier: nz.co.100percentk9.booking.web
   ```
4. Enable **Sign In with Apple** ✅
5. Click **Configure** button next to it
6. In the configuration popup:
   - **Primary App ID:** Select the App ID from Step 1
   - **Domains and Subdomains:** Add `booking.100percentk9.co.nz`
   - **Return URLs:** Add `https://clerk.booking.100percentk9.co.nz/v1/oauth_callback`
7. Click **Save** → **Continue** → **Register**
8. **IMPORTANT:** Copy the Services ID (e.g., `nz.co.100percentk9.booking.web`)
   - This is your **Client ID** for Clerk

#### Step 3: Generate Private Key

1. In the sidebar, click **Keys**
2. Click the **+** button
3. Fill in details:
   ```
   Key Name: Sign In with Apple - 100% K9 Booking
   ```
4. Enable **Sign In with Apple** ✅
5. Click **Configure** next to it
6. Select **Primary App ID:** Your App ID from Step 1
7. Click **Save** → **Continue** → **Register**
8. **CRITICAL:** Download the `.p8` file immediately
   - ⚠️ You can only download this ONCE
   - If you lose it, you must create a new key
   - Save it securely (password manager recommended)
9. **Note the Key ID** displayed (e.g., `ABC123XYZ4`)
   - Copy this - you'll need it for Clerk

#### Step 4: Get Team ID

1. Go to https://developer.apple.com/account
2. Look at **Membership** section in sidebar, or
3. Top-right corner near your name
4. Find your **Team ID** (10-character code like `ABC123XYZ4`)
5. Copy this - you'll need it for Clerk

---

### Phase 2: Prepare Private Key for Clerk

1. Open the downloaded `.p8` file in a text editor
   - Use: VS Code, Notepad++, or plain Notepad
   - Do NOT use Word or rich text editors

2. The file contents should look like this:
   ```
   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   [multiple lines of base64-encoded text]
   ...xYz123ABC==
   -----END PRIVATE KEY-----
   ```

3. **Copy the ENTIRE contents**
   - Include the `-----BEGIN PRIVATE KEY-----` line
   - Include all the middle content
   - Include the `-----END PRIVATE KEY-----` line
   - Do not add or remove any spaces or line breaks

---

### Phase 3: Configure Clerk

1. Go to Clerk Dashboard: https://dashboard.clerk.com/
2. Make sure you're in **Production** environment
3. Go to **User & Authentication** → **Social Connections**
4. Click **+ Add connection**
5. Choose **Apple**
6. Fill in the form:

   ```
   ✅ Enable for sign-up and sign-in (checked)

   ✅ Use custom credentials (checked)

   Apple Services ID (Client ID):
   nz.co.100percentk9.booking.web
   [Paste your Services ID from Phase 1, Step 2]

   Apple Private Key:
   -----BEGIN PRIVATE KEY-----
   [Paste the entire .p8 file contents from Phase 2]
   -----END PRIVATE KEY-----

   Apple Team ID:
   ABC123XYZ4
   [Paste your Team ID from Phase 1, Step 4]

   Apple Key ID:
   XYZ789ABC1
   [Paste your Key ID from Phase 1, Step 3]

   Email Source for Apple Private Email Relay:
   [Auto-generated by Clerk - leave as is]
   bounces+56827721@clkmail.booking.100percentk9.co.nz

   Return URL:
   [Auto-filled by Clerk - verify it matches]
   https://clerk.booking.100percentk9.co.nz/v1/oauth_callback

   ✅ Always show account selector prompt (checked)
   ```

7. Click **Add connection** or **Save**

---

### Phase 4: Deploy to Production

#### Update Vercel Environment Variables (if needed)

No additional environment variables needed! Clerk handles Apple auth completely.

#### Redeploy Application

1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to **Deployments** tab
4. Click **Redeploy** on latest deployment
5. Wait for deployment to complete (~2 minutes)

---

### Phase 5: Testing

#### Test on Production

1. Go to https://booking.100percentk9.co.nz/sign-in
2. You should now see **three sign-in options**:
   - Email/Password
   - Continue with Google
   - **Continue with Apple** ← New!

3. Test Apple Sign-In:
   - Click "Continue with Apple"
   - Should redirect to Apple's auth page
   - Sign in with your Apple ID
   - Choose to share or hide email
   - Should redirect back to dashboard

#### What to Check

- ✅ Apple button appears on sign-in page
- ✅ Apple auth flow completes without errors
- ✅ User is created in Clerk dashboard
- ✅ User redirected to `/dashboard` after sign-in
- ✅ Email is captured (even if using "Hide My Email")

---

## Troubleshooting

### Common Issues

**Error: "Invalid client"**
- Double-check Services ID matches exactly in Clerk
- Verify Services ID is enabled for Sign In with Apple
- Make sure you're using the Services ID, not the App ID

**Error: "Invalid redirect URI"**
- Verify return URL in Apple Developer matches exactly:
  `https://clerk.booking.100percentk9.co.nz/v1/oauth_callback`
- Check domain is added to Services ID configuration
- Make sure HTTPS is working on your domain

**Error: "Invalid key"**
- Ensure you copied the ENTIRE .p8 file contents
- Include BEGIN and END lines
- Check for no extra spaces or line breaks
- Verify Key ID matches the key you created

**Email not captured**
- This is expected if user chooses "Hide My Email"
- Apple provides a relay email instead
- Both options work fine with Clerk

**Can't download .p8 file again**
- Create a new key in Apple Developer
- Revoke the old key if needed
- You can have multiple keys active

---

## Maintenance

### Annual Renewal

- Apple Developer membership renews automatically
- Cost: $99 USD/year
- You'll receive renewal notices via email
- If membership lapses, Apple Sign-In will stop working

### Key Rotation (Optional)

Apple keys don't expire, but you may want to rotate them for security:

1. Create new key in Apple Developer
2. Update Clerk with new key and Key ID
3. Test thoroughly
4. Revoke old key after 24 hours

---

## Cost-Benefit Analysis

### Costs
- **Setup Time:** 30-60 minutes one-time
- **Annual Fee:** $99 USD/year
- **Maintenance:** ~5 minutes/year for renewal

### Benefits
- ✅ Professional iOS/macOS experience
- ✅ One-tap sign-in for Apple users
- ✅ Privacy-focused (Hide My Email option)
- ✅ Increased conversion from iPhone users
- ✅ Matches customer expectations on iOS

### When It's Worth It
- You have 50+ active users
- 30%+ of traffic is from iOS devices
- Customers request it
- You want premium brand perception

### When to Wait
- Just launching the product
- Low iOS usage in analytics
- Tight budget
- Email + Google working fine

---

## Alternative: Stay with Email + Google

**Perfectly fine to not implement Apple Sign-In:**

Most booking systems work great with just:
- ✅ Email/Password (universal)
- ✅ Google Sign-In (covers 90% of users including iOS)

Apple Sign-In is a **nice-to-have**, not a **must-have**.

---

## Quick Reference

### Information Needed for Clerk

| Field | Example | Where to Find |
|-------|---------|---------------|
| Client ID | `nz.co.100percentk9.booking.web` | Services ID from Apple Developer |
| Private Key | `-----BEGIN PRIVATE KEY-----...` | Download .p8 file from Keys section |
| Team ID | `ABC123XYZ4` | Membership section or top-right |
| Key ID | `XYZ789ABC1` | Shown when creating key |

### Important URLs

| Resource | URL |
|----------|-----|
| Apple Developer Portal | https://developer.apple.com/account |
| Enroll in Apple Developer | https://developer.apple.com/programs/ |
| Clerk Dashboard | https://dashboard.clerk.com/ |
| Return URL (for Apple) | https://clerk.booking.100percentk9.co.nz/v1/oauth_callback |

---

## Related Documentation

- `/docs/PRODUCTION_FIXES_REQUIRED.md` - Main production setup guide
- Clerk Apple Sign-In docs: https://clerk.com/docs/authentication/social-connections/apple
- Apple Sign-In docs: https://developer.apple.com/sign-in-with-apple/

---

**Created:** October 19, 2025
**Status:** Future Enhancement - Ready When Needed
**Next Review:** After 50+ active users or customer requests
