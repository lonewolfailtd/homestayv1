# GoHighLevel API Integration - Standard Operating Procedure

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Access Setup](#api-access-setup)
4. [Authentication Configuration](#authentication-configuration)
5. [Contact Management](#contact-management)
6. [Opportunity Management](#opportunity-management)
7. [Pipeline & Workflow Integration](#pipeline--workflow-integration)
8. [Calendar & Appointment Management](#calendar--appointment-management)
9. [Custom Fields & Tags](#custom-fields--tags)
10. [Webhook Integration](#webhook-integration)
11. [Error Handling & Rate Limiting](#error-handling--rate-limiting)
12. [Testing & Validation](#testing--validation)
13. [Production Deployment](#production-deployment)
14. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Overview

This SOP provides a comprehensive guide for integrating GoHighLevel (GHL) CRM and marketing automation platform with web applications. GoHighLevel offers extensive APIs for contact management, pipeline automation, appointment scheduling, and workflow triggers.

**Key Capabilities:**
- Contact creation and management
- Opportunity tracking and pipeline management
- Workflow automation triggers
- Custom field management
- Calendar and appointment integration
- SMS and email automation
- Webhook event handling
- Multi-location support

---

## Prerequisites

### Required Accounts & Access
- **GoHighLevel Account**: Active GHL account with API access
- **Agency/Sub-Account Access**: Appropriate permissions for the location
- **Developer Mode**: Enabled in GHL settings
- **API Permissions**: Contact management, opportunity management, calendar access

### Required Dependencies
```bash
npm install axios
npm install @types/node
```

### Knowledge Requirements
- RESTful API concepts
- Webhook handling
- CRM/pipeline concepts
- JavaScript/TypeScript development
- Understanding of marketing automation workflows

---

## API Access Setup

### 1. Enable Developer Mode in GoHighLevel
1. Navigate to **Settings > Developer Mode**
2. Enable **Developer Mode**
3. This reveals additional API settings and webhook options

### 2. Create Private Integration
1. Go to **Settings > Integrations**
2. Click **Create Private Integration**
3. Fill in integration details:
   - **Integration Name**: Your app name
   - **Redirect URI**: Your callback URL (if using OAuth)
   - **Scopes**: Select required permissions

### 3. Generate API Keys
Choose between two authentication methods:

#### Option A: Private Integration Token (Recommended)
- Navigate to **Settings > API Keys**
- Generate new **Private Integration** token
- Copy the token securely

#### Option B: Location API Key (Legacy)
- Navigate to **Settings > API Keys** 
- Generate **Location API Key**
- Note: More limited scope than private integration

### 4. Obtain Location ID
- Found in **Settings > Company Info**
- Or via API call to `/locations/` endpoint
- Required for most API operations

---

## Authentication Configuration

### Environment Variables Setup
```bash
# .env.local
GOHIGHLEVEL_API_KEY="your_private_integration_token"
GOHIGHLEVEL_LOCATION_ID="your_location_id"
GOHIGHLEVEL_API_VERSION="2021-07-28"  # Current stable version
GOHIGHLEVEL_BASE_URL="https://services.leadconnectorhq.com"
```

### API Client Configuration
```typescript
// lib/gohighlevel.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class GoHighLevelClient {
  private client: AxiosInstance;
  private locationId: string;

  constructor(apiKey: string, locationId: string) {
    this.locationId = locationId;
    
    this.client = axios.create({
      baseURL: 'https://services.leadconnectorhq.com',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28', // API version
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[GHL] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[GHL] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[GHL] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Base request method with error handling
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  private handleApiError(error: any): GoHighLevelError {
    if (error.response) {
      const { status, data } = error.response;
      return new GoHighLevelError(
        data.message || 'API Error',
        status,
        data.error || 'UNKNOWN_ERROR',
        error
      );
    }
    
    return new GoHighLevelError(
      'Network Error',
      0,
      'NETWORK_ERROR',
      error
    );
  }
}

export class GoHighLevelError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'GoHighLevelError';
  }
}
```

---

## Contact Management

### Contact Data Structure
```typescript
interface GHLContact {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  timezone?: string;
  dnd?: boolean; // Do Not Disturb
  tags?: string[];
  customFields?: Record<string, any>;
  source?: string;
  locationId?: string;
}

interface GHLContactResponse {
  contact: {
    id: string;
    locationId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    dateAdded: string;
    dateUpdated: string;
    tags: string[];
    customFields: Record<string, any>;
    source: string;
  };
}
```

### Create Contact
```typescript
export class ContactManager extends GoHighLevelClient {
  async createContact(contactData: GHLContact): Promise<GHLContactResponse> {
    // Validate required fields
    if (!contactData.firstName?.trim()) {
      throw new Error('First name is required');
    }

    // Prepare contact payload
    const payload = {
      firstName: contactData.firstName.trim(),
      lastName: contactData.lastName?.trim() || '',
      email: contactData.email?.trim() || '',
      phone: this.formatPhoneNumber(contactData.phone),
      address1: contactData.address1?.trim() || '',
      city: contactData.city?.trim() || '',
      state: contactData.state?.trim() || '',
      postalCode: contactData.postalCode?.trim() || '',
      country: contactData.country?.trim() || 'NZ',
      website: contactData.website?.trim() || '',
      timezone: contactData.timezone || 'Pacific/Auckland',
      dnd: contactData.dnd || false,
      tags: contactData.tags || [],
      customFields: contactData.customFields || {},
      source: contactData.source || 'API',
      locationId: this.locationId,
    };

    return this.request<GHLContactResponse>({
      method: 'POST',
      url: '/contacts/',
      data: payload,
    });
  }

  async updateContact(contactId: string, updateData: Partial<GHLContact>): Promise<GHLContactResponse> {
    const payload = {
      ...updateData,
      phone: updateData.phone ? this.formatPhoneNumber(updateData.phone) : undefined,
    };

    return this.request<GHLContactResponse>({
      method: 'PUT',
      url: `/contacts/${contactId}`,
      data: payload,
    });
  }

  async getContact(contactId: string): Promise<GHLContactResponse> {
    return this.request<GHLContactResponse>({
      method: 'GET',
      url: `/contacts/${contactId}`,
    });
  }

  async searchContacts(query: {
    email?: string;
    phone?: string;
    limit?: number;
    locationId?: string;
  }): Promise<{ contacts: GHLContactResponse['contact'][] }> {
    const params = new URLSearchParams();
    
    if (query.email) params.append('email', query.email);
    if (query.phone) params.append('phone', this.formatPhoneNumber(query.phone));
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.locationId) params.append('locationId', query.locationId);

    return this.request<{ contacts: GHLContactResponse['contact'][] }>({
      method: 'GET',
      url: `/contacts/search?${params.toString()}`,
    });
  }

  async deleteContact(contactId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'DELETE',
      url: `/contacts/${contactId}`,
    });
  }

  // Utility function for phone number formatting
  private formatPhoneNumber(phone?: string): string {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing (assuming NZ)
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `+64${cleaned.substring(1)}`;
    }
    if (cleaned.length === 9) {
      return `+64${cleaned}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('64')) {
      return `+${cleaned}`;
    }
    
    return phone; // Return original if can't format
  }
}
```

### Contact Tags Management
```typescript
export class TagManager extends GoHighLevelClient {
  async addTagsToContact(contactId: string, tags: string[]): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'POST',
      url: `/contacts/${contactId}/tags`,
      data: { tags },
    });
  }

  async removeTagsFromContact(contactId: string, tags: string[]): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'DELETE',
      url: `/contacts/${contactId}/tags`,
      data: { tags },
    });
  }

  async getLocationTags(): Promise<{ tags: string[] }> {
    return this.request<{ tags: string[] }>({
      method: 'GET',
      url: `/locations/${this.locationId}/tags`,
    });
  }
}
```

---

## Opportunity Management

### Opportunity Data Structure
```typescript
interface GHLOpportunity {
  title: string;
  contactId: string;
  monetaryValue?: number;
  pipelineId: string;
  pipelineStageId: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  source?: string;
  notes?: string;
  customFields?: Record<string, any>;
  tags?: string[];
}

interface GHLOpportunityResponse {
  opportunity: {
    id: string;
    title: string;
    contactId: string;
    monetaryValue: number;
    pipelineId: string;
    pipelineStageId: string;
    status: string;
    source: string;
    dateCreated: string;
    dateUpdated: string;
    notes: string;
    customFields: Record<string, any>;
  };
}
```

### Opportunity Management
```typescript
export class OpportunityManager extends GoHighLevelClient {
  async createOpportunity(opportunityData: GHLOpportunity): Promise<GHLOpportunityResponse> {
    const payload = {
      title: opportunityData.title,
      contactId: opportunityData.contactId,
      monetaryValue: opportunityData.monetaryValue || 0,
      pipelineId: opportunityData.pipelineId,
      pipelineStageId: opportunityData.pipelineStageId,
      status: opportunityData.status,
      source: opportunityData.source || 'API',
      notes: opportunityData.notes || '',
      customFields: opportunityData.customFields || {},
      locationId: this.locationId,
    };

    return this.request<GHLOpportunityResponse>({
      method: 'POST',
      url: '/opportunities/',
      data: payload,
    });
  }

  async updateOpportunity(opportunityId: string, updateData: Partial<GHLOpportunity>): Promise<GHLOpportunityResponse> {
    return this.request<GHLOpportunityResponse>({
      method: 'PUT',
      url: `/opportunities/${opportunityId}`,
      data: updateData,
    });
  }

  async getOpportunity(opportunityId: string): Promise<GHLOpportunityResponse> {
    return this.request<GHLOpportunityResponse>({
      method: 'GET',
      url: `/opportunities/${opportunityId}`,
    });
  }

  async getContactOpportunities(contactId: string): Promise<{ opportunities: GHLOpportunityResponse['opportunity'][] }> {
    return this.request<{ opportunities: GHLOpportunityResponse['opportunity'][] }>({
      method: 'GET',
      url: `/contacts/${contactId}/opportunities`,
    });
  }

  // Move opportunity to different stage
  async moveOpportunityStage(opportunityId: string, stageId: string): Promise<GHLOpportunityResponse> {
    return this.updateOpportunity(opportunityId, {
      pipelineStageId: stageId,
    });
  }
}
```

### Pipeline Management
```typescript
export class PipelineManager extends GoHighLevelClient {
  async getPipelines(): Promise<{ pipelines: any[] }> {
    return this.request<{ pipelines: any[] }>({
      method: 'GET',
      url: `/locations/${this.locationId}/pipelines`,
    });
  }

  async getPipelineStages(pipelineId: string): Promise<{ stages: any[] }> {
    return this.request<{ stages: any[] }>({
      method: 'GET',
      url: `/pipelines/${pipelineId}/stages`,
    });
  }
}
```

---

## Pipeline & Workflow Integration

### Workflow Triggers
```typescript
export class WorkflowManager extends GoHighLevelClient {
  async triggerWorkflow(contactId: string, workflowId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'POST',
      url: '/workflows/trigger',
      data: {
        contactId,
        workflowId,
        locationId: this.locationId,
      },
    });
  }

  async getWorkflows(): Promise<{ workflows: any[] }> {
    return this.request<{ workflows: any[] }>({
      method: 'GET',
      url: `/locations/${this.locationId}/workflows`,
    });
  }

  // Stop active workflow for contact
  async stopWorkflow(contactId: string, workflowId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'DELETE',
      url: `/contacts/${contactId}/workflow/${workflowId}`,
    });
  }
}
```

---

## Calendar & Appointment Management

### Calendar Integration
```typescript
interface GHLAppointment {
  calendarId: string;
  contactId: string;
  startTime: string; // ISO 8601 format
  endTime: string;
  title: string;
  notes?: string;
  address?: string;
}

