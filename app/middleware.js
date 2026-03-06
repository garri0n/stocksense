// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get user from cookie
  const userCookie = request.cookies.get('user');
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      // Clone the request headers and add user ID
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (e) {
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};