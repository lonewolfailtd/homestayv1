# Development Standard Operating Procedures (SOP)

## 🚨 Pre-Deployment Checklist

### **MANDATORY: Run Before Every Commit**

```bash
# 1. Type Check (MUST PASS - NO EXCEPTIONS)
npm run build

# 2. Lint Check (Fix critical errors, warnings OK)
npm run lint

# 3. Database Schema Sync
npx prisma generate
npx prisma db push

# 4. Test Critical Routes
curl http://localhost:3000/api/auth/webhook
curl http://localhost:3000/api/booking/submit
```

## 🔴 TypeScript Error Categories

### **CRITICAL - Must Fix Before Commit:**
- ❌ `Property 'X' does not exist on type 'Y'`
- ❌ `Object literal may only specify known properties` 
- ❌ `Type 'X' is not assignable to type 'Y'`
- ❌ `Expected 3-5 arguments, but got 2`
- ❌ `Parameter 'X' implicitly has an 'any' type`

### **HIGH PRIORITY - Fix When Possible:**
- ⚠️ `'X' is defined but never used`
- ⚠️ `'X' is assigned a value but never used`
- ⚠️ React Hook dependencies missing

### **LOW PRIORITY - Can Be Deferred:**
- 💡 Escaped characters in JSX (`'` → `&apos;`)
- 💡 Missing alt text on images

## 🛠️ Common Issues Prevention

### **1. Authentication Issues**
**❌ Wrong:**
```typescript
const { userId } = auth();
```

**✅ Correct:**
```typescript
const { userId } = await auth();
```

**SOP:** Always await `auth()` calls in API routes (NextJS 14 requirement)

### **2. Database Field Mismatches**
**❌ Wrong:**
```typescript
checkInDate: checkIn,  // Field doesn't exist
userId: user.id        // Removed from schema
bookings: {
  some: {
    userId: user.id     // Wrong relationship
  }
}
```

**✅ Correct:**
```typescript
checkIn: checkIn,      // Matches schema
customerId: customer.id // Correct relationship
customer: {
  clerkUserId: user.clerkId  // Correct customer relationship
}
```

**SOP:** Check `prisma/schema.prisma` before writing queries

### **3. TypeScript Type Safety**
**❌ Wrong:**
```typescript
const handleDayClick = (date: Date) => {    // Missing undefined handling
const foundContact = contacts.find(contact =>  // Implicit any
```

**✅ Correct:**
```typescript
const handleDayClick = (date: Date | undefined) => {
  if (!date) return;  // Guard clause
const foundContact = contacts.find((contact: any) =>  // Explicit any type
```

**SOP:** Always handle undefined types and avoid implicit any

### **4. React Component Type Safety**
**❌ Wrong:**
```typescript
<DayPicker
  mode="single"
  selected={checkInDate}
  onSelect={handleDayClick}  // Type mismatch
/>
```

**✅ Correct:**
```typescript
<DayPicker
  mode="single"
  required={false}             // Required prop for single mode
  selected={checkInDate}
  onSelect={handleDayClick}    // Now matches Date | undefined
/>
```

**SOP:** Check component prop requirements and type signatures

### **5. API Parameter Validation**
**❌ Wrong:**
```typescript
await xero.accountingApi.emailInvoice(tenantId, invoiceId!, {
  requestBody: {  // Wrong parameter structure
    subject: "...",
    body: "..."
  }
});
```

**✅ Correct:**
```typescript
await xero.accountingApi.emailInvoice(tenantId, invoiceId!, {
  subject: "...",  // Direct parameters
  body: "..."
});
// OR for APIs that don't accept custom content:
await xero.accountingApi.emailInvoice(tenantId, invoiceId!, {});
```

**SOP:** Check third-party API documentation for correct parameter structure

### **6. Zod Error Handling**
**❌ Wrong:**
```typescript
error.errors  // Property doesn't exist
```

**✅ Correct:**
```typescript
error.issues  // Correct Zod property
```

**SOP:** Use `error.issues` for Zod validation errors

### **7. ESLint Configuration**
**First Time Setup:**
```bash
# Configure ESLint with strict rules
npx next lint --strict
# Then run normally
npm run lint
```

### **8. Common ESLint Fixes**
**❌ Wrong:**
```typescript
import { NextRequest } from 'next/server';  // Unused import
export async function GET(request: NextRequest) {  // Unused parameter
  const user = await getUser();  // any type
}
```

**✅ Correct:**
```typescript
// Remove unused imports entirely, OR:
import { NextRequest } from 'next/server';
export async function GET(request: NextRequest) {  // Actually use parameter
  const data = await request.json();
  // OR rename to indicate intentionally unused:
  export async function GET(_request: NextRequest) {
}
```

### **9. Missing Dependencies**
**SOP:** Always check `package.json` when adding new imports

```bash
# Check if package exists before using
npm list <package-name>
# Install if missing
npm install <package-name>
```

## 🔄 Development Workflow

### **Phase 1: Planning**
1. Update database schema in `prisma/schema.prisma`
2. Run `npx prisma db push` to sync
3. Check relationships and field names

### **Phase 2: API Development**
1. Create API routes with proper auth patterns
2. Test each endpoint individually
3. Validate request/response schemas

### **Phase 3: Frontend Integration**
1. Build components with proper TypeScript
2. Test user flows end-to-end
3. Handle loading and error states

### **Phase 4: Pre-Commit**
1. **MANDATORY BUILD:** `npm run build`
2. Fix ALL TypeScript errors
3. Test critical user paths
4. Update documentation

## ⚡ Quick Reference Commands

