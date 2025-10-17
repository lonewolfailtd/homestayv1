import { NextRequest, NextResponse } from 'next/server';
import { createGHLCustomFields, getGHLCustomFields } from '@/lib/gohighlevel';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up GoHighLevel custom fields...');
    
    // First, check existing fields
    const existingFields = await getGHLCustomFields();
    console.log('Existing fields:', existingFields);
    
    // Create new custom fields
    const result = await createGHLCustomFields();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Custom fields setup completed',
        existingFields,
        results: result.results,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error setting up GoHighLevel fields:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching existing GoHighLevel custom fields...');
    
    const existingFields = await getGHLCustomFields();
    
    return NextResponse.json({
      success: true,
      fields: existingFields,
    });
  } catch (error) {
    console.error('Error fetching GoHighLevel fields:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}