import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Public routes
  const publicRoutes = ['/login', '/api/auth']
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r))

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
