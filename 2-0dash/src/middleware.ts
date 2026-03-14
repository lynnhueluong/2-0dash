import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/define',
  '/opportunity',
  '/narrative',
  '/profile',
  '/resources',
]
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  // Start with a pass-through response so Supabase can attach/refresh cookies
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{
            name: string
            value: string
            options?: Record<string, unknown>
          }>
        ) {
          // Write onto the request (so later server code sees refreshed tokens)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Rebuild supabaseResponse so it carries the refreshed tokens
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2]
            )
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser(), never getSession() — getUser() re-validates
  // the token server-side and cannot be spoofed via a tampered cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  // Helper: build a redirect that carries any refreshed session cookies so
  // the browser keeps its session alive even while being redirected.
  function redirectWithCookies(url: URL) {
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => {
      res.cookies.set(c.name, c.value, c)
    })
    return res
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return redirectWithCookies(url)
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return redirectWithCookies(url)
  }

  // Pass through — supabaseResponse carries any refreshed tokens
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
