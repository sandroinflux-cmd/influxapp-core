import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 🔓 1. გამონაკლისი: /wallet და /claim გვერდებზე ყველას ვუშვებთ უპირობოდ
  if (pathname.startsWith('/wallet') || pathname.startsWith('/claim')) {
    return response
  }

  // 🛡️ 2. თუ დალოგინებული არაა და შედის დეშბორდზე -> გაუშვი Signup-ზე
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signup', request.url))
  }

  // 🔄 3. თუ დალოგინებულია, გადავანაწილოთ როლების მიხედვით
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // თუ დალოგინებული პირი შედის Signup-ზე, გაუშვი მისთვის განკუთვნილ დეშბორდზე
    if (pathname === '/signup') {
      const targetPath = role === 'brand' ? '/dashboard/brand' : '/dashboard/influencer'
      return NextResponse.redirect(new URL(targetPath, request.url))
    }

    // RBAC: როლებზე დაფუძნებული წვდომა დეშბორდებზე
    if (role === 'influencer' && pathname.startsWith('/dashboard/brand')) {
      return NextResponse.redirect(new URL('/dashboard/influencer', request.url))
    }
    
    if (role === 'brand' && pathname.startsWith('/dashboard/influencer')) {
      return NextResponse.redirect(new URL('/dashboard/brand', request.url))
    }
  }

  return response
}

export const config = {
  //Matcher-ში დავტოვოთ მხოლოდ ის გვერდები, რომლებსაც კონტროლი სჭირდება
  matcher: ['/dashboard/:path*', '/signup'],
}