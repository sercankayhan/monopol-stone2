import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the analytics data
    console.log('[Analytics]', {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // Here you would typically send data to your analytics service
    // Examples:
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - Custom analytics database
    
    // For now, we'll just log and store basic metrics
    if (data.type === 'performance') {
      // Store performance metrics
      console.log(`[Performance] ${data.metric}: ${data.value}${data.unit || ''}`);
    } else if (data.type === 'error') {
      // Store error data
      console.error(`[Error] ${data.data.message}`, data.data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Analytics endpoint is running',
    timestamp: new Date().toISOString(),
  });
}