import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('drp_token')?.value
  const { pathname } = request.nextUrl

  // Pages qui ne nécessitent pas d'authentification
  if (pathname === '/signin') {
    return NextResponse.next()
  }

  // Si pas de token, rediriger vers signin
  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
}