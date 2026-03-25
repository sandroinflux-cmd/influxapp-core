import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// 🔐 1. ფუნქცია: BOG Token-ის გენერაცია
async function getBogToken() {
  const clientId = process.env.BOG_CLIENT_ID
  const secretKey = process.env.BOG_SECRET_KEY
  
  if (!clientId || !secretKey) {
    throw new Error('BOG Credentials are missing in environment variables')
  }

  const authString = Buffer.from(`${clientId}:${secretKey}`).toString('base64')

  const response = await fetch('https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error('BOG Token Fetch Error:', errorData)
    throw new Error('Failed to authenticate with BOG')
  }
  
  const data = await response.json()
  return data.access_token
}

// 📦 2. ფუნქცია: BOG Order-ის (შეკვეთის) შექმნა
async function createBogOrder(token: string, txId: string, amount: number) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // 🚨 BOG ითხოვს, რომ თანხა იყოს სუფთა რიცხვი (Number)
  const finalPayable = Number(amount.toFixed(2));

  const response = await fetch('https://api.bog.ge/payments/v1/ecommerce/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept-Language': 'ka',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      callback_url: `${siteUrl}/api/payments/callback`, 
      external_order_id: txId, 
      // 🚨 BOG მკაცრი მოთხოვნა: Object ფორმატი და სავალდებულო კალათა (basket)
      purchase_units: {
        currency: 'GEL',
        total_amount: finalPayable,
        basket: [
          {
            product_id: "INFLUX-QR",
            description: "INFLUX Partner Payment",
            quantity: 1,
            unit_price: finalPayable
          }
        ]
      },
      redirect_urls: {
        success: `${siteUrl}/payment/success?txid=${txId}`, 
        fail: `${siteUrl}/payment/fail?txid=${txId}`
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("BOG Order Creation Error Details:", JSON.stringify(errorData, null, 2))
    throw new Error(`BOG Rejected: ${errorData?.error_message || errorData?.message || 'Check Vercel Logs'}`)
  }

  return await response.json()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      amount, 
      finalAmount, 
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

    // 🚀 ამოგვაქვს IBAN-ები
    const { data: brandProf } = await supabase.from('profiles').select('iban').eq('id', brandId).single()
    const { data: influProf } = await supabase.from('profiles').select('iban').eq('id', influencerId).single()

    // 🛡️ ვქმნით ტრანზაქციას ჩვენს ბაზაში (Pending)
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert([{
        bill_amount: amount,
        final_amount: finalAmount,
        amount: amount, // 🎯 გასწორდა: აქ ვინახავთ ორიგინალ თანხას (Bill Amount) ტრიგერის ერორის ასარიდებლად!
        brand_id: brandId,
        influencer_id: influencerId,
        deal_id: dealId,
        discount_percent: discountPercent,
        commission_percent: commissionPercent,
        brand_earned: brandEarned,
        influencer_earned: influencerEarned,
        brand_iban: brandProf?.iban || '',
        influencer_iban: influProf?.iban || '',
        status: 'pending',
        system_fee: 0
      }])
      .select()
      .single()

    if (txError) throw txError

    // 🏦 ბანკის API-სთან დაკავშირება
    const bogToken = await getBogToken()
    // 🎯 ყურადღება: ბანკს ვუგზავნით finalAmount-ს, ამიტომ ბანკი ისევ 0.80 ლარს ჩამოჭრის!
    const bogOrder = await createBogOrder(bogToken, tx.id, finalAmount)

    // ვპოულობთ სარეკირექტო ლინკს ბანკის პასუხიდან
    const bankCheckoutUrl = bogOrder._links.redirect.href

    return NextResponse.json({ checkoutUrl: bankCheckoutUrl })

  } catch (error: any) {
    console.error("API Payment Initiation Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}