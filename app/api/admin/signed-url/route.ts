import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const { path } = await request.json()
  if (!path) return NextResponse.json({ error: 'Path kerak' }, { status: 400 })

  // Extract just the filename from full URL if needed
  let filePath = path
  if (path.includes('/storage/v1/object/')) {
    const parts = path.split('/payments/')
    filePath = parts[1] || path
  }

  const { data, error } = await supabaseAdmin.storage
    .from('payments')
    .createSignedUrl(filePath, 3600) // 1 soatlik havola

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: data.signedUrl })
}
