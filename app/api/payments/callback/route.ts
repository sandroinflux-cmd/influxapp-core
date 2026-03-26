import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const text = await request.text()
    const payload = text ? JSON.parse(text) : {}
    
    console.log("💳 BOG Callback Received:", JSON.stringify(payload, null, 2))

    const eventData = payload.body || payload; 

    const bogStatus = eventData.order_status?.key || eventData.status;
    const txId = eventData.external_order_id || eventData.order_id || eventData.shop_order_id

    // 🚀 ვაანალიზებთ Split ობიექტს
    if (eventData.split) {
      console.log(`🔀 Split Status: ${eventData.split.split_status}`);
      if (eventData.split.split_reject_reason) {
        console.error(`⚠️ BOG Split Rejected: ${eventData.split.split_reject_reason}`);
      }
    }

    if (!txId) {
      console.error("❌ Callback Error: Missing transaction ID in payload")
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("🚨 CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in Vercel Environment Variables!")
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    )

    let newStatus = 'pending'
    const normalizedStatus = bogStatus?.toLowerCase() || '';

    if (normalizedStatus === 'completed' || normalizedStatus === 'success' || normalizedStatus === 'approved') {
      newStatus = 'approved'
    } else if (normalizedStatus === 'error' || normalizedStatus === 'rejected' || normalizedStatus === 'failed') {
      newStatus = 'rejected'
    }

    console.log(`🔄 Updating TX: ${txId} to status: '${newStatus}'`)

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

    return NextResponse.json({ message: "Callback processed successfully" }, { status: 200 })

  } catch (error: any) {
    console.error("❌ Critical Webhook Error:", error.message)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}