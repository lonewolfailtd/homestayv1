import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Temporary hardcode to test API credentials (environment loading issue)
    const apiKey = process.env.GOHIGHLEVEL_API_KEY === 'your_gohighlevel_api_key' 
      ? 'pit-27a5c1a7-226f-4d4d-be78-f283d50a0585' 
      : process.env.GOHIGHLEVEL_API_KEY;
    const locationId = process.env.GOHIGHLEVEL_LOCATION_ID === 'your_location_id'
      ? 'mVQxYpWNwb0DgXHsEKn3'
      : process.env.GOHIGHLEVEL_LOCATION_ID;

    if (!apiKey || !locationId) {
      return NextResponse.json({ 
        error: 'Missing API credentials',
        hasApiKey: !!apiKey,
        hasLocationId: !!locationId
      }, { status: 400 });
    }

    console.log('Testing GoHighLevel API...');
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
    console.log('Location ID:', locationId);

    // Test 1: Verify Location
    console.log('\n=== Test 1: Verify Location ===');
    const locationResponse = await fetch('https://rest.gohighlevel.com/v1/locations/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const locationResult = await locationResponse.text();
    console.log('Location API Status:', locationResponse.status);
    console.log('Location API Response:', locationResult);

    // Test 2: Simple Contact Creation (no custom fields)
    console.log('\n=== Test 2: Simple Contact Creation ===');
    const simpleContact = {
      locationId: locationId,
      firstName: 'Test',
      lastName: 'Debug',
      email: 'test-debug-' + Date.now() + '@example.com',
      phone: '+64 21 999 0000',
      source: 'website'
    };

    const contactResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: JSON.stringify(simpleContact),
    });

    const contactResult = await contactResponse.text();
    console.log('Contact API Status:', contactResponse.status);
    console.log('Contact API Response:', contactResult);

    // Test 3: List existing contacts
    console.log('\n=== Test 3: List Contacts ===');
    const listResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
    });

    const listResult = await listResponse.text();
    console.log('List API Status:', listResponse.status);
    console.log('List API Response (first 500 chars):', listResult.substring(0, 500));

    return NextResponse.json({
      success: true,
      tests: {
        location: {
          status: locationResponse.status,
          response: locationResult
        },
        contactCreation: {
          status: contactResponse.status,
          response: contactResult
        },
        contactList: {
          status: listResponse.status,
          response: listResult.substring(0, 500)
        }
      },
      credentials: {
        apiKeyPrefix: apiKey.substring(0, 10) + '...',
        locationId: locationId
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}