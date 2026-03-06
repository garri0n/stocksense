// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Log all cookies for debugging
  console.log('🍪 All cookies:', request.cookies.getAll());
  
  const userCookie = request.cookies.get('user');
  
  console.log('👤 User cookie:', userCookie ? 'Found' : 'Not found');
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      console.log('✅ User parsed:', { id: user.id, username: user.username });
      
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