import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const [usersRes, paymentsRes, conversionsRes, premiumRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
    supabaseAdmin.from('payments').select('amount, status'),
    supabaseAdmin.from('conversions').select('id', { count: 'exact' }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('is_premium', true),
  ])

  const totalRevenue = paymentsRes.data
    ?.filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0

  const pendingPayments = paymentsRes.data?.filter(p => p.status === 'pending').length || 0

  return NextResponse.json({
    totalUsers: usersRes.count || 0,
    totalConversions: conversionsRes.count || 0,
    totalRevenue,
    premiumUsers: premiumRes.count || 0,
    pendingPayments,
  })
}
