import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('drp_token')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname === '/signin'

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images).*)'],
}