export class CalendarManager extends GoHighLevelClient {
  async createAppointment(appointmentData: GHLAppointment): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/appointments/',
      data: {
        ...appointmentData,
        locationId: this.locationId,
      },
    });
  }

  async getAppointments(params: {
    calendarId: string;
    startDate: string;
    endDate: string;
  }): Promise<{ appointments: any[] }> {
    const query = new URLSearchParams(params);
    
    return this.request<{ appointments: any[] }>({
      method: 'GET',
      url: `/appointments?${query.toString()}`,
    });
  }

  async getCalendars(): Promise<{ calendars: any[] }> {
    return this.request<{ calendars: any[] }>({
      method: 'GET',
      url: `/locations/${this.locationId}/calendars`,
    });
  }

  async updateAppointment(appointmentId: string, updateData: Partial<GHLAppointment>): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/appointments/${appointmentId}`,
      data: updateData,
    });
  }

  async deleteAppointment(appointmentId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'DELETE',
      url: `/appointments/${appointmentId}`,
    });
  }
}
```

---

## Custom Fields & Tags

### Custom Field Management
```typescript
export class CustomFieldManager extends GoHighLevelClient {
  async getCustomFields(): Promise<{ customFields: any[] }> {
    return this.request<{ customFields: any[] }>({
      method: 'GET',
      url: `/locations/${this.locationId}/customFields`,
    });
  }

  async updateContactCustomField(
    contactId: string, 
    fieldId: string, 
    value: any
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'PUT',
      url: `/contacts/${contactId}/customFields/${fieldId}`,
      data: { value },
    });
  }

  async bulkUpdateCustomFields(
    contactId: string,
    customFields: Record<string, any>
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'PUT',
      url: `/contacts/${contactId}/customFields`,
      data: { customFields },
    });
  }
}
```

