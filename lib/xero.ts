import { XeroClient, Invoice, LineItem, Contact } from 'xero-node';
import { getValidXeroToken } from './xero-token';

let xeroClient: XeroClient | null = null;

export function getXeroClient() {
  if (!xeroClient) {
    // Temporary fix for environment loading issue
    const clientId = process.env.XERO_CLIENT_ID === 'your_xero_client_id' 
      ? 'A5FB1F6CC58C4C95BD075F82826AB511' 
      : process.env.XERO_CLIENT_ID!;
      
    const clientSecret = process.env.XERO_CLIENT_SECRET === 'your_xero_client_secret'
      ? 'OrfQir5K8na7PdGVwQxwRM3ZOU4WQrpZRjroblQldjcgqJbD'
      : process.env.XERO_CLIENT_SECRET!;
      
    const redirectUri = process.env.XERO_REDIRECT_URI || 'http://localhost:3000/api/xero/callback';
    
    xeroClient = new XeroClient({
      clientId,
      clientSecret,
      redirectUris: [redirectUri],
      scopes: 'openid profile email accounting.settings accounting.transactions offline_access'.split(' '),
      httpTimeout: 3000,
    });
  }
  return xeroClient;
}

export async function getAuthorizedXeroClient() {
  const xero = getXeroClient();
  await xero.initialize();
  
  const token = await getValidXeroToken();
  if (!token) {
    throw new Error('No valid Xero token found. Please connect to Xero first.');
  }
  
  // Set the token in the client
  await xero.setTokenSet({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    token_type: token.tokenType,
    expires_in: Math.floor((token.expiresAt.getTime() - Date.now()) / 1000),
  });
  
  return { xero, tenantId: token.tenantId };
}

