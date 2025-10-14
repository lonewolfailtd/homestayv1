import { NextRequest, NextResponse } from 'next/server';
import { getXeroClient } from '@/lib/xero';

export async function GET() {
  try {
    const xero = getXeroClient();
    await xero.initialize();
    
    const consentUrl = await xero.buildConsentUrl();
    
    return NextResponse.redirect(consentUrl);
  } catch (error) {
    console.error('Error initiating Xero auth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Xero authorization' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
    }

    const xero = getXeroClient();
    await xero.initialize();

    // Exchange authorization code for tokens
    const tokenSet = await xero.apiCallback(request.url);
    
    // Store token set (in a real app, you'd store this securely)
    // For now, we'll just confirm the connection works
    await xero.setTokenSet(tokenSet);
    await xero.updateTenants();

    return NextResponse.json({
      success: true,
      message: 'Xero authorization successful',
      tenants: xero.tenants.length,
    });

  } catch (error) {
    console.error('Error handling Xero callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete Xero authorization' },
      { status: 500 }
    );
  }
}