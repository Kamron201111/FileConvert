import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )
    
    const { data: { session } } = await supabaseServer.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Tizimga kiring' }, { status: 401 })

    const formData = await request.formData()
    const checkFile = formData.get('check') as File

    if (!checkFile) {
      return NextResponse.json({ error: 'Chek rasmi kerak' }, { status: 400 })
    }

    // Get settings
    const { data: settings } = await supabaseAdmin.from('settings').select('*')
    const s: any = {}
    settings?.forEach((r: any) => s[r.key] = r.value)
    const amount = parseFloat(s.premium_price || '29900')

    // Upload check image to Supabase Storage
    const bytes = await checkFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `checks/${session.user.id}_${Date.now()}.${checkFile.name.split('.').pop()}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('payments')
      .upload(fileName, buffer, { contentType: checkFile.type })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Continue without image URL
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('payments')
      .getPublicUrl(fileName)

    // Create payment record
    await supabaseAdmin.from('payments').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      amount,
      currency: 'UZS',
      check_image_url: urlData?.publicUrl || null,
      status: 'pending',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: error.message || 'Xato' }, { status: 500 })
  }
}