// Create deposit invoice (50% of total booking)
export async function createDepositInvoice(booking: {
  customerEmail: string;
  customerName: string;
  dogName: string;
  checkIn: Date;
  checkOut: Date;
  totalDays: number;
  dailyRate: number;
  serviceCharges: number;
  totalPrice: number;
  boardingType: string;
  // Enhanced pricing data
  baseDailyRate?: number;
  peakSurcharge?: number;
  dogSurcharges?: number;
  isPeakPeriod?: boolean;
  peakPeriodName?: string;
  selectedServices?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) {
  try {
    const { xero, tenantId } = await getAuthorizedXeroClient();
    
    if (!tenantId) {
      throw new Error('No Xero tenant ID found. Please reconnect to Xero.');
    }

    const depositAmount = booking.totalPrice * 0.5; // 50% deposit

    // Determine correct item code based on stay duration
    let itemCode: string;
    let description: string;
    
    if (booking.totalDays <= 4) {
      itemCode = '4010-01'; // Short Stay (1-4 days)
      description = `DEPOSIT (50%) - Homestay (Short Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    } else if (booking.totalDays <= 30) {
      itemCode = '4010-02'; // Standard Stay (5-30 days)
      description = `DEPOSIT (50%) - Homestay (Standard Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    } else {
      itemCode = '4010-03'; // Long-term Stay (31+ days)
      description = `DEPOSIT (50%) - Homestay (Long-Term Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    }

    // Create deposit invoice with single line item for 50% of total
    const lineItems: LineItem[] = [
      {
        description: description,
        quantity: 1,
        unitAmount: depositAmount,
        accountCode: '228', // Homestays account
        taxType: 'OUTPUT2', // 15% GST for New Zealand
        itemCode: itemCode,
        lineAmount: depositAmount,
      }
    ];

    const contact: Contact = {
      name: booking.customerName,
      emailAddress: booking.customerEmail,
    };

    const invoiceData: Invoice = {
      type: 'ACCREC' as any,
      contact: contact,
      lineItems: lineItems,
      lineAmountTypes: 'Inclusive' as any,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0], // Due immediately
      reference: `DEPOSIT - Boarding: ${booking.dogName}`,
      status: 'AUTHORISED' as any,
    };

    const invoice = {
      invoices: [invoiceData]
    };

    const response = await xero.accountingApi.createInvoices(tenantId, invoice);
    
    if (response.body.invoices && response.body.invoices.length > 0) {
      const createdInvoice = response.body.invoices[0];
      const invoiceId = createdInvoice.invoiceID;
      
      // Automatically send deposit invoice via email
      try {
        await xero.accountingApi.emailInvoice(tenantId, invoiceId!, {});
        console.log('Deposit invoice emailed successfully to:', booking.customerEmail);
      } catch (emailError) {
        console.error('Failed to email deposit invoice:', emailError);
      }
      
      return {
        success: true,
        invoiceId: invoiceId,
        invoiceNumber: createdInvoice.invoiceNumber,
        invoiceUrl: `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${invoiceId}`,
        depositAmount: depositAmount,
        emailSent: true,
      };
    } else {
      throw new Error('Failed to create deposit invoice');
    }
  } catch (error) {
    console.error('Error creating deposit invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Create balance invoice (remaining 50% due 3 weeks before check-in)
export async function createBalanceInvoice(booking: {
  customerEmail: string;
  customerName: string;
  dogName: string;
  checkIn: Date;
  checkOut: Date;
  totalDays: number;
  dailyRate: number;
  serviceCharges: number;
  totalPrice: number;
  boardingType: string;
  // Enhanced pricing data
  baseDailyRate?: number;
  peakSurcharge?: number;
  dogSurcharges?: number;
  isPeakPeriod?: boolean;
  peakPeriodName?: string;
  selectedServices?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) {
  try {
    const { xero, tenantId } = await getAuthorizedXeroClient();
    
    if (!tenantId) {
      throw new Error('No Xero tenant ID found. Please reconnect to Xero.');
    }

    const balanceAmount = booking.totalPrice * 0.5; // Remaining 50%
    const balanceDueDate = new Date(booking.checkIn);
    balanceDueDate.setDate(balanceDueDate.getDate() - 21); // 3 weeks before check-in
    
    const emailSendDate = new Date(booking.checkIn);
    emailSendDate.setDate(emailSendDate.getDate() - 35); // 5 weeks before check-in

    // Determine correct item code based on stay duration
    let itemCode: string;
    let description: string;
    
    if (booking.totalDays <= 4) {
      itemCode = '4010-01'; // Short Stay (1-4 days)
      description = `BALANCE (50%) - Homestay (Short Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    } else if (booking.totalDays <= 30) {
      itemCode = '4010-02'; // Standard Stay (5-30 days)
      description = `BALANCE (50%) - Homestay (Standard Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    } else {
      itemCode = '4010-03'; // Long-term Stay (31+ days)
      description = `BALANCE (50%) - Homestay (Long-Term Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    }

    // Create balance invoice line items
    const lineItems: LineItem[] = [
      {
        description: description,
        quantity: 1,
        unitAmount: balanceAmount,
        accountCode: '228', // Homestays account
        taxType: 'OUTPUT2', // 15% GST for New Zealand
        itemCode: itemCode,
        lineAmount: balanceAmount,
      }
    ];

    // Add individual service line items if any
    if (booking.selectedServices && booking.selectedServices.length > 0) {
      for (const service of booking.selectedServices) {
        // Import service item code mapping
        const { getServiceItemCode } = await import('./pricing-engine');
        
        // Map service name to service key for item code lookup
        const serviceKeyMap: { [key: string]: string } = {
          'Full Wash & Conditioner': 'GROOMING_MEDIUM', // Default to medium, could be refined
          'Nails Clipped': 'NAIL_CLIP',
          'Adventure Pack Walks': 'PACK_WALK',
          'Pre Walk Assessment x 2': 'WALK_ASSESSMENT',
          'Recall Training': 'RECALL_TRAINING',
          'Obedience Training': 'OBEDIENCE_TRAINING',
          'Balanced Raw Meal': 'RAW_MEAL',
          'Entire Dog Surcharge': 'INTACT_DOG',
        };
        
        const serviceKey = serviceKeyMap[service.name] || 'PACK_WALK'; // Default fallback
        const serviceItemCode = getServiceItemCode(serviceKey);
        
        lineItems.push({
          description: service.name,
          quantity: service.quantity,
          unitAmount: service.unitPrice,
          accountCode: '228',
          taxType: 'OUTPUT2', // 15% GST for New Zealand
          itemCode: serviceItemCode,
          lineAmount: service.total,
        });
      }
    }

    const contact: Contact = {
      name: booking.customerName,
      emailAddress: booking.customerEmail,
    };

    const invoiceData: Invoice = {
      type: 'ACCREC' as any,
      contact: contact,
      lineItems: lineItems,
      lineAmountTypes: 'Inclusive' as any,
      date: new Date().toISOString().split('T')[0],
      dueDate: balanceDueDate.toISOString().split('T')[0], // Due 3 weeks before check-in
      reference: `BALANCE - Boarding: ${booking.dogName}`,
      status: 'AUTHORISED' as any,
    };

    const invoice = {
      invoices: [invoiceData]
    };

    const response = await xero.accountingApi.createInvoices(tenantId, invoice);
    
    if (response.body.invoices && response.body.invoices.length > 0) {
      const createdInvoice = response.body.invoices[0];
      const invoiceId = createdInvoice.invoiceID;
      
      // Email balance invoice if check-in is within appropriate timeframe
      let emailSent = false;
      const now = new Date();
      const daysDifference = Math.floor((booking.checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // If booking is within 5 weeks (35 days), send balance invoice immediately
      if (daysDifference <= 35) {
        try {
          await xero.accountingApi.emailInvoice(tenantId, invoiceId!, {});
          console.log('Balance invoice emailed immediately to:', booking.customerEmail);
          emailSent = true;
        } catch (emailError) {
          console.error('Failed to email balance invoice:', emailError);
        }
      } else {
        console.log(`Balance invoice created for ${booking.customerEmail}, will be emailed on ${emailSendDate.toLocaleDateString()}`);
      }
      
      return {
        success: true,
        invoiceId: invoiceId,
        invoiceNumber: createdInvoice.invoiceNumber,
        invoiceUrl: `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${invoiceId}`,
        balanceAmount: balanceAmount + booking.serviceCharges,
        dueDate: balanceDueDate,
        emailSendDate: emailSendDate,
        emailSent: emailSent,
      };
    } else {
      throw new Error('Failed to create balance invoice');
    }
  } catch (error) {
    console.error('Error creating balance invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Legacy function - keeping for backward compatibility
export async function createXeroInvoice(booking: {
  customerEmail: string;
  customerName: string;
  dogName: string;
  checkIn: Date;
  checkOut: Date;
  totalDays: number;
  dailyRate: number;
  serviceCharges: number;
  totalPrice: number;
  boardingType: string;
  // Enhanced pricing data
  baseDailyRate?: number;
  peakSurcharge?: number;
  dogSurcharges?: number;
  isPeakPeriod?: boolean;
  peakPeriodName?: string;
  selectedServices?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}) {
  try {
    const { xero, tenantId } = await getAuthorizedXeroClient();
    
    if (!tenantId) {
      throw new Error('No Xero tenant ID found. Please reconnect to Xero.');
    }

    // Determine correct item code based on stay duration
    let itemCode: string;
    let description: string;
    
    if (booking.totalDays <= 4) {
      itemCode = '4010-01'; // Short Stay (1-4 days)
      description = `Homestay (Short Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    } else if (booking.totalDays <= 30) {
      itemCode = '4010-02'; // Standard Stay (5-30 days)
      description = `Homestay (Standard Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    } else {
      itemCode = '4010-03'; // Long-term Stay (31+ days)
      description = `Homestay (Long-Term Stay) for ${booking.dogName} - ${booking.totalDays} days`;
    }

    // Create invoice with GST using your actual item codes
    const lineItems: LineItem[] = [
      {
        description: description,
        quantity: booking.totalDays,
        unitAmount: booking.dailyRate,
        accountCode: '228', // Homestays account
        taxType: 'OUTPUT2', // 15% GST for New Zealand
        itemCode: itemCode,
        lineAmount: booking.totalDays * booking.dailyRate,
      }
    ];

    // Add individual service line items if any
    if (booking.selectedServices && booking.selectedServices.length > 0) {
      for (const service of booking.selectedServices) {
        // Import service item code mapping
        const { getServiceItemCode } = await import('./pricing-engine');
        
        // Map service name to service key for item code lookup
        const serviceKeyMap: { [key: string]: string } = {
          'Full Wash & Conditioner': 'GROOMING_MEDIUM', // Default to medium, could be refined
          'Nails Clipped': 'NAIL_CLIP',
          'Adventure Pack Walks': 'PACK_WALK',
          'Pre Walk Assessment x 2': 'WALK_ASSESSMENT',
          'Recall Training': 'RECALL_TRAINING',
          'Obedience Training': 'OBEDIENCE_TRAINING',
          'Balanced Raw Meal': 'RAW_MEAL',
          'Entire Dog Surcharge': 'INTACT_DOG',
        };
        
        const serviceKey = serviceKeyMap[service.name] || 'PACK_WALK'; // Default fallback
        const serviceItemCode = getServiceItemCode(serviceKey);
        
        lineItems.push({
          description: service.name,
          quantity: service.quantity,
          unitAmount: service.unitPrice,
          accountCode: '228',
          taxType: 'OUTPUT2', // 15% GST for New Zealand
          itemCode: serviceItemCode,
          lineAmount: service.total,
        });
      }
    }

    const contact: Contact = {
      name: booking.customerName,
      emailAddress: booking.customerEmail,
    };

    const invoiceData: Invoice = {
      type: 'ACCREC' as any,
      contact: contact,
      lineItems: lineItems,
      lineAmountTypes: 'Inclusive' as any,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      reference: `Boarding: ${booking.dogName}`,
      status: 'AUTHORISED' as any,
    };

    const invoice = {
      invoices: [invoiceData]
    };

    const response = await xero.accountingApi.createInvoices(tenantId, invoice);
    
    if (response.body.invoices && response.body.invoices.length > 0) {
      const createdInvoice = response.body.invoices[0];
      const invoiceId = createdInvoice.invoiceID;
      
      // Automatically send invoice via email
      try {
        await xero.accountingApi.emailInvoice(tenantId, invoiceId!, {});
        console.log('Invoice emailed successfully to:', booking.customerEmail);
      } catch (emailError) {
        console.error('Failed to email invoice automatically:', emailError);
        // Don't fail the whole process if email fails
      }
      
      return {
        success: true,
        invoiceId: invoiceId,
        invoiceNumber: createdInvoice.invoiceNumber,
        invoiceUrl: `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${invoiceId}`,
        emailSent: true, // Indicate that email was attempted
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