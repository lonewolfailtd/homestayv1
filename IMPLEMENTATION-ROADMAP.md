# Dog Boarding Pricing System - Implementation Roadmap

## 🎯 **Current Status (October 15, 2025)**

### ✅ **COMPLETED SYSTEMS**
- **Database Schema**: Complete with peak periods, pricing tiers, services, prerequisites
- **Pricing Engine**: Advanced calculation with NZ holidays and business rules (`lib/pricing-engine.ts`)
- **Deposit Payment System**: 50% upfront, smart balance timing based on booking date
- **Xero Integration**: GST, item codes, automatic invoice emails with payment via Windcave
- **GoHighLevel CRM**: V2 API integration with contact management
- **Data Initialization**: All 2025 NZ public holidays and pricing tiers loaded

---

## 🔧 **REMAINING WORK TO COMPLETE**

### **1. Update Pricing Calculation API** ⏳ *In Progress*
**File**: `app/api/pricing/calculate/route.ts`

**Current State**: Using basic daily rate calculation  
**Required**: Integrate advanced pricing engine

```typescript
// REPLACE existing calculation with:
import { calculateAdvancedPricing } from '@/lib/pricing-engine';

const pricingResult = await calculateAdvancedPricing({
  checkInDate: new Date(checkIn),
  checkOutDate: new Date(checkOut),
  isEntireDog: formData.isEntireDog || false,
  selectedServices: formData.selectedServices || [],
  numberOfMeals: formData.numberOfMeals || 0,
  numberOfWalks: formData.numberOfWalks || 0,
});

return NextResponse.json({
  success: true,
  ...pricingResult,
  warnings: pricingResult.warnings // Peak period alerts, minimum stays
});
```

---

### **2. Enhanced Booking Form** ⏳ *Pending*
**File**: `components/BookingForm.tsx`

**Add New Form Fields:**

#### **A. Entire Dog Checkbox**
```tsx
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="isEntireDog"
    checked={formData.isEntireDog}
    onChange={(e) => setFormData({...formData, isEntireDog: e.target.checked})}
  />
  <label htmlFor="isEntireDog">Entire Dog (+$5/day)</label>
</div>
```

#### **B. Advanced Services Section**
```tsx
<div className="space-y-4">
  <h3>Grooming Services</h3>
  <ServiceCheckbox 
    id="FULL_WASH" 
    name="Full Wash & Conditioner" 
    price={40} 
    unit="per service"
  />
  <ServiceCheckbox 
    id="NAIL_CLIP" 
    name="Nail Clipping" 
    price={10} 
    unit="per service"
  />
  
  <h3>Training Services</h3>
  <ServiceCheckbox 
    id="RECALL_TRAINING" 
    name="Recall Training" 
    price={150} 
    unit="per service"
  />
  <ServiceCheckbox 
    id="OBEDIENCE_TRAINING" 
    name="Obedience Training" 
    price={150} 
    unit="per service"
  />
  
  <h3>Walk Services</h3>
  <ServiceCheckbox 
    id="PACK_WALK" 
    name="Adventure Pack Walks" 
    price={30} 
    unit="per walk"
    requiresPrereq={true}
    prerequisite="Pre Walk Assessment required"
  />
  <NumberInput 
    label="Number of Adventure Walks" 
    value={formData.numberOfWalks}
    onChange={(value) => setFormData({...formData, numberOfWalks: value})}
  />
  
  <h3>Food Services</h3>
  <ServiceCheckbox 
    id="RAW_MEAL" 
    name="Balanced Raw Meal" 
    price={5} 
    unit="per meal"
  />
  <NumberInput 
    label="Number of Raw Meals" 
    value={formData.numberOfMeals}
    onChange={(value) => setFormData({...formData, numberOfMeals: value})}
  />
</div>
```

#### **C. Enhanced Pricing Display**
```tsx
<div className="pricing-breakdown">
  <div>Base Stay: {pricing.totalDays} days × ${pricing.baseDailyRate} = ${pricing.baseSubtotal}</div>
  {pricing.isPeakPeriod && (
    <div className="text-orange-600">
      Peak Period Surcharge ({pricing.peakPeriodName}): +${pricing.peakSurcharge}
    </div>
  )}
  {pricing.dogSurcharges > 0 && (
    <div>Entire Dog Surcharge: +${pricing.dogSurcharges}</div>
  )}
  {pricing.serviceCharges > 0 && (
    <div>Additional Services: +${pricing.serviceCharges}</div>
  )}
  <div className="font-bold">Total: ${pricing.totalPrice}</div>
  
  {pricing.warnings.length > 0 && (
    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-2">
      {pricing.warnings.map((warning, index) => (
        <div key={index} className="text-yellow-800 text-sm">⚠️ {warning}</div>
      ))}
    </div>
  )}
</div>
```

---

### **3. Update Booking Submission** ⏳ *Pending*
**File**: `app/api/booking/submit/route.ts`

