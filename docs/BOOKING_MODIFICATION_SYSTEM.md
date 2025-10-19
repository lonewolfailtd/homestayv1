# Booking Modification System - Design Document

## Overview
System to allow customers to modify or cancel their dog boarding bookings while enforcing T&Cs and maintaining financial accuracy.

## Business Rules (from pricing-terms-document.md)

### Cancellation Policy
- **7+ days before check-in**: Eligible for refund minus deposit (50%)
- **Less than 7 days**: No refund available
- **Deposit**: Always non-refundable (50% of total)

### Modification Policy
- **Date changes**: Allowed up to 7 days before original check-in
- **Service changes**: Allowed up to 3 days before check-in
- **Dog changes**: Not allowed (create new booking instead)
- **Price adjustments**: Automatic recalculation when dates change

### Payment Impact
- **Price increases**: Customer pays difference
- **Price decreases**: Credit applied to account or partial refund
- **New peak periods**: 20% surcharge automatically applied
- **New pricing tiers**: Different daily rates based on stay length

## System Architecture

### 1. Database Schema Additions

```prisma
model BookingModification {
  id                String   @id @default(cuid())
  bookingId         String
  modifiedBy        String   // User ID
  modificationType  String   // "date_change", "service_change", "cancellation"

  // Original values
  originalCheckIn   DateTime?
  originalCheckOut  DateTime?
  originalServices  Json?
  originalPrice     Decimal? @db.Decimal(10, 2)

  // New values
  newCheckIn        DateTime?
  newCheckOut       DateTime?
  newServices       Json?
  newPrice          Decimal? @db.Decimal(10, 2)

  // Pricing adjustment
  priceDifference   Decimal  @db.Decimal(10, 2) @default(0)
  adjustmentReason  String?

  // Cancellation specific
  refundAmount      Decimal? @db.Decimal(10, 2)
  refundReason      String?
  cancellationFee   Decimal? @db.Decimal(10, 2)

  // Xero integration
  adjustmentInvoiceId String?  // New invoice for price differences
  creditNoteId        String?  // Credit note for refunds

  status            String   @default("pending") // "pending", "approved", "completed", "rejected"
  notes             String?
  createdAt         DateTime @default(now())
  processedAt       DateTime?

  booking           Booking  @relation(fields: [bookingId], references: [id])
  user              User     @relation(fields: [modifiedBy], references: [id])

  @@map("booking_modifications")
}

// Add to Booking model:
modifications     BookingModification[]
isCancelled       Boolean  @default(false)
cancellationDate  DateTime?
refundAmount      Decimal? @db.Decimal(10, 2)
```

###2. API Endpoints

#### `/api/booking/[id]/modify`
- **Method**: POST
- **Purpose**: Modify booking dates or services
- **Validation**:
  - Check if modification allowed (7+ days before check-in)
  - Verify user owns booking
  - Validate new dates don't conflict
  - Recalculate pricing
- **Response**: New pricing, confirmation required

#### `/api/booking/[id]/cancel`
- **Method**: POST
- **Purpose**: Cancel booking with refund calculation
- **Validation**:
  - Check cancellation timeline
  - Calculate refund amount
  - Create credit note in Xero
- **Response**: Refund amount, processing status

#### `/api/booking/[id]/confirm-modification`
- **Method**: POST
- **Purpose**: Confirm and process approved modification
- **Actions**:
  - Update booking record
  - Create/update Xero invoices
  - Send confirmation email
  - Update calendar events

### 3. Modification Workflows

#### Date Change Workflow
```
1. User selects "Modify Dates" on booking
2. System validates:
   - Is it 7+ days before check-in?
   - Are new dates available?
3. System recalculates:
   - New pricing tier (short/standard/long stay)
   - Peak period surcharges
   - Total price difference
4. Display comparison:
   - Original: $400 (Oct 1-5, Standard rate)
   - New: $450 (Dec 20-24, Peak period +20%)
   - Difference: +$50
5. User confirms
6. System processes:
   - Update booking dates
   - Create adjustment invoice in Xero
   - Send updated calendar event
   - Email confirmation

#### Cancellation Workflow
```
1. User selects "Cancel Booking"
2. System calculates refund:
   - Days until check-in: 10 days
   - Original total: $400
   - Deposit (non-refundable): $200
   - Refund eligible: $200
