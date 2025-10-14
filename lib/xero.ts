import { XeroClient } from 'xero-node';

let xeroClient: XeroClient | null = null;

export function getXeroClient() {
  if (!xeroClient) {
    xeroClient = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID!,
      clientSecret: process.env.XERO_CLIENT_SECRET!,
      redirectUris: [process.env.XERO_REDIRECT_URI!],
      scopes: 'openid profile email accounting.settings accounting.transactions offline_access'.split(' '),
      httpTimeout: 3000,
    });
  }
  return xeroClient;
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
    const xero = getXeroClient();
    
    // Initialize Xero client
    await xero.initialize();
    
    // Get tenant ID (assumes first tenant)
    await xero.updateTenants();
    const activeTenantId = xero.tenants[0]?.tenantId;
    
    if (!activeTenantId) {
      throw new Error('No active Xero tenant found');
    }

    // Create invoice
    const invoice = {
      invoices: [
        {
          type: 'ACCREC' as const,
          contact: {
            name: booking.customerName,
            emailAddress: booking.customerEmail,
          },
          lineItems: [
            {
              description: `${booking.boardingType.charAt(0).toUpperCase() + booking.boardingType.slice(1)} boarding for ${booking.dogName}`,
              quantity: booking.totalDays,
              unitAmount: booking.dailyRate,
              accountCode: '200', // Revenue account
              taxType: 'NONE',
              lineAmount: booking.totalDays * booking.dailyRate,
            },
            ...(booking.serviceCharges > 0 ? [{
              description: 'Additional services',
              quantity: 1,
              unitAmount: booking.serviceCharges,
              accountCode: '200',
              taxType: 'NONE',
              lineAmount: booking.serviceCharges,
            }] : [])
          ],
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          reference: `Boarding: ${booking.dogName}`,
          status: 'AUTHORISED' as const,
        }
      ]
    };

    const response = await xero.accountingApi.createInvoices(activeTenantId, invoice);
    
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