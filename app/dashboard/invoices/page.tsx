'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  type: 'deposit' | 'balance';
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  dogName: string;
  checkInDate: string;
  checkOutDate: string;
  xeroInvoiceId?: string;
  downloadUrl?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/invoices');
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices || []);
      } else {
        toast.error(data.error || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount);
  };

  const handleDownload = async (invoice: Invoice) => {
    if (invoice.downloadUrl) {
      window.open(invoice.downloadUrl, '_blank');
    } else {
      toast.info('Invoice download not available yet');
    }
  };

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading text-black">Invoices & Receipts</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        <div className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading text-black">Invoices & Receipts</h1>
          <p className="text-gray-600 font-body">
            View and download your booking invoices and payment receipts
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-green-100 rounded-xl p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-heading text-black">{formatCurrency(totalPaid)}</div>
          <div className="text-sm text-gray-600 font-body">Total Paid</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-amber-100 rounded-xl p-3">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-heading text-black">{formatCurrency(totalPending)}</div>
          <div className="text-sm text-gray-600 font-body">Pending</div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-red-100 rounded-xl p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-heading text-black">{formatCurrency(totalOverdue)}</div>
          <div className="text-sm text-gray-600 font-body">Overdue</div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-heading text-black">All Invoices</h2>
        </div>
        
        <div className="p-6">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-button font-medium text-gray-600 mb-2">
                No invoices yet
              </h3>
              <p className="text-gray-500 font-body mb-4">
                Invoices will appear here when you make bookings
              </p>
              <a
                href="/book"
                className="btn-primary inline-block"
              >
                Make Your First Booking
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 rounded-lg p-2">
                        <FileText className="h-5 w-5 text-black" />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-button font-medium text-black">
                            {invoice.invoiceNumber || `Invoice #${invoice.id.slice(0, 8)}`}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            invoice.type === 'deposit' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {invoice.type === 'deposit' ? 'Deposit' : 'Balance'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 font-body">
                          <span>{invoice.dogName}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(invoice.checkInDate)} - {formatDate(invoice.checkOutDate)}</span>
                        </div>
                        
                        <div className="text-xs text-gray-500 font-body mt-1">
                          Due: {formatDate(invoice.dueDate)}
                          {invoice.paidDate && (
                            <span className="ml-2">• Paid: {formatDate(invoice.paidDate)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-heading text-black">
                          {formatCurrency(invoice.amount)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(invoice)}
                          className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                          title="Download invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        
                        {invoice.xeroInvoiceId && (
                          <button
                            onClick={() => window.open(`https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${invoice.xeroInvoiceId}`, '_blank')}
                            className="p-2 text-gray-400 hover:text-cyan-600 transition-colors"
                            title="View in Xero"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}