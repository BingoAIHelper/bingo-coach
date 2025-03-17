import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'

// Create a separate middleware for handling auth routes (signin/signup)
// This approach avoids conflicts with the withAuth middleware
function authPagesMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Only apply this middleware to auth pages
  if (!path.startsWith('/auth/')) {
    return NextResponse.next()
  }
  
  // Check if the request has a token in the cookie
  // If it does, the user is already authenticated
  const cookies = req.cookies
  const hasSessionToken = cookies.has('next-auth.session-token') || 
                          cookies.has('__Secure-next-auth.session-token')
  
  if (hasSessionToken) {
    // Let the main middleware handle the redirection
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // If no token, allow access to auth pages
  return NextResponse.next()
}

// Main authentication middleware
const authMiddleware = withAuth(
  function middleware(req) {
    // Get the pathname
    const path = req.nextUrl.pathname
    
    // Skip handling for API auth routes to prevent loops
    if (path.startsWith('/api/auth')) {
      console.log('Middleware: Skipping API auth route', path);
      return NextResponse.next();
    }
    
    // Get user from the request
    const user = req.nextauth.token;
    console.log('Middleware: User token', user ? `ID: ${user.id}, Role: ${user.role}` : 'Not authenticated');
    
    // If we're accessing dashboard routes, handle role-based redirection
    if (path === '/dashboard' || path === '/dashboard/') {
      if (user?.role === 'seeker') {
        console.log('Middleware: Redirecting seeker to seeker dashboard');
        return NextResponse.redirect(new URL('/seeker/dashboard', req.url));
      } else if (user?.role === 'coach') {
        console.log('Middleware: Redirecting coach to coach dashboard');
        return NextResponse.redirect(new URL('/coach/dashboard', req.url));
      }
      // If user doesn't have a specific role, leave them at the generic dashboard
      console.log('Middleware: User has no specific role, staying at generic dashboard');
      return NextResponse.next();
    }

    // Role-based access control for protected routes
    if (path.startsWith('/seeker/') && user?.role !== 'seeker') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    if (path.startsWith('/coach/') && user?.role !== 'coach') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // For all other routes, proceed normally
    return NextResponse.next()
  },
  {
    callbacks: {
      // Only apply auth protection to dashboard routes
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // Only require authentication for dashboard routes
        if (path.startsWith('/dashboard') || 
            path.startsWith('/seeker/') || 
            path.startsWith('/coach/') || 
            path.startsWith('/admin/')) {
          return !!token
        }
        // Don't protect other routes
        return true
      },
    },
  }
)

// Combine middlewares
export default function middleware(req: NextRequest) {
  // Apply auth pages middleware first
  const authPagesResponse = authPagesMiddleware(req)
  
  // If the response is a redirect, use that response
  if (authPagesResponse.status !== 200) {
    return authPagesResponse
  }
  
  // Otherwise, apply the main auth middleware
  // @ts-ignore - The middleware expects a specific type but works fine with NextRequest
  return authMiddleware(req)
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Auth pages
    '/auth/signin',
    '/auth/signup',
    // Dashboard pages
    '/dashboard',
    '/dashboard/:path*',
    '/seeker/:path*',
    '/coach/:path*',
    '/admin/:path*',
    // Exclude Next.js static assets and API routes (except auth)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 