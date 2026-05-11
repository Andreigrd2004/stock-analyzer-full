import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add the paths that don't require authentication
const publicPaths = ['/login', '/register'];

// Next.js 16 (Turbopack) uses "proxy.ts" instead of "middleware.ts".
// The exported function must be named "proxy" and the config export is also required.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // We check if the requested path is a public path
  const isPublicPath = publicPaths.includes(path);

  const token = request.cookies.get('accessToken')?.value || '';

  // If the path is not public and there is no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the path is public and there is a token, redirect to home page
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - next-api (Next.js internal API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|next-api|_next/static|_next/image|favicon.ico).*)',
  ],
};
