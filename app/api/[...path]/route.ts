import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://18.136.102.154';

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join('/');
  
  // Construct the target URL
  const searchParams = request.nextUrl.search;
  const targetUrl = `${API_URL}/api/${pathStr}${searchParams}`;

  // Get request body if method is not GET or HEAD
  let body: any = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text();
    } catch (e) {
      // No body or failed to read body
    }
  }

  // Forward headers, filtering out headers that might trigger CSRF/CORS/WAF blocks
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (
      k !== 'host' &&
      k !== 'content-length' &&
      k !== 'origin' &&
      k !== 'referer' &&
      !k.startsWith('x-forwarded-') &&
      !k.startsWith('x-vercel-')
    ) {
      headers.set(key, value);
    }
  });

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });

    const data = await response.text();
    
    // Return the response with same status and headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-encoding') {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`API Proxy Error for ${targetUrl}:`, error);
    return NextResponse.json(
      { success: false, message: `Proxy error: ${error.message}` },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: any) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: any) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: any) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: any) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: any) {
  return handleProxy(request, context);
}