---

## Webhook Integration

### Webhook Event Types
```typescript
export enum GHLWebhookEvents {
  CONTACT_CREATE = 'ContactCreate',
  CONTACT_UPDATE = 'ContactUpdate',
  CONTACT_DELETE = 'ContactDelete',
  OPPORTUNITY_CREATE = 'OpportunityCreate',
  OPPORTUNITY_UPDATE = 'OpportunityUpdate',
  OPPORTUNITY_STATUS_UPDATE = 'OpportunityStatusUpdate',
  APPOINTMENT_CREATE = 'AppointmentCreate',
  APPOINTMENT_UPDATE = 'AppointmentUpdate',
  WORKFLOW_COMPLETED = 'WorkflowCompleted',
  INBOUND_MESSAGE = 'InboundMessage',
  OUTBOUND_MESSAGE = 'OutboundMessage',
}
```

### Webhook Handler
```typescript
// /api/gohighlevel/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-ghl-signature');
    
    // Verify webhook signature if available
    if (signature && process.env.GOHIGHLEVEL_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.GOHIGHLEVEL_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
        
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const webhookData = JSON.parse(body);
    
    // Process webhook based on event type
    await processWebhookEvent(webhookData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function processWebhookEvent(data: any) {
  const eventType = data.type;
  const eventData = data.data;
  
  console.log(`[GHL Webhook] Processing ${eventType}:`, eventData);
  
  switch (eventType) {
    case GHLWebhookEvents.CONTACT_CREATE:
      await handleContactCreate(eventData);
      break;
      
    case GHLWebhookEvents.CONTACT_UPDATE:
      await handleContactUpdate(eventData);
      break;
      
    case GHLWebhookEvents.OPPORTUNITY_CREATE:
      await handleOpportunityCreate(eventData);
      break;
      
    case GHLWebhookEvents.OPPORTUNITY_STATUS_UPDATE:
      await handleOpportunityStatusUpdate(eventData);
      break;
      
    case GHLWebhookEvents.APPOINTMENT_CREATE:
      await handleAppointmentCreate(eventData);
      break;
      
    default:
      console.log(`Unhandled webhook event: ${eventType}`);
  }
}

// Webhook event handlers
async function handleContactCreate(contactData: any) {
  // Sync contact to your database
  // Trigger any welcome workflows
  // Send notifications
}

async function handleContactUpdate(contactData: any) {
  // Update local contact records
  // Trigger change-based workflows
}

async function handleOpportunityCreate(opportunityData: any) {
  // Track opportunity in analytics
  // Send notifications to sales team
}

async function handleOpportunityStatusUpdate(opportunityData: any) {
  // Update pipeline reports
  // Trigger won/lost workflows
}

async function handleAppointmentCreate(appointmentData: any) {
  // Send confirmation emails
  // Update calendar integrations
}
```

