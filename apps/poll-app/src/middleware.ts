import { NextRequest, NextResponse } from 'next/server';
import { getTokenExpirationDate } from './lib/actions/utils';
import { authenticate, refreshToken } from './lib/auth';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const isAuthenticated = await authenticate(request);

    if (isAuthenticated) {
      // Rotate the token
      const newToken = await refreshToken(request);
      const response = NextResponse.next();

      const expires = getTokenExpirationDate(newToken);
      response.cookies.set('token', newToken, {
        expires,
      });

      return response;
    } else {
      throw new Error('User is not authenticated');
    }
  } catch (error) {
    console.error(error);

    const { pathname, searchParams } = new URL(request.url);
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.append(
      'r',
      `${pathname.slice(1)}${searchParams.size > 0 ? '?' + searchParams.toString() : ''}`,
    );

    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.png|$).*)',
  ],
};
