import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const cookieStore = cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )
    
    const { data: { session } } = await supabaseServer.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Tizimga kiring' }, { status: 401 })

    const userId = session.user.id

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profil topilmadi' }, { status: 404 })

    // Get settings
    const { data: settings } = await supabaseAdmin.from('settings').select('*')
    const s: any = {}
    settings?.forEach((r: any) => s[r.key] = r.value)
    const freeLimit = parseInt(s.free_daily_limit || '2')

    const isPremium = profile.is_premium && 
      profile.premium_expires_at && 
      new Date(profile.premium_expires_at) > new Date()

    // Check daily limit
    const today = new Date().toISOString().split('T')[0]
    const lastDate = profile.last_conversion_date

    let dailyUsed = profile.daily_conversions_used || 0
    if (lastDate !== today) dailyUsed = 0

    if (!isPremium && dailyUsed >= freeLimit) {
      return NextResponse.json({ error: 'Kunlik limit tugadi. Premium oling!' }, { status: 429 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const targetFormat = formData.get('targetFormat') as string

    if (!file || !targetFormat) {
      return NextResponse.json({ error: "Fayl va format kerak" }, { status: 400 })
    }

    const originalExt = file.name.split('.').pop()?.toLowerCase() || ''
    const filename = file.name.replace(/\.[^.]+$/, '')

    // Log conversion start
    const { data: conv } = await supabaseAdmin.from('conversions').insert({
      user_id: userId,
      user_email: session.user.email,
      original_filename: file.name,
      original_format: originalExt,
      target_format: targetFormat,
      file_size: file.size,
      status: 'processing',
    }).select().single()

    // CloudConvert API
    const CLOUDCONVERT_KEY = process.env.CLOUDCONVERT_API_KEY
    if (!CLOUDCONVERT_KEY) {
      return NextResponse.json({ error: 'CloudConvert API kaliti sozlanmagan' }, { status: 500 })
    }

    // 1. Create job
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDCONVERT_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'upload-file': {
            operation: 'import/upload',
          },
          'convert-file': {
            operation: 'convert',
            input: 'upload-file',
            output_format: targetFormat,
          },
          'export-file': {
            operation: 'export/url',
            input: 'convert-file',
          }
        }
      })
    })

    const job = await jobRes.json()
    if (!jobRes.ok) throw new Error(job.message || 'CloudConvert xatosi')

    // 2. Upload file
    const uploadTask = job.data.tasks.find((t: any) => t.name === 'upload-file')
    const uploadUrl = uploadTask.result.form.url
    const uploadParams = uploadTask.result.form.parameters

    const uploadFormData = new FormData()
    Object.entries(uploadParams).forEach(([key, val]) => {
      uploadFormData.append(key, val as string)
    })
    uploadFormData.append('file', file)

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: uploadFormData,
    })
    if (!uploadRes.ok) throw new Error('Fayl yuklashda xato')

    // 3. Wait for job to complete
    let downloadUrl = ''
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise(r => setTimeout(r, 2000))
      
      const statusRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${job.data.id}`, {
        headers: { 'Authorization': `Bearer ${CLOUDCONVERT_KEY}` }
      })
      const statusData = await statusRes.json()
      
      if (statusData.data.status === 'finished') {
        const exportTask = statusData.data.tasks.find((t: any) => t.name === 'export-file')
        downloadUrl = exportTask?.result?.files?.[0]?.url || ''
        break
      } else if (statusData.data.status === 'error') {
        throw new Error('Konvertatsiya jarayonida xato')
      }
    }

    if (!downloadUrl) throw new Error('Konvertatsiya vaqti tugadi')

    // Update conversion record
    await supabaseAdmin.from('conversions').update({
      status: 'completed',
      download_url: downloadUrl,
    }).eq('id', conv.id)

    // Update daily usage
    await supabaseAdmin.from('profiles').update({
      daily_conversions_used: dailyUsed + 1,
      last_conversion_date: today,
    }).eq('id', userId)

    return NextResponse.json({ downloadUrl, success: true })

  } catch (error: any) {
    console.error('Convert error:', error)
    return NextResponse.json({ error: error.message || 'Xato yuz berdi' }, { status: 500 })
  }
}
