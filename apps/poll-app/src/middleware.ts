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
    const redirectSearchParams = new URLSearchParams({
      redirect: `${pathname}?${searchParams.toString()}`,
    });
    return NextResponse.redirect(
      new URL(`/login?${redirectSearchParams.toString()}`, request.url),
    );
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.png$).*)',
  ],
};
