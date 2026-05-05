import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const { userId, isPremium, premiumDays } = await request.json()

  const update: any = { is_premium: isPremium }
  
  if (isPremium && premiumDays) {
    const expires = new Date()
    expires.setDate(expires.getDate() + premiumDays)
    update.premium_expires_at = expires.toISOString()
  } else if (!isPremium) {
    update.premium_expires_at = null
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(update)
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
