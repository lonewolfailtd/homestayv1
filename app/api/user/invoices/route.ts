import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Get Clerk user to access email
    const { currentUser } = await import('@clerk/nextjs/server');
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;

    // Get customer record by email from Clerk user or clerkUserId
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { clerkUserId: clerkUserId },
          { email: userEmail }
        ]
      }
    });

    // If no customer exists, return empty invoices
    if (!customer) {
      return NextResponse.json({
        invoices: []
      });
    }

    // Get all bookings with invoice information
    const bookings = await prisma.booking.findMany({
      where: { customerId: customer.id },
      include: {
        dog: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform bookings into invoice records
    const invoices: any[] = [];

    for (const booking of bookings) {
      const now = new Date();

      // Add deposit invoice if it exists
      if (Number(booking.depositAmount) > 0) {
        const depositDueDate = booking.createdAt; // Deposit due immediately
        const isOverdue = !booking.depositPaid && depositDueDate < now;

        invoices.push({
          id: `${booking.id}-deposit`,
          bookingId: booking.id,
          invoiceNumber: booking.depositInvoiceId || `DEP-${booking.id.slice(0, 8)}`,
          type: 'deposit',
          amount: Number(booking.depositAmount),
          status: booking.depositPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
          dueDate: depositDueDate.toISOString(),
          paidDate: booking.depositPaid ? booking.createdAt.toISOString() : undefined,
          dogName: booking.dog.name,
          checkInDate: booking.checkIn.toISOString(),
          checkOutDate: booking.checkOut.toISOString(),
          xeroInvoiceId: booking.depositInvoiceId,
          paymentMethod: booking.paymentMethod,
          downloadUrl: booking.depositInvoiceId
            ? `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${booking.depositInvoiceId}`
            : undefined
        });
      }

      // Add balance invoice if it exists
      if (Number(booking.balanceAmount) > 0 && booking.balanceDueDate) {
        const balanceDueDate = booking.balanceDueDate;
        const isOverdue = !booking.balancePaid && balanceDueDate < now;

        invoices.push({
          id: `${booking.id}-balance`,
          bookingId: booking.id,
          invoiceNumber: booking.balanceInvoiceId || `BAL-${booking.id.slice(0, 8)}`,
          type: 'balance',
          amount: Number(booking.balanceAmount),
          status: booking.balancePaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
          dueDate: balanceDueDate.toISOString(),
          paidDate: booking.balancePaid ? booking.checkIn.toISOString() : undefined,
          dogName: booking.dog.name,
          checkInDate: booking.checkIn.toISOString(),
          checkOutDate: booking.checkOut.toISOString(),
          xeroInvoiceId: booking.balanceInvoiceId,
          paymentMethod: booking.paymentMethod,
          downloadUrl: booking.balanceInvoiceId
            ? `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${booking.balanceInvoiceId}`
            : undefined
        });
      }

      // Handle legacy single-invoice bookings
      if (Number(booking.depositAmount) === 0 && Number(booking.balanceAmount) === 0 && booking.xeroInvoiceId) {
        const dueDate = booking.createdAt;
        const isOverdue = !booking.depositPaid && dueDate < now;

        invoices.push({
          id: booking.id,
          bookingId: booking.id,
          invoiceNumber: booking.xeroInvoiceId || `INV-${booking.id.slice(0, 8)}`,
          type: 'deposit',
          amount: Number(booking.totalPrice),
          status: booking.depositPaid || booking.balancePaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
          dueDate: dueDate.toISOString(),
          paidDate: booking.depositPaid ? booking.createdAt.toISOString() : undefined,
          dogName: booking.dog.name,
          checkInDate: booking.checkIn.toISOString(),
          checkOutDate: booking.checkOut.toISOString(),
          xeroInvoiceId: booking.xeroInvoiceId,
          downloadUrl: booking.xeroInvoiceId
            ? `https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${booking.xeroInvoiceId}`
            : undefined
        });
      }
    }

    return NextResponse.json({
      invoices
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
