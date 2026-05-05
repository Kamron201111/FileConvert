import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabaseAdmin
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const { paymentId, status, adminNote } = await request.json()

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Noto\'g\'ri holat' }, { status: 400 })
  }

  // Get payment
  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (!payment) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })

  // Update payment
  await supabaseAdmin
    .from('payments')
    .update({ status, admin_note: adminNote || null })
    .eq('id', paymentId)

  // If approved — activate premium
  if (status === 'approved') {
    const { data: settings } = await supabaseAdmin.from('settings').select('*')
    const s: any = {}
    settings?.forEach((r: any) => s[r.key] = r.value)
    const days = parseInt(s.premium_duration_days || '30')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    await supabaseAdmin.from('profiles').update({
      is_premium: true,
      premium_expires_at: expiresAt.toISOString(),
    }).eq('id', payment.user_id)
  }

  // If rejected — deactivate
  if (status === 'rejected') {
    // Don't remove existing premium, just notify
  }

  return NextResponse.json({ success: true })
}
