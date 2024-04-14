import { NextRequest, NextResponse } from 'next/server';
import { authenticate, refreshToken } from './lib/auth';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const isAuthenticated = await authenticate(request);

    if (isAuthenticated) {
      // Rotate the token
      const newToken = await refreshToken(request);
      const response = NextResponse.next();
      response.cookies.set('token', newToken);

      return response;
    } else {
      throw new Error('User is not authenticated');
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/home',
};
