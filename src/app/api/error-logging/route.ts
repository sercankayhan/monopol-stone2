import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();
    
    // Log the error data with structured formatting
    console.error('[Error Log]', {
      timestamp: new Date().toISOString(),
      type: 'client_error',
      ...errorData,
    });

    // Here you would typically:
    // 1. Send to error monitoring service (Sentry, Bugsnag, etc.)
    // 2. Store in database for analysis
    // 3. Send alerts for critical errors
    // 4. Generate error reports

    // Example: Store critical errors in database
    if (errorData.data?.retryCount > 2) {
      console.error('[Critical Error] Multiple retry failures:', errorData);
      // sendSlackAlert(errorData);
      // saveToCriticalErrorsDB(errorData);
    }

    // Example: Rate limiting for error spam
    const clientId = errorData.data?.sessionId || 'unknown';
    // if (await isErrorRateLimited(clientId)) {
    //   return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    // }

    return NextResponse.json({ 
      success: true,
      received: true,
      message: 'Error logged successfully'
    });
  } catch (error) {
    console.error('Error logging API failed:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Endpoint for checking error logging service health
  return NextResponse.json({
    service: 'error-logging',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
}