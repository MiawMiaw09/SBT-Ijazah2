import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect rute admin
  if (pathname.startsWith('/admin')) {
    // Cek cookie adminWallet
    const adminWallet = request.cookies.get('adminWallet')?.value
    
    // Jika tidak ada cookie, redirect ke login
    if (!adminWallet) {
      const loginUrl = new URL('/login-admin', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Jika sudah login, redirect dari login-admin ke dashboard
  if (pathname === '/login-admin') {
    const adminWallet = request.cookies.get('adminWallet')?.value
    
    if (adminWallet) {
      const dashboardUrl = new URL('/admin', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - gambar (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|gambar).*)',
  ],
}