### **Daily Development**
```bash
# Start with clean slate
npm run dev
npx prisma studio  # Check database

# Before any API work
npx prisma generate

# Before committing
npm run build
npm run lint
```

### **Database Changes**
```bash
# After schema changes
npx prisma db push
npx prisma generate

# Reset if needed
npx prisma db push --force-reset
```

### **Debugging Builds**
```bash
# Verbose build output
npm run build 2>&1 | tee build.log

# Check specific file
npx tsc --noEmit <file-path>
```

## 🚨 Red Flags - Stop and Fix

### **Immediate Fix Required (BUILD BLOCKERS):**
- [ ] Any TypeScript compilation error
- [ ] `Property 'userId' does not exist in type 'BookingWhereInput'`
- [ ] `Type 'Date' is not assignable to type 'Date | undefined'`
- [ ] `Object literal may only specify known properties`
- [ ] `Expected 3-5 arguments, but got 2`
- [ ] `Parameter 'contact' implicitly has an 'any' type`
- [ ] Missing dependency errors (`Cannot resolve 'package'`)
- [ ] Database field not found errors
- [ ] Auth function not awaited
- [ ] Zod validation using wrong properties

### **High Priority (ESLint Errors):**
- [ ] Unused imports and variables
- [ ] Explicit any types without justification
- [ ] Missing React Hook dependencies
- [ ] Unescaped characters in JSX

### **Review Required:**
- [ ] New API routes without proper auth
- [ ] Database queries without customer scoping
- [ ] File uploads without validation
- [ ] Missing error handling

## 📋 Feature Development Checklist

### **Adding New API Route:**
- [ ] Import `auth` from `@clerk/nextjs/server`
- [ ] Use `const { userId } = await auth();`
- [ ] Check if user exists via customer lookup
- [ ] Add proper error handling with try/catch
- [ ] Validate inputs with Zod
- [ ] Test with curl or Postman

### **Database Schema Changes:**
- [ ] Update `prisma/schema.prisma`
- [ ] Run `npx prisma db push`
- [ ] Run `npx prisma generate`
- [ ] Update all affected API routes
- [ ] Test all relationships work

### **Adding New Dependencies:**
- [ ] Install with `npm install <package>`
- [ ] Check package.json updated
- [ ] Import in code with proper types
- [ ] Test build succeeds

## 🎯 Automation Ideas

### **Git Hooks (Future Enhancement):**
```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run build || exit 1
npm run lint || exit 1
echo "✅ Build and lint passed"
```

### **VS Code Settings:**
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📝 Documentation Standards

### **When Adding Features:**
1. Update this SOP if new patterns emerge
2. Document API endpoints in `CLAUDE.md`
3. Add examples for complex functionality
4. Update environment variable docs

### **When Fixing Bugs:**
1. Add the fix pattern to this SOP
2. Document the root cause
3. Create prevention checklist item

## 🔧 Troubleshooting Guide

### **Build Fails with "Property doesn't exist"**
1. Check if you're using correct field names from `prisma/schema.prisma`
2. Verify relationships are properly defined
3. Ensure imports match available exports

### **React Component Type Errors**
**Error:** `Type 'X' is not assignable to type 'Y'`
```bash
# Solutions:
1. Add missing required props (e.g., required={false} for DayPicker)
2. Update function signatures to handle undefined (Date | undefined)
3. Add proper type guards (if (!value) return;)
```

### **API Parameter Type Errors**
**Error:** `Object literal may only specify known properties`
```bash
# Solutions:
1. Check third-party API documentation for correct parameters
2. Remove wrapper objects like { requestBody: {...} }
3. Use correct parameter names and structure
```

### **Implicit Any Type Errors**
**Error:** `Parameter 'X' implicitly has an 'any' type`
```bash
# Solutions:
1. Add explicit type annotation: (contact: any) =>
2. Create proper interface if type is known
3. Use unknown type for better type safety
```

### **Missing Function Arguments**
**Error:** `Expected 3-5 arguments, but got 2`
```bash
# Solutions:
1. Check function signature in documentation
2. Add empty object {} as placeholder parameter
3. Verify you're calling the correct overload
```

### **Auth Errors in API Routes**
1. Verify `await auth()` is used
2. Check Clerk environment variables
3. Confirm middleware.ts is properly configured

### **Database Connection Issues**
1. Check `DATABASE_URL` in `.env.local`
2. Run `npx prisma generate`
3. Verify Neon database is active

### **Prisma Relationship Errors**
**Error:** `Property 'userId' does not exist in type 'BookingWhereInput'`
```bash
# Solutions:
1. Check schema.prisma for correct field names
2. Use proper relationship queries:
   - booking.customer.clerkUserId instead of booking.userId
   - Use proper relation fields (customerId not userId)
3. Verify foreign key relationships are correct
```

## 📊 Success Metrics

### **Green Flags:**
- ✅ `npm run build` succeeds without errors
- ✅ All API routes return expected responses
- ✅ Database queries execute without field errors
- ✅ Authentication flows work end-to-end
- ✅ File uploads and downloads function
- ✅ No TypeScript compilation warnings

### **Goal:**
**Zero build errors on every commit** 🎯

---

## 🤖 Claude Development Notes

When working with Claude on this project:

1. **Always run `npm run build` before considering a feature "complete"**
2. **Ask Claude to verify schema field names when writing queries**
3. **Request TypeScript validation for all new API routes**
4. **Have Claude check for missing dependencies before implementation**
5. **Require auth() pattern validation in all protected routes**

**Remember:** Claude can't see runtime errors until we build - prevention is key!