import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      amount,            // 100.00 (bill_amount)
      finalAmount,       // 85.00  (final_amount)
      brandId, 
      influencerId, 
      dealId,
      discountPercent,
      commissionPercent,
      brandEarned,
      influencerEarned
    } = body

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )

    // 🚀 ნაბიჯი 1: IBAN-ების ამოღება პროფილებიდან (ბანკის Split-ისთვის აუცილებელია)
    const { data: brandProf } = await supabase.from('profiles').select('iban').eq('id', brandId).single()
    const { data: influProf } = await supabase.from('profiles').select('iban').eq('id', influencerId).single()

    // 🛡️ ნაბიჯი 2: ტრანზაქციის შექმნა ზუსტად თქვენი SQL სვეტების მიხედვით
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert([{
        bill_amount: amount,          // 100
        final_amount: finalAmount,    // 85
        amount: amount,               // 100 (თქვენი SQL სქემის შესაბამისად)
        brand_id: brandId,
        influencer_id: influencerId,
        deal_id: dealId,
        discount_percent: discountPercent,
        commission_percent: commissionPercent,
        brand_earned: brandEarned,    // 70
        influencer_earned: influencerEarned, // 15
        brand_iban: brandProf?.iban || '',
        influencer_iban: influProf?.iban || '',
        status: 'pending',            // ⏳ ბანკის დასტურამდე ტრანზაქცია პენდინგია
        system_fee: 0
      }])
      .select()
      .single()

    if (txError) throw txError

    // 🏦 ხვალ აქ ჩაჯდება ბანკის რეალური Checkout ლინკი.
    // ამ ეტაპზე გადავდივართ ჩვენსავე წარმატების გვერდზე:
    const bankCheckoutUrl = `/payment/success?txid=${tx.id}` 

    return NextResponse.json({ checkoutUrl: bankCheckoutUrl })

  } catch (error: any) {
    console.error("API Payment Initiation Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}