---

## Error Handling & Rate Limiting

### Rate Limiting
```typescript
export class RateLimitManager {
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 100; // Minimum 100ms between requests

  async addToQueue<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minInterval - timeSinceLastRequest)
        );
      }

      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Queued request failed:', error);
        }
        this.lastRequestTime = Date.now();
      }
    }

    this.processing = false;
  }
}
```

### Enhanced Error Handling
```typescript
export async function handleGHLApiCall<T>(
  apiCall: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (error instanceof GoHighLevelError) {
        // Don't retry authentication errors
        if (error.statusCode === 401 || error.statusCode === 403) {
          throw error;
        }
        
        // Don't retry validation errors
        if (error.statusCode === 400) {
          throw error;
        }
        
        // Retry rate limit errors with exponential backoff
        if (error.statusCode === 429) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff for other errors
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## Testing & Validation

### Test Data Setup
```typescript
// Test configuration
const TEST_CONFIG = {
  locationId: 'test-location-id',
  testContactData: {
    firstName: 'Test',
    lastName: 'Contact',
    email: 'test@example.com',
    phone: '+64211234567',
    tags: ['test-tag'],
  },
  testOpportunityData: {
    title: 'Test Opportunity',
    monetaryValue: 1000,
    pipelineId: 'test-pipeline-id',
    pipelineStageId: 'test-stage-id',
    status: 'open' as const,
  },
};
```

### Integration Tests
```typescript
export class GHLIntegrationTests {
  private ghl: GoHighLevelClient;

