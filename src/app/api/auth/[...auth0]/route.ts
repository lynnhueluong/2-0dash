import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = handleAuth({
  login: handleLogin({
    returnTo: '/',
    authorizationParams: {
      prompt: 'login',
      response_type: 'code',
      scope: 'openid profile email',
    }
  })
});

export async function GET(
  request: NextRequest,
  context: { params: { auth0: string[] } }
): Promise<NextResponse> {
  try {
    console.log('Auth callback request:', {
      url: request.url,
      path: request.nextUrl?.pathname,
      params: context.params.auth0
    });
    return await handler(request, context);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Auth error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Unknown auth error:', error);
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { auth0: string[] } }
): Promise<NextResponse> {
  try {
    return await handler(request, context);
  } catch (error) {
    if (error instanceof Error) {
      console.error('POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Unknown POST error:', error);
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function OPTIONS(
  request: NextRequest
): Promise<NextResponse> {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*' ,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'authorization,content-type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
