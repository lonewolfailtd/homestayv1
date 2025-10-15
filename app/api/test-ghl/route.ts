import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID;

    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('Location ID:', locationId ? `${locationId.substring(0, 10)}...` : 'NOT SET');

    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'API credentials not configured' }, { status: 400 });
    }

    // Test the API key with a simple request
    const response = await fetch('https://rest.gohighlevel.com/v1/locations/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('GHL API Response Status:', response.status);
    console.log('GHL API Response:', responseText);

    if (!response.ok) {
      return NextResponse.json({
        error: 'GoHighLevel API test failed',
        status: response.status,
        response: responseText
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'GoHighLevel API connection successful',
      response: JSON.parse(responseText)
    });

  } catch (error) {
    console.error('Error testing GoHighLevel API:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}