**Replace existing pricing calculation:**
```typescript
// REPLACE basic calculation with advanced pricing
const pricingResult = await calculateAdvancedPricing({
  checkInDate,
  checkOutDate,
  isEntireDog: formData.isEntireDog || false,
  selectedServices: formData.selectedServices || [],
  numberOfMeals: formData.numberOfMeals || 0,
  numberOfWalks: formData.numberOfWalks || 0,
});

// Update booking data to include enhanced pricing fields
const bookingData = {
  // ... existing fields ...
  baseDailyRate: pricingResult.baseDailyRate,
  peakSurcharge: pricingResult.peakSurcharge,
  dogSurcharges: pricingResult.dogSurcharges,
  isPeakPeriod: pricingResult.isPeakPeriod,
  peakPeriodName: pricingResult.peakPeriodName,
  selectedServices: JSON.stringify(pricingResult.breakdown.services),
  totalPrice: pricingResult.totalPrice,
};
```

---

### **4. Enhanced Xero Invoice Creation** ⏳ *Pending*
**Files**: `lib/xero.ts` - Update invoice line items

**Add Support for Individual Service Line Items:**
```typescript
// In createDepositInvoice and createBalanceInvoice functions
// ADD detailed line items for each selected service

const serviceLineItems = booking.selectedServices?.map(service => ({
  description: service.name,
  quantity: service.quantity,
  unitAmount: service.unitPrice,
  accountCode: '228',
  taxType: 'OUTPUT2',
  itemCode: getXeroItemCodeForService(service.id), // Map to your Xero item codes
  lineAmount: service.total,
})) || [];

// Combine base accommodation + services + surcharges
const allLineItems = [
  accommodationLineItem,
  ...serviceLineItems,
  ...surchargeLineItems
];
```

---

### **5. Item Code Mapping** ⏳ *Pending*
**File**: `lib/pricing-engine.ts`

**Add Xero Item Code Mapping:**
```typescript
export const XERO_ITEM_CODES = {
  // Accommodation (existing)
  'short_stay': '4010-01',
  'standard_stay': '4010-02', 
  'long_stay': '4010-03',
  
  // Services (NEW - create these in Xero)
  'FULL_WASH': '4010-04',
  'NAIL_CLIP': '4010-05',
  'PACK_WALK': '4010-06', 
  'WALK_ASSESSMENT': '4010-07',
  'RECALL_TRAINING': '4010-08',
  'OBEDIENCE_TRAINING': '4010-09',
  'RAW_MEAL': '4010-10',
  'ENTIRE_DOG': '4010-11',
};
```

---

## 🗄️ **XERO SETUP REQUIRED**

### **Create Additional Xero Items:**
You need to create these item codes in Xero → Settings → Items:

| Code | Name | Price | Description |
|------|------|-------|-------------|
| 4010-04 | Full Wash & Conditioner | $40 | Professional grooming with wash and conditioning |
| 4010-05 | Nail Clipping | $10 | Professional nail trimming service |
| 4010-06 | Adventure Pack Walk | $30 | Supervised pack walks with enrichment |
| 4010-07 | Pre Walk Assessment | $60 | Assessment for adventure walk eligibility |
| 4010-08 | Recall Training | $150 | Professional recall training session |
| 4010-09 | Obedience Training | $150 | Professional obedience training session |
| 4010-10 | Balanced Raw Meal | $5 | Premium raw food meal |
| 4010-11 | Entire Dog Surcharge | $5 | Daily surcharge for entire dogs |

---

## 🧪 **TESTING SCENARIOS**

### **Test Cases to Verify:**

1. **Peak Period Booking (Christmas)**
   - Book Dec 22-30, 2025 (9 days)
   - Should trigger: 7-day minimum warning, 20% surcharge
   - Expected: Long stay rate + 20% peak surcharge

2. **Last-Minute Booking** 
   - Book 2 weeks from today
   - Should trigger: Single full invoice (no deposit split)

3. **Complex Service Booking**
   - Add: Entire dog + grooming + pack walks + raw meals
   - Should trigger: Assessment prerequisite warning
   - Should calculate: All surcharges and service costs

4. **Regular Advance Booking**
   - Book 2 months ahead with services
   - Should create: Deposit + balance invoices with service breakdown

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Before Going Live:**
1. ✅ Initialize pricing data: `POST /api/admin/initialize-pricing`
2. ⏳ Create all Xero item codes (4010-04 through 4010-11)
3. ⏳ Update pricing calculation API
4. ⏳ Enhanced booking form with all service options
5. ⏳ Test all peak period scenarios
6. ⏳ Verify invoice line item breakdown
7. ⏳ Test prerequisite warnings and validations

### **Environment Variables:**
- All existing variables remain the same
- No new environment variables required

---

## 📞 **SUPPORT NOTES**

### **Key Files Modified:**
- `lib/pricing-engine.ts` - Core pricing logic ✅
- `prisma/schema.prisma` - Database schema ✅ 
- `app/api/admin/initialize-pricing/route.ts` - Data initialization ✅
- `app/api/pricing/calculate/route.ts` - Pricing API ⏳
- `components/BookingForm.tsx` - Enhanced form ⏳
- `app/api/booking/submit/route.ts` - Booking submission ⏳
- `lib/xero.ts` - Invoice generation ⏳

### **Database Status:**
- All tables created and populated ✅
- Peak periods loaded for 2025 ✅
- Pricing tiers configured ✅
- Ready for production use ✅

The system foundation is solid - just need to wire up the frontend and enhance the APIs to use the comprehensive pricing engine that's already built and tested.