  constructor(apiKey: string, locationId: string) {
    this.ghl = new GoHighLevelClient(apiKey, locationId);
  }

  async testContactCreation(): Promise<boolean> {
    try {
      const contactManager = new ContactManager(this.ghl.apiKey, this.ghl.locationId);
      
      // Create test contact
      const result = await contactManager.createContact(TEST_CONFIG.testContactData);
      console.log('Contact created:', result.contact.id);
      
      // Cleanup - delete test contact
      await contactManager.deleteContact(result.contact.id);
      console.log('Test contact cleaned up');
      
      return true;
    } catch (error) {
      console.error('Contact creation test failed:', error);
      return false;
    }
  }

  async testOpportunityCreation(): Promise<boolean> {
    try {
      const contactManager = new ContactManager(this.ghl.apiKey, this.ghl.locationId);
      const opportunityManager = new OpportunityManager(this.ghl.apiKey, this.ghl.locationId);
      
      // Create test contact first
      const contact = await contactManager.createContact(TEST_CONFIG.testContactData);
      
      // Create test opportunity
      const opportunity = await opportunityManager.createOpportunity({
        ...TEST_CONFIG.testOpportunityData,
        contactId: contact.contact.id,
      });
      
      console.log('Opportunity created:', opportunity.opportunity.id);
      
      // Cleanup
      await contactManager.deleteContact(contact.contact.id);
      
      return true;
    } catch (error) {
      console.error('Opportunity creation test failed:', error);
      return false;
    }
  }

  async runAllTests(): Promise<{ [key: string]: boolean }> {
    const results = {
      contactCreation: await this.testContactCreation(),
      opportunityCreation: await this.testOpportunityCreation(),
    };
    
    console.log('Test Results:', results);
    return results;
  }
}
```

---

## Production Deployment

### Environment Configuration
```bash
# Production .env
GOHIGHLEVEL_API_KEY="production_private_integration_token"
GOHIGHLEVEL_LOCATION_ID="production_location_id"
GOHIGHLEVEL_WEBHOOK_SECRET="webhook_verification_secret"
GOHIGHLEVEL_API_VERSION="2021-07-28"

