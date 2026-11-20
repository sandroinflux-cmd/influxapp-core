import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const FALLBACK_NEXT = '/dashboard'

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return FALLBACK_NEXT
  if (next.includes('\\') || next.includes('://')) return FALLBACK_NEXT
  if (/[a-zA-Z][a-zA-Z\d+\-.]*:/.test(next)) return FALLBACK_NEXT

  try {
    const base = new URL('https://influx.invalid')
    const resolved = new URL(next, base)
    if (resolved.origin !== base.origin) return FALLBACK_NEXT
    return `${resolved.pathname}${resolved.search}${resolved.hash}`
  } catch {
    return FALLBACK_NEXT
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // საით უნდა გავუშვათ იუზერი ლოგინის მერე. არასწორი next ბრუნდება დეშბორდზე.
  const requestedNext = searchParams.get('next')
  const next = requestedNext == null ? '/' : safeNextPath(requestedNext)

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server Component-ში კუკების სეტვა ხანდახან იგნორირდება, რაც ნორმალურია
            }
          },
        },
      }
    )

    // 🔐 აქ ხდება მთავარი ჯადოქრობა: მეილის კოდი იცვლება აქტიურ სესიაში!
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ✅ სესია შეიქმნა, ვაგდებთ დანიშნულების ადგილას (Settings-ში)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // ❌ თუ კოდი ვადაგასულია ან შეცდომაა, ვაბრუნებთ მთავარზე
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}