3. Display cancellation summary
4. User confirms with reason
5. System processes:
   - Mark booking as cancelled
   - Create credit note in Xero
   - Send cancellation email
   - Remove calendar event
6. Process refund (if applicable)
```

#### Service Modification Workflow
```
1. User selects "Modify Services"
2. System validates:
   - Is it 3+ days before check-in?
3. Display current services with prices
4. User adds/removes services
5. System calculates difference
6. User confirms
7. System processes:
   - Update selectedServices in booking
   - Create adjustment invoice
   - Email confirmation
```

## UI Components

### 1. Booking Management Dashboard Page
Location: `/app/dashboard/bookings/[id]/page.tsx`

Features:
- View full booking details
- "Modify Dates" button (if eligible)
- "Modify Services" button (if eligible)
- "Cancel Booking" button
- Modification history timeline
- Payment status

### 2. Date Modification Modal
- Interactive calendar (reuse existing InteractiveCalendar)
- Price comparison table
- Peak period warnings
- Confirmation checkbox

### 3. Cancellation Modal
- Refund calculator (real-time)
- Cancellation reason dropdown
- T&C reminder
- Refund timeline explanation

### 4. Modification History Component
- Timeline of all changes
- Original → New values
- Price adjustments
- Status badges

## Business Logic Implementation

### Eligibility Checks

```typescript
function canModifyDates(booking: Booking): {
  allowed: boolean;
  reason?: string;
} {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.floor((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (booking.isCancelled) {
    return { allowed: false, reason: "Booking is already cancelled" };
  }

  if (daysUntilCheckIn < 7) {
    return { allowed: false, reason: "Modifications not allowed within 7 days of check-in" };
  }

  if (booking.depositPaid && !booking.balancePaid && daysUntilCheckIn < 21) {
    return { allowed: false, reason: "Balance payment is due - contact us to modify" };
  }

  return { allowed: true };
}
```

### Refund Calculation

```typescript
function calculateRefund(booking: Booking): {
  refundAmount: number;
  breakdown: RefundBreakdown;
} {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.floor((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const totalPrice = parseFloat(booking.totalPrice.toString());
  const depositAmount = parseFloat(booking.depositAmount.toString());
  const balanceAmount = parseFloat(booking.balanceAmount.toString());

  let refundAmount = 0;
  const breakdown: RefundBreakdown = {
    totalPaid: booking.depositPaid ? depositAmount : 0,
    depositFee: depositAmount, // Always non-refundable
    eligibleForRefund: 0,
    refundAmount: 0,
  };

  if (daysUntilCheckIn >= 7) {
    // Eligible for refund minus deposit
    if (booking.balancePaid) {
      breakdown.eligibleForRefund = balanceAmount;
      refundAmount = balanceAmount;
    }
  } else {
    // No refund within 7 days
    refundAmount = 0;
  }

  breakdown.refundAmount = refundAmount;

  return { refundAmount, breakdown };
}
```

### Price Recalculation

```typescript
async function recalculateBookingPrice(
  bookingId: string,
  newCheckIn: Date,
  newCheckOut: Date
): Promise<PriceComparison> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  // Calculate new pricing using existing pricing engine
  const newPricing = await calculateAdvancedPricing({
    checkInDate: newCheckIn,
    checkOutDate: newCheckOut,
    isEntireDog: booking.dogSurcharges > 0,
    selectedServices: JSON.parse(booking.selectedServices as string),
    numberOfMeals: /* extract from services */,
    numberOfWalks: /* extract from services */,
  });

  const oldPrice = parseFloat(booking.totalPrice.toString());
  const newPrice = newPricing.totalPrice;
  const difference = newPrice - oldPrice;

  return {
    oldPrice,
    newPrice,
    difference,
    oldPricing: {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalDays: booking.totalDays,
      isPeakPeriod: booking.isPeakPeriod,
      peakPeriodName: booking.peakPeriodName,
    },
    newPricing,
  };
}
```

## Email Templates

### Date Modification Confirmation
```
Subject: Booking Dates Updated - ${dogName}

Your booking dates have been successfully updated!

Original Dates:
Check-in: ${oldCheckIn}
Check-out: ${oldCheckOut}

New Dates:
Check-in: ${newCheckIn}
Check-out: ${newCheckOut}

Price Adjustment: ${difference > 0 ? '+' : ''}$${difference}

[Updated Calendar Event buttons]
[View Updated Invoice]
```

### Cancellation Confirmation
```
Subject: Booking Cancelled - ${dogName}

We're sorry to see your booking cancelled.

Cancellation Details:
Original Check-in: ${checkIn}
Refund Amount: $${refundAmount}
Refund Timeline: 5-7 business days

Your refund will be processed to the original payment method.

[Contact Us if you have questions]
```

## Xero Integration

### Adjustment Invoices
When price increases:
- Create new invoice for difference amount
- Reference original invoice
- Link to booking modification record

When price decreases:
- Create credit note
- Apply to original invoice
- Track in Xero for accounting

### Credit Notes
For cancellations:
- Generate credit note for refund amount
- Link to original invoice
- Include cancellation reason

## Security & Validation

### Authorization
- User must own booking (via Customer record)
- Admin override capability
- Clerk JWT validation

### Data Validation
- New dates must be in future
- Check-out must be after check-in
- Maximum booking length: 365 days
- Minimum stay during peak periods (7 days for Christmas)

### Rate Limiting
- Max 3 modifications per booking
- Cooldown period: 24 hours between changes

## User Experience Considerations

### Clear Communication
- Show refund amount BEFORE confirmation
- Explain why modifications might not be allowed
- Display price differences prominently
- Provide modification history

### Helpful Features
- Suggest alternative dates if preferred dates unavailable
- Show pricing calendar to help choose cheaper dates
- Email notifications at each step
- Calendar event updates automatically

### Error Handling
- Clear error messages for validation failures
- Graceful handling of Xero API failures
- Retry mechanism for failed updates
- Manual fallback for admin intervention

## Implementation Phases

### Phase 1: Database & Core Logic
1. Add BookingModification model to schema
2. Create eligibility check functions
3. Implement refund calculation
4. Build price recalculation

### Phase 2: API Endpoints
1. `/api/booking/[id]/modify` endpoint
2. `/api/booking/[id]/cancel` endpoint
3. `/api/booking/[id]/confirm-modification` endpoint
4. Integration with pricing engine

### Phase 3: UI Components
1. Booking detail page
2. Date modification modal
3. Cancellation modal
4. Modification history timeline

### Phase 4: Integration & Testing
1. Xero invoice/credit note creation
2. Email template updates
3. Calendar event updates
4. End-to-end testing

### Phase 5: Admin Tools
1. Admin override for special cases
2. Refund processing dashboard
3. Modification approval workflow (if needed)

## Success Metrics

### Customer Satisfaction
- Reduced support tickets for booking changes
- Self-service modification rate > 80%
- Clear refund expectations

### Business Operations
- Automatic compliance with T&Cs
- Accurate financial tracking
- Reduced manual intervention

### Technical Performance
- Modification completion time < 30 seconds
- Xero sync success rate > 95%
- Zero data inconsistencies

## Future Enhancements

1. **Waitlist System** - If dates unavailable, add to waitlist
2. **Partial Cancellations** - Cancel only some days of stay
3. **Service Upgrades** - Easy upsell during modifications
4. **Flexible Refund Options** - Store credit vs cash refund
5. **Automated Reminders** - "Your balance is due in 7 days"
6. **Price Lock** - Guarantee price if booking modified early

---

**Document Version:** 1.0
**Created:** October 19, 2025
**Status:** Design Complete - Ready for Implementation
