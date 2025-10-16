# Xero API Integration - Standard Operating Procedure

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Xero App Setup](#xero-app-setup)
4. [Authentication & OAuth 2.0 Flow](#authentication--oauth-20-flow)
5. [API Client Configuration](#api-client-configuration)
6. [Token Management](#token-management)
7. [Invoice Creation](#invoice-creation)
8. [Contact Management](#contact-management)
9. [Item Codes & Tax Configuration](#item-codes--tax-configuration)
10. [Error Handling](#error-handling)
11. [Testing & Validation](#testing--validation)
12. [Production Deployment](#production-deployment)
13. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Overview

This SOP provides a complete guide for integrating Xero accounting software with web applications. The integration enables automated invoice creation, contact management, and financial record keeping.

**Key Capabilities:**
- OAuth 2.0 authentication with refresh token management
- Automated invoice generation with GST calculations
- Contact creation and updates
- Email automation for invoice delivery
- Multi-tenant support
- Error handling and retry logic

---

## Prerequisites

### Required Accounts & Access
- **Xero Developer Account**: Sign up at [developer.xero.com](https://developer.xero.com)
- **Xero Organization**: Access to a Xero accounting organization (Demo Company acceptable for testing)
- **Development Environment**: Node.js application with TypeScript support

### Required Dependencies
```bash
npm install xero-node
npm install @types/node
```

### Knowledge Requirements
- Understanding of OAuth 2.0 flow
- TypeScript/JavaScript development
- RESTful API concepts
- Basic accounting principles (invoices, contacts, tax codes)

---

## Xero App Setup

### 1. Create Xero App
1. Navigate to [developer.xero.com](https://developer.xero.com)
2. Click "Create an app"
3. Choose "Web app" for server-side applications
4. Fill in app details:
   - **App name**: Your application name
   - **Company URL**: Your website
   - **Privacy policy URL**: Your privacy policy
   - **Terms of service URL**: Your terms of service

### 2. Configure OAuth 2.0 Settings
```
Redirect URI: https://yourdomain.com/api/xero/callback
OR for development: http://localhost:3000/api/xero/callback
```

### 3. Required Scopes
Select these scopes for full integration:
- `openid` - Required for OAuth
- `profile` - User profile access
- `email` - User email access
- `accounting.settings` - Read organization settings
- `accounting.transactions` - Create/read invoices and transactions
- `offline_access` - Refresh token capability

### 4. Obtain Credentials
After creation, note down:
- **Client ID**: Used for authentication
- **Client Secret**: Keep secure, never expose in frontend

---

## Authentication & OAuth 2.0 Flow

### Environment Variables Setup
```bash
# .env.local
XERO_CLIENT_ID="your_xero_client_id"
XERO_CLIENT_SECRET="your_xero_client_secret"
XERO_REDIRECT_URI="http://localhost:3000/api/xero/callback"
```

### OAuth Flow Implementation

#### 1. Initialize Authorization
```typescript
// /api/xero/auth/route.ts
import { XeroClient } from 'xero-node';

export async function GET() {
  const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [process.env.XERO_REDIRECT_URI!],
    scopes: 'openid profile email accounting.settings accounting.transactions offline_access'.split(' '),
  });

  await xero.initialize();
  const consentUrl = await xero.buildConsentUrl();
  
  return Response.redirect(consentUrl);
}
```

#### 2. Handle OAuth Callback
```typescript
// /api/xero/callback/route.ts
import { XeroClient } from 'xero-node';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return new Response('Authorization code not found', { status: 400 });
  }

  const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [process.env.XERO_REDIRECT_URI!],
    scopes: 'openid profile email accounting.settings accounting.transactions offline_access'.split(' '),
  });

  await xero.initialize();
  const tokenSet = await xero.apiCallback(request.url);
  
  // Store token securely (database recommended)
  await storeXeroToken({
    accessToken: tokenSet.access_token!,
    refreshToken: tokenSet.refresh_token!,
    expiresAt: new Date(Date.now() + tokenSet.expires_in! * 1000),
    tokenType: tokenSet.token_type!,
    tenantId: xero.tenants[0].tenantId,
  });

  return Response.redirect('/dashboard?xero=connected');
}
```

---

## API Client Configuration

### Base Client Setup
```typescript
// lib/xero.ts
import { XeroClient, Invoice, LineItem, Contact } from 'xero-node';

let xeroClient: XeroClient | null = null;

export function getXeroClient() {
  if (!xeroClient) {
    xeroClient = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID!,
      clientSecret: process.env.XERO_CLIENT_SECRET!,
      redirectUris: [process.env.XERO_REDIRECT_URI!],
      scopes: 'openid profile email accounting.settings accounting.transactions offline_access'.split(' '),
      httpTimeout: 3000, // 3 second timeout
    });
  }
  return xeroClient;
}

export async function getAuthorizedXeroClient() {
  const xero = getXeroClient();
  await xero.initialize();
  
  const token = await getValidXeroToken(); // Your token retrieval function
  if (!token) {
    throw new Error('No valid Xero token found. Please reconnect to Xero.');
  }
  
  await xero.setTokenSet({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    token_type: token.tokenType,
    expires_in: Math.floor((token.expiresAt.getTime() - Date.now()) / 1000),
  });
  
  return { xero, tenantId: token.tenantId };
}
```

---

## Token Management

### Database Schema for Token Storage
```sql
-- PostgreSQL/Prisma schema
model XeroToken {
  id           String   @id @default(cuid())
  accessToken  String
  refreshToken String
  expiresAt    DateTime
  tokenType    String   @default("Bearer")
  tenantId     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Token Validation & Refresh
```typescript
// lib/xero-token.ts
import { prisma } from './db';
import { getXeroClient } from './xero';

export async function getValidXeroToken() {
  try {
    const token = await prisma.xeroToken.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!token) {
      return null;
    }

    // Check if token is expired (with 5-minute buffer)
    const expirationBuffer = 5 * 60 * 1000; // 5 minutes
    const isExpired = token.expiresAt.getTime() - Date.now() < expirationBuffer;

    if (isExpired && token.refreshToken) {
      return await refreshXeroToken(token);
    }

    return token;
  } catch (error) {
    console.error('Error getting Xero token:', error);
    return null;
  }
}

async function refreshXeroToken(token: any) {
  try {
    const xero = getXeroClient();
    await xero.initialize();

    const refreshedTokenSet = await xero.refreshToken();
    
    // Update token in database
    const updatedToken = await prisma.xeroToken.update({
      where: { id: token.id },
      data: {
        accessToken: refreshedTokenSet.access_token!,
        refreshToken: refreshedTokenSet.refresh_token || token.refreshToken,
        expiresAt: new Date(Date.now() + refreshedTokenSet.expires_in! * 1000),
        tokenType: refreshedTokenSet.token_type!,
      }
    });

    console.log('Xero token refreshed successfully');
    return updatedToken;
  } catch (error) {
    console.error('Error refreshing Xero token:', error);
    return null;
  }
}
```

---

## Invoice Creation

### Basic Invoice Structure
```typescript
export async function createXeroInvoice(invoiceData: {
  customerEmail: string;
  customerName: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    accountCode: string;
    taxType: string;
    itemCode?: string;
  }>;
  reference?: string;
  dueDate?: Date;
}) {
  try {
    const { xero, tenantId } = await getAuthorizedXeroClient();
    
    if (!tenantId) {
      throw new Error('No Xero tenant ID found. Please reconnect to Xero.');
    }

    const contact: Contact = {
      name: invoiceData.customerName,
      emailAddress: invoiceData.customerEmail,
    };

    const lineItems: LineItem[] = invoiceData.lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      accountCode: item.accountCode,
      taxType: item.taxType,
      itemCode: item.itemCode,
      lineAmount: item.quantity * item.unitAmount,
    }));

    const invoice: Invoice = {
      type: 'ACCREC' as any,
      contact: contact,
      lineItems: lineItems,
      lineAmountTypes: 'Inclusive' as any, // GST inclusive
      date: new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate?.toISOString().split('T')[0] || 
               new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reference: invoiceData.reference,
      status: 'AUTHORISED' as any,
    };

    const response = await xero.accountingApi.createInvoices(tenantId, {
      invoices: [invoice]
    });
    
    if (response.body.invoices && response.body.invoices.length > 0) {
      const createdInvoice = response.body.invoices[0];
      
      // Send invoice via email
      await emailInvoice(xero, tenantId, createdInvoice.invoiceID!, {
        subject: `Invoice ${createdInvoice.invoiceNumber}`,
        body: `Please find attached your invoice.`
      });
      
      return {
        success: true,
        invoiceId: createdInvoice.invoiceID,
        invoiceNumber: createdInvoice.invoiceNumber,
        invoiceUrl: `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${createdInvoice.invoiceID}`,
      };
    } else {
      throw new Error('Failed to create invoice');
    }
  } catch (error) {
    console.error('Error creating Xero invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
```

### Email Invoice Function
```typescript
async function emailInvoice(
  xero: XeroClient, 
  tenantId: string, 
  invoiceId: string, 
  emailData: { subject: string; body: string }
) {
  try {
    await xero.accountingApi.emailInvoice(tenantId, invoiceId, {
      requestBody: {
        subject: emailData.subject,
        body: emailData.body,
      }
    });
    console.log('Invoice emailed successfully');
  } catch (error) {
    console.error('Failed to email invoice:', error);
    throw error;
  }
}
```

---

## Contact Management

### Create or Update Contact
```typescript
export async function createOrUpdateContact(contactData: {
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}) {
  try {
    const { xero, tenantId } = await getAuthorizedXeroClient();

    const contact: Contact = {
      name: contactData.name,
      emailAddress: contactData.email,
      phones: contactData.phone ? [{
        phoneType: 'DEFAULT' as any,
        phoneNumber: contactData.phone,
      }] : undefined,
      addresses: contactData.address ? [{
        addressType: 'POBOX' as any,
        addressLine1: contactData.address.line1,
        city: contactData.address.city,
        postalCode: contactData.address.postalCode,
        country: contactData.address.country,
      }] : undefined,
    };

    const response = await xero.accountingApi.createContacts(tenantId, {
      contacts: [contact]
    });

    return {
      success: true,
      contactId: response.body.contacts![0].contactID,
    };
  } catch (error) {
    console.error('Error creating Xero contact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
```

---

## Item Codes & Tax Configuration

### Item Code Management
```typescript
// Define your item codes for consistent invoicing
export const XERO_ITEM_CODES = {
  // Services
  'SHORT_STAY': '4010-01',
  'STANDARD_STAY': '4010-02', 
  'LONG_STAY': '4010-03',
  'GROOMING_SMALL': '4010-04-1',
  'GROOMING_MEDIUM': '4010-04-2',
  'GROOMING_LARGE': '4010-04-3',
  'ADDITIONAL_SERVICE': '4010-08',
};

// Account codes for different revenue streams
export const ACCOUNT_CODES = {
  ACCOMMODATION: '228',    // Homestays
  SERVICES: '230',         // Additional services
  TRAINING: '232',         // Training services
};

// Tax types for different jurisdictions
export const TAX_TYPES = {
  NZ_GST: 'OUTPUT2',       // 15% GST for New Zealand
  AU_GST: 'OUTPUT',        // 10% GST for Australia
  NO_TAX: 'NONE',          // No tax
};
```

### GST Configuration
```typescript
// For New Zealand (15% GST)
const nzInvoiceConfig = {
  lineAmountTypes: 'Inclusive' as any,  // Prices include GST
  taxType: 'OUTPUT2',                    // 15% GST rate
  accountCode: '228',                    // Revenue account
};

// For Australia (10% GST)
const auInvoiceConfig = {
  lineAmountTypes: 'Inclusive' as any,  // Prices include GST
  taxType: 'OUTPUT',                     // 10% GST rate
  accountCode: '228',                    // Revenue account
};
```

---

## Error Handling

### Common Error Scenarios
```typescript
export class XeroIntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'XeroIntegrationError';
  }
}

export async function handleXeroApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    // Handle specific Xero API errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          throw new XeroIntegrationError(
            'Unauthorized - Token may be expired',
            'UNAUTHORIZED',
            401,
            error
          );
        case 403:
          throw new XeroIntegrationError(
            'Forbidden - Insufficient permissions',
            'FORBIDDEN',
            403,
            error
          );
        case 429:
          throw new XeroIntegrationError(
            'Rate limit exceeded',
            'RATE_LIMITED',
            429,
            error
          );
        case 400:
          throw new XeroIntegrationError(
            `Bad Request: ${data?.Message || 'Invalid data'}`,
            'BAD_REQUEST',
            400,
            error
          );
        default:
          throw new XeroIntegrationError(
            `API Error: ${data?.Message || 'Unknown error'}`,
            'API_ERROR',
            status,
            error
          );
      }
    }
    
    throw new XeroIntegrationError(
      'Network or unknown error',
      'NETWORK_ERROR',
      undefined,
      error
    );
  }
}
```

### Retry Logic
```typescript
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication or permission errors
      if (error instanceof XeroIntegrationError) {
        if (['UNAUTHORIZED', 'FORBIDDEN', 'BAD_REQUEST'].includes(error.code)) {
          throw error;
        }
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw lastError!;
}
```

---

## Testing & Validation

### Test Environment Setup
```typescript
// Use Xero Demo Company for testing
const TEST_TENANT_ID = 'demo-company-tenant-id';

// Test data
const testInvoiceData = {
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  lineItems: [{
    description: 'Test Service',
    quantity: 1,
    unitAmount: 100,
    accountCode: '228',
    taxType: 'OUTPUT2',
    itemCode: '4010-01',
  }],
  reference: 'TEST-001',
};
```

### Validation Functions
```typescript
export function validateInvoiceData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.customerName?.trim()) {
    errors.push('Customer name is required');
  }
  
  if (!data.customerEmail?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid customer email is required');
  }
  
  if (!data.lineItems?.length) {
    errors.push('At least one line item is required');
  }
  
  data.lineItems?.forEach((item: any, index: number) => {
    if (!item.description?.trim()) {
      errors.push(`Line item ${index + 1}: Description is required`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Line item ${index + 1}: Valid quantity is required`);
    }
    if (typeof item.unitAmount !== 'number' || item.unitAmount < 0) {
      errors.push(`Line item ${index + 1}: Valid unit amount is required`);
    }
  });
  
  return errors;
}
```

---

## Production Deployment

### Environment Configuration
```bash
# Production .env
XERO_CLIENT_ID="production_client_id"
XERO_CLIENT_SECRET="production_client_secret"
XERO_REDIRECT_URI="https://yourdomain.com/api/xero/callback"

# Security considerations
NODE_ENV="production"
DATABASE_URL="secure_production_database_url"
```

### Security Checklist
- ✅ Never expose Client Secret in frontend code
- ✅ Use HTTPS for all OAuth redirects
- ✅ Store tokens securely in database with encryption
- ✅ Implement proper error logging without exposing sensitive data
- ✅ Set up monitoring for API rate limits
- ✅ Regular token refresh monitoring
- ✅ Backup strategy for token data

### Monitoring & Logging
```typescript
// Add comprehensive logging
export function logXeroActivity(activity: string, data: any) {
  console.log(`[XERO] ${activity}:`, {
    timestamp: new Date().toISOString(),
    activity,
    data: {
      ...data,
      // Remove sensitive information
      accessToken: data.accessToken ? '[REDACTED]' : undefined,
      refreshToken: data.refreshToken ? '[REDACTED]' : undefined,
    },
  });
}
```

---

## Common Issues & Troubleshooting

### Issue 1: Token Expired Errors
**Symptoms**: 401 Unauthorized errors
**Solution**: 
- Implement automatic token refresh
- Add token expiration buffer (5+ minutes)
- Handle refresh token rotation

### Issue 2: Invoice Creation Failures
**Symptoms**: 400 Bad Request on invoice creation
**Common Causes**:
- Invalid item codes
- Missing required fields
- Incorrect tax configuration
- Invalid date formats

**Solution**:
```typescript
// Validate all data before API call
const validationErrors = validateInvoiceData(invoiceData);
if (validationErrors.length > 0) {
  throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
}
```

### Issue 3: Rate Limiting
**Symptoms**: 429 Too Many Requests
**Solution**:
- Implement exponential backoff
- Queue API requests
- Monitor rate limit headers

### Issue 4: Multi-Tenant Issues
**Symptoms**: Wrong organization data
**Solution**:
- Always validate tenant ID
- Store tenant mapping securely
- Handle tenant switching

---

## Additional Resources

- **Xero Developer Documentation**: [developer.xero.com/documentation](https://developer.xero.com/documentation)
- **xero-node SDK**: [github.com/XeroAPI/xero-node](https://github.com/XeroAPI/xero-node)
- **API Reference**: [developer.xero.com/documentation/api/accounting](https://developer.xero.com/documentation/api/accounting)
- **Postman Collection**: Available in Xero Developer portal
- **Community Forum**: [community.xero.com/developer](https://community.xero.com/developer)

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Tested With**: xero-node v4.x, Node.js 18+