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
}) {
  try {
    const { xero, tenantId } = await getAuthorizedXeroClient();
    
    if (!tenantId) {
      throw new Error('No Xero tenant ID found. Please reconnect to Xero.');
    }

    // Create invoice
    const lineItems: LineItem[] = [
      {
        description: `${booking.boardingType.charAt(0).toUpperCase() + booking.boardingType.slice(1)} boarding for ${booking.dogName}`,
        quantity: booking.totalDays,
        unitAmount: booking.dailyRate,
        accountCode: '228', // Homestay revenue account
        taxType: 'NONE',
        lineAmount: booking.totalDays * booking.dailyRate,
      }
    ];

    if (booking.serviceCharges > 0) {
      lineItems.push({
        description: 'Additional services',
        quantity: 1,
        unitAmount: booking.serviceCharges,
        accountCode: '228',
        taxType: 'NONE',
        lineAmount: booking.serviceCharges,
      });
    }

    const contact: Contact = {
      name: booking.customerName,
      emailAddress: booking.customerEmail,
    };

    const invoiceData: Invoice = {
      type: 'ACCREC' as any,
      contact: contact,
      lineItems: lineItems,
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
      return {
        success: true,
        invoiceId: response.body.invoices[0].invoiceID,
        invoiceNumber: response.body.invoices[0].invoiceNumber,
        invoiceUrl: `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${response.body.invoices[0].invoiceID}`,
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