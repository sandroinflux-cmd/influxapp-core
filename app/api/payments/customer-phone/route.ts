import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

function normalizePhone(input: string): { ok: true; phone: string } | { ok: false; error: string } {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter a phone number to link this order.' }
  }

  const compact = trimmed.replace(/[\s()-]/g, '')
  if (!/^\+?\d+$/.test(compact)) {
    return { ok: false, error: 'Use a valid phone number, like +995 5XX XX XX XX.' }
  }

  const digits = compact.replace(/^\+/, '')
  const local = digits.startsWith('995') ? digits.slice(3) : digits
  const georgianMobile = local.length === 9 && local.startsWith('5') && (digits.length === 9 || digits.startsWith('995'))

  if (georgianMobile) {
    return {
      ok: true,
      phone: `+995 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`,
    }
  }

  if (digits.length >= 9 && digits.length <= 15) {
    return { ok: true, phone: `+${digits}` }
  }

  return { ok: false, error: 'Enter a Georgian mobile or a valid 9–15 digit phone number.' }
}

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const body = await request.json().catch(() => null)
    const transactionId = typeof body?.transactionId === 'string' ? body.transactionId.trim() : ''
    const phoneInput = typeof body?.phone === 'string' ? body.phone : ''
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction id is required.' }, { status: 400 })
    }

    const normalized = normalizePhone(phoneInput)
    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: 400 })
    }

    const supabase = adminClient()
    const { data, error } = await supabase
      .from('transactions')
      .update({ customer_phone: normalized.phone })
      .eq('id', transactionId)
      .select('id, customer_phone')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, customer_phone: data.customer_phone })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not link this phone number.' }, { status: 500 })
  }
}
