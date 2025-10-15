import { NextRequest, NextResponse } from 'next/server';
import { getXeroClient } from '@/lib/xero';
import { saveXeroToken } from '@/lib/xero-token';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const xero = getXeroClient();
    await xero.initialize();

    // Handle the OAuth callback
    const tokenSet = await xero.apiCallback(request.url);
    
    // Set token set and update tenants
    await xero.setTokenSet(tokenSet);
    await xero.updateTenants();

    // Save tokens to database
    const expiresAt = new Date(Date.now() + (tokenSet.expires_in || 1800) * 1000);
    
    const tenant = xero.tenants[0]; // Use first tenant
    await saveXeroToken({
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      tokenType: tokenSet.token_type || 'Bearer',
      expiresAt,
      tenantId: tenant?.tenantId,
      tenantType: tenant?.tenantType,
      tenantName: tenant?.tenantName,
    });

    // Redirect to success page
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