# Security
NODE_ENV="production"
```

### Security Best Practices
- ✅ Store API keys securely (environment variables, secret management)
- ✅ Validate webhook signatures
- ✅ Implement rate limiting
- ✅ Log API calls without exposing sensitive data
- ✅ Use HTTPS for all webhook endpoints
- ✅ Implement proper error handling
- ✅ Monitor API usage and quotas

### Monitoring & Analytics
```typescript
export class GHLAnalytics {
  static logApiCall(method: string, endpoint: string, success: boolean, duration: number) {
    console.log(`[GHL Analytics] ${method} ${endpoint} - Success: ${success} - Duration: ${duration}ms`);
    
    // Send to your analytics service
    // Example: send to DataDog, New Relic, etc.
  }

  static logError(error: GoHighLevelError, context: string) {
    console.error(`[GHL Error] ${context}:`, {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
    
    // Send to error tracking service
    // Example: Sentry, Bugsnag, etc.
  }
}
```

---

## Common Issues & Troubleshooting

### Issue 1: Authentication Failures
**Symptoms**: 401 Unauthorized errors
**Common Causes**:
- Invalid API key
- Expired private integration token
- Wrong location ID
- Insufficient permissions

**Solution**:
```typescript
// Validate authentication
async function validateGHLAuth() {
  try {
    const ghl = new GoHighLevelClient(apiKey, locationId);
    const contacts = await ghl.searchContacts({ limit: 1 });
    console.log('Authentication successful');
    return true;
  } catch (error) {
    console.error('Authentication failed:', error);
    return false;
  }
}
```

### Issue 2: Rate Limiting
**Symptoms**: 429 Too Many Requests
**Solution**: Implement request queuing and exponential backoff

### Issue 3: Contact Duplication
**Symptoms**: Multiple contacts for same person
**Solution**:
```typescript
async function findOrCreateContact(contactData: GHLContact): Promise<string> {
  // Search for existing contact first
  let existingContact = null;
  
  if (contactData.email) {
    const emailSearch = await ghl.searchContacts({ email: contactData.email });
    if (emailSearch.contacts.length > 0) {
      existingContact = emailSearch.contacts[0];
    }
  }
  
  if (!existingContact && contactData.phone) {
    const phoneSearch = await ghl.searchContacts({ phone: contactData.phone });
    if (phoneSearch.contacts.length > 0) {
      existingContact = phoneSearch.contacts[0];
    }
  }
  
  if (existingContact) {
    // Update existing contact
    await ghl.updateContact(existingContact.id, contactData);
    return existingContact.id;
  } else {
    // Create new contact
    const newContact = await ghl.createContact(contactData);
    return newContact.contact.id;
  }
}
```

### Issue 4: Webhook Reliability
**Symptoms**: Missed webhook events
**Solution**:
- Implement idempotency handling
- Add webhook event logging
- Implement retry mechanism for failed processing

### Issue 5: Custom Field Mapping
**Symptoms**: Custom fields not updating correctly
**Solution**:
```typescript
// Get custom field definitions first
const customFields = await ghl.getCustomFields();
const fieldMap = customFields.customFields.reduce((map, field) => {
  map[field.name] = field.id;
  return map;
}, {} as Record<string, string>);

// Use field IDs instead of names
const customFieldUpdates = {
  [fieldMap['Dog Name']]: 'Buddy',
  [fieldMap['Booking Date']]: '2025-02-15',
};
```

---

## Additional Resources

- **GoHighLevel API Documentation**: [highlevel.stoplight.io](https://highlevel.stoplight.io/docs/integrations)
- **Developer Community**: GoHighLevel Facebook Group
- **API Changelog**: Available in GHL dashboard
- **Webhook Testing**: Use ngrok for local development
- **Postman Collection**: Available in API documentation

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Tested With**: GoHighLevel API v2021-07-28