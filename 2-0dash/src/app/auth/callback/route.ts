import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as
    | 'signup'
    | 'email'
    | 'recovery'
    | 'email_change'
    | null
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Surface Supabase errors back to the login page
  if (errorParam) {
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', errorDescription || errorParam)
    return NextResponse.redirect(loginUrl)
  }

  if (code || (token_hash && type)) {
    const cookieStore = await cookies()

    // IMPORTANT: create the redirect response FIRST so we can write
    // the session cookies directly onto it — not onto cookieStore,
    // which is a different object that doesn't get sent to the browser.
    const redirectResponse = NextResponse.redirect(
      new URL(next, requestUrl.origin)
    )

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(
            cookiesToSet: Array<{
              name: string
              value: string
              options?: Record<string, unknown>
            }>
          ) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Write onto the actual response that the browser will receive
              redirectResponse.cookies.set(
                name,
                value,
                options as Parameters<typeof redirectResponse.cookies.set>[2]
              )
            })
          },
        },
      }
    )

    if (code) {
      // PKCE flow — OAuth, magic link, email confirmation (some Supabase configs)
      await supabase.auth.exchangeCodeForSession(code)
    } else if (token_hash && type) {
      // Token-hash flow — email confirmation + password recovery (default Supabase)
      await supabase.auth.verifyOtp({ token_hash, type })
    }

    return redirectResponse
  }

  // No recognised params — send home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
