// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Log all cookies for debugging
  console.log('🍪 Middleware - All cookies:', request.cookies.getAll());
  
  const userCookie = request.cookies.get('user');
  
  console.log('👤 Middleware - User cookie found:', userCookie ? 'Yes' : 'No');
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value);
      console.log('✅ Middleware - User parsed:', { id: user.id, username: user.username });
      
      // Clone the request headers and add user ID
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id.toString());
      
      console.log('🔧 Middleware - Set x-user-id header to:', user.id);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (e) {
      console.error('❌ Middleware - Error parsing user cookie:', e);
      return NextResponse.next();
    }
  }
  
  console.log('⚠️ Middleware - No user cookie found');
  return NextResponse.next();
}

// Match all API routes
export const config = {
  matcher: '/api/:path*',
};