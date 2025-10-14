import { NextRequest, NextResponse } from 'next/server';
import { getXeroClient } from '@/lib/xero';

export async function GET(request: NextRequest) {
  try {
    const xero = getXeroClient();
    await xero.initialize();

    // Handle the OAuth callback
    const tokenSet = await xero.apiCallback(request.url);
    
    // Set token set and update tenants
    await xero.setTokenSet(tokenSet);
    await xero.updateTenants();

    // In a production app, you'd store the tokenSet securely
    // For now, redirect to a success page
    const successUrl = new URL('/xero-success', request.url);
    successUrl.searchParams.set('tenants', xero.tenants.length.toString());
    
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error in Xero callback:', error);
    
    // Redirect to error page
    const errorUrl = new URL('/xero-error', request.url);
    errorUrl.searchParams.set('error', encodeURIComponent(error instanceof Error ? error.message : 'Unknown error'));
    
    return NextResponse.redirect(errorUrl);
  }
}