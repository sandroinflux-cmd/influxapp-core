import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // 💡 Next.js 15/16-ში cookies() აბრუნებს Promise-ს, ამიტომ გვჭირდება await
    const cookieStore = await cookies()
    
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    
    // ვცვლით ავტორიზაციის კოდს სესიაზე (Session)
    await supabase.auth.exchangeCodeForSession(code)
  }

  // პროცესის დასრულების შემდეგ იუზერი გადადის მთავარ გვერდზე
  // Supabase Middleware ავტომატურად გადაამისამართებს სწორ დეშბორდზე როლის მიხედვით
  return NextResponse.redirect(requestUrl.origin)
}