import { createBrowserClient } from '@supabase/ssr'

// 🔐 გარემოს ცვლადების წამოღება .env ფაილიდან
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🚀 ბრაუზერის კლიენტის შექმნა, რომელიც ავტომატურად მართავს Cookies-ებს
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)