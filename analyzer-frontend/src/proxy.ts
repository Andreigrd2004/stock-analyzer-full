import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const publicPaths = ['/login', '/register'];



export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;


  const isPublicPath = publicPaths.includes(path);

  const token = request.cookies.get('accessToken')?.value || '';


  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [








    '/((?!api|next-api|_next/static|_next/image|favicon.ico).*)',
  ],
};
