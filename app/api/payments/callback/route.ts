import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. უფრო უსაფრთხო წაკითხვა (JSON-ის ერორების თავიდან ასარიდებლად)
    const text = await request.text()
    const body = text ? JSON.parse(text) : {}
    
    console.log("💳 BOG Callback Full Body:", JSON.stringify(body, null, 2))

    const bogStatus = body.status 
    const txId = body.external_order_id || body.order_id // pro-tip: ბანკი ზოგჯერ order_id-ს აგზავნის

    if (!txId) {
      console.error("❌ Callback Error: Missing transaction ID in payload")
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 })
    }

    // 2. ვამოწმებთ, საერთოდ გვაქვს თუ არა Service Key Vercel-ში!
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("🚨 CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in Vercel Environment Variables!")
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
    }

    // 🛡️ 3. ვქმნით სუპერ-ადმინის კლიენტს 
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    )

    // 4. ახალი სტატუსის გარკვევა
    let newStatus = 'pending'
    if (bogStatus === 'success' || bogStatus === 'APPROVED' || bogStatus === 'IN_PROGRESS') {
      newStatus = 'approved'
    } else if (bogStatus === 'error' || bogStatus === 'REJECTED' || bogStatus === 'fail' || bogStatus === 'failed') {
      newStatus = 'rejected'
    }

    console.log(`🔄 Attempting to update TX: ${txId} to status: ${newStatus}`)

    // 5. ვანახლებთ სტატუსს Supabase-ში და ვითხოვთ პასუხის დაბრუნებას (.select())
    const { data, error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', txId)
      .select()

    if (updateError) {
      console.error("❌ Supabase Update Error:", updateError.message)
      throw updateError
    }

    if (!data || data.length === 0) {
      console.error("⚠️ Warning: Update ran, but no transaction was found with ID:", txId)
    } else {
      console.log("✅ DB Update Success! Transaction Approved.")
    }

    // 6. ბანკს ვუბრუნებთ 200 OK-ს
    return NextResponse.json({ message: "Callback processed successfully" }, { status: 200 })

  } catch (error: any) {
    console.error("❌ Critical Webhook Error:", error.message)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}