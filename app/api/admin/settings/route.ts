import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const { data } = await supabaseAdmin.from('settings').select('*')
  const settings: any = {}
  data?.forEach((r: any) => settings[r.key] = r.value)
  return NextResponse.json(settings)
}

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const updates = await request.json()

  for (const [key, value] of Object.entries(updates)) {
    await supabaseAdmin.from('settings').upsert({ key, value: String(value) })
  }

  return NextResponse.json({ success: true })
}
