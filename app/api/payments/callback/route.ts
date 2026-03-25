import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. ვიჭერთ ბანკის გამოგზავნილ ინფორმაციას
    const body = await request.json()
    console.log("BOG Callback Received:", body) // ეს Vercel-ის ლოგებში გამოჩნდება

    // BOG სტანდარტულად გვიბრუნებს სტატუსს და ჩვენსავე გაგზავნილ external_order_id-ს
    const bogStatus = body.status 
    const txId = body.external_order_id

    if (!txId) {
      console.error("Callback Invalid: Missing transaction ID")
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 })
    }

    // 🛡️ 2. ვქმნით სუპერ-ადმინის კლიენტს ბაზის გასაახლებლად
    // აუცილებელია SERVICE_ROLE_KEY, რადგან Webhook-ს არ აქვს User Session
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    )

    // 3. განვსაზღვროთ ტრანზაქციის ახალი სტატუსი
    let newStatus = 'pending'
    if (bogStatus === 'success' || bogStatus === 'APPROVED') {
      newStatus = 'approved'
    } else if (bogStatus === 'error' || bogStatus === 'REJECTED' || bogStatus === 'failed') {
      newStatus = 'rejected'
    }

    // 4. ვანახლებთ სტატუსს Supabase-ში
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', txId)

    if (updateError) {
      console.error("Supabase Update Error in Callback:", updateError.message)
      throw updateError
    }

    // 5. ბანკს ვუბრუნებთ 200 OK-ს, რომ სიგნალი მივიღეთ
    return NextResponse.json({ message: "Callback processed successfully" }, { status: 200 })

  } catch (error: any) {
    console.error("Critical BOG Callback Error:", error.message)
    // 500 სტატუსს ვაბრუნებთ, რომ ბანკმა იცოდეს ჩვენთან რაღაც აირია
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}