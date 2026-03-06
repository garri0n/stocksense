// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get user from cookie
  const userCookie = request.cookies.get('user');
  
  console.log('🔍 Middleware checking cookies:', userCookie ? 'User cookie found' : 'No user cookie');
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      console.log('👤 User found in cookie:', user.username, 'ID:', user.id);
      
      // Clone the request headers and add user ID
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id.toString());
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (e) {
      console.error('❌ Error parsing user cookie:', e);
      return NextResponse.next();
    }
  }
  
  console.log('⚠️ No user cookie found');
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};