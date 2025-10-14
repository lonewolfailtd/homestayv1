import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json();
    
    // Log the webhook data for debugging
    console.log('GoHighLevel webhook received:', {
      type: webhookData.type,
      locationId: webhookData.locationId,
      id: webhookData.id,
      email: webhookData.email,
    });

    // Handle different webhook types
    switch (webhookData.type) {
      case 'ContactCreate':
        console.log('New contact created:', webhookData.email);
        break;
        
      case 'ContactUpdate':
        console.log('Contact updated:', webhookData.email);
        break;
        
      case 'ContactDelete':
        console.log('Contact deleted:', webhookData.email);
        break;
        
      default:
        console.log('Unknown webhook type:', webhookData.type);
    }

    // Respond to GoHighLevel that we received the webhook
    return NextResponse.json({ success: true, received: true });

  } catch (error) {
    console.error('Error processing GoHighLevel webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}