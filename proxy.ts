import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const session = await auth()
  
  const { pathname } = request.nextUrl
  
  // Public routes
  const isPublicRoute = pathname.startsWith('/auth') || pathname === '/'
  
  // Protected routes that require authentication
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  
  // Admin-only routes
  if (pathname.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
