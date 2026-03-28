import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // საით უნდა გავუშვათ იუზერი ლოგინის მერე
  const next = searchParams.get('next') ?? '/'

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