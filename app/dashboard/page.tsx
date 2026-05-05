'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import {
  Zap, Upload, Download, LogOut, Crown, History,
  ChevronDown, X, AlertCircle, CheckCircle, Clock,
  CreditCard, Settings, BarChart2, FileText, ArrowRight
} from 'lucide-react'
import { CONVERSION_FORMATS, FORMAT_ICONS, getFormatCategory } from '@/lib/formats'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { format } from 'date-fns'

type Tab = 'convert' | 'history' | 'premium' | 'payment'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'convert'

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [settings, setSettings] = useState<any>({})
  const [tab, setTab] = useState<Tab>(initialTab)
  const [file, setFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState('')
  const [availableFormats, setAvailableFormats] = useState<string[]>([])
  const [converting, setConverting] = useState(false)
  const [convertResult, setConvertResult] = useState<string | null>(null)
  const [conversions, setConversions] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [checkImage, setCheckImage] = useState<File | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (tab === 'history') loadHistory()
    if (tab === 'payment') loadPayments()
  }, [tab])

  async function loadUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setUser(session.user)
    
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    setProfile(prof)

    const { data: sets } = await supabase.from('settings').select('*')
    if (sets) {
      const s: any = {}
      sets.forEach((r: any) => s[r.key] = r.value)
      setSettings(s)
    }
  }

  async function loadHistory() {
    setLoadingHistory(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('conversions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setConversions(data || [])
    setLoadingHistory(false)
  }

  async function loadPayments() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setPayments(data || [])
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    setFile(f)
    setConvertResult(null)
    setTargetFormat('')

    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    const formats = CONVERSION_FORMATS[ext] || []
    setAvailableFormats(formats)
    if (formats.length > 0) setTargetFormat(formats[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const isPremium = profile?.is_premium && 
    profile?.premium_expires_at && 
    new Date(profile.premium_expires_at) > new Date()

  const freeLimit = parseInt(settings.free_daily_limit || '2')
  
  // Reset daily count check
  const canConvert = isPremium || (profile?.daily_conversions_used || 0) < freeLimit

  async function handleConvert() {
    if (!file || !targetFormat) return
    if (!canConvert) {
      toast.error("Kunlik limitingiz tugadi. Premium oling!")
      setTab('premium')
      return
    }

    setConverting(true)
    setConvertResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetFormat', targetFormat)

      const res = await fetch('/api/convert', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Konvertatsiya xatosi')

      setConvertResult(data.downloadUrl)
      toast.success('Konvertatsiya muvaffaqiyatli!')
      
      // Refresh profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
    } catch (err: any) {
      toast.error(err.message || 'Xato yuz berdi')
    } finally {
      setConverting(false)
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!checkImage) { toast.error("Chek rasmini yuklang"); return }
    setSubmitLoading(true)

    try {
      const formData = new FormData()
      formData.append('check', checkImage)
      
      const res = await fetch('/api/payment', { method: 'POST', body: formData })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      toast.success("To'lov yuborildi! Admin tasdiqlashini kuting.")
      setCheckImage(null)
      loadPayments()
      setTab('payment')
    } catch (err: any) {
      toast.error(err.message || 'Xato yuz berdi')
    } finally {
      setSubmitLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const TABS = [
    { id: 'convert', label: 'Konvertatsiya', icon: Zap },
    { id: 'history', label: 'Tarix', icon: History },
    { id: 'premium', label: 'Premium', icon: Crown },
    { id: 'payment', label: "To'lovlarim", icon: CreditCard },
  ] as const

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 z-50" style={{ background: 'rgba(5,8,16,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <Zap size={15} color="white" />
            </div>
            <span className="font-display font-bold text-white hidden sm:block">FileConvert<span className="gradient-text">.uz</span></span>
          </Link>

          <div className="flex items-center gap-3">
            {isPremium ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Crown size={13} className="text-yellow-400" />
                <span className="text-yellow-400 text-xs font-semibold font-display">PREMIUM</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={12} />
                <span>{freeLimit - (profile?.daily_conversions_used || 0)}/{freeLimit} bepul</span>
              </div>
            )}
            <div className="hidden sm:block text-sm text-gray-400">{user?.email?.split('@')[0]}</div>
            <button onClick={handleLogout} className="p-2 rounded-lg border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-900 transition-all">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 mb-8 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold font-display whitespace-nowrap flex-1 justify-center transition-all ${
                tab === id 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Convert Tab */}
        {tab === 'convert' && (
          <div className="space-y-6 page-transition">
            {/* Limit warning */}
            {!isPremium && (profile?.daily_conversions_used || 0) >= freeLimit && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-semibold text-sm">Kunlik limit tugadi</p>
                  <p className="text-gray-500 text-xs mt-0.5">Cheksiz konvertatsiya uchun Premium oling yoki ertaga keling</p>
                </div>
                <button onClick={() => setTab('premium')} className="ml-auto btn-glow text-xs py-2 px-4 flex items-center gap-1">
                  <Crown size={12} /> Premium
                </button>
              </div>
            )}

            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragActive 
                  ? 'border-green-500 bg-green-500/5 dropzone-active' 
                  : 'border-gray-800 hover:border-gray-700 hover:bg-white/[0.02]'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-green-400" />
              </div>
              {isDragActive ? (
                <p className="text-green-400 font-display font-bold text-lg">Faylni qo'yib yuboring!</p>
              ) : (
                <>
                  <p className="text-white font-display font-bold text-lg mb-2">Faylni shu yerga tashlang</p>
                  <p className="text-gray-600 text-sm mb-4">yoki bosib tanlang</p>
                  <span className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:border-gray-600 transition-colors">
                    Fayl tanlash
                  </span>
                  <p className="text-gray-700 text-xs mt-4">Maksimal o'lcham: 100MB</p>
                </>
              )}
            </div>

            {/* File selected */}
            {file && (
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-2xl">
                    {FORMAT_ICONS[file.name.split('.').pop()?.toLowerCase() || ''] || '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{file.name}</p>
                    <p className="text-gray-500 text-sm">{formatBytes(file.size)} • {getFormatCategory(file.name)}</p>
                  </div>
                  <button onClick={() => { setFile(null); setConvertResult(null) }} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <X size={16} />
                  </button>
                </div>

                {availableFormats.length > 0 ? (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Qaysi formatga aylantirish kerak?</label>
                    <div className="flex flex-wrap gap-2">
                      {availableFormats.map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => setTargetFormat(fmt)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold font-display transition-all border ${
                            targetFormat === fmt
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                          }`}
                        >
                          {FORMAT_ICONS[fmt] || '📄'} .{fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle size={14} />
                    Bu fayl formati qo'llab-quvvatlanmaydi
                  </div>
                )}

                {targetFormat && (
                  <div className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl">{FORMAT_ICONS[file.name.split('.').pop()?.toLowerCase() || ''] || '📁'}</div>
                      <div className="text-xs text-gray-500 mt-1">.{file.name.split('.').pop()?.toUpperCase()}</div>
                    </div>
                    <ArrowRight size={20} className="text-green-500 mx-2" />
                    <div className="text-center">
                      <div className="text-2xl">{FORMAT_ICONS[targetFormat] || '📄'}</div>
                      <div className="text-xs text-gray-500 mt-1">.{targetFormat.toUpperCase()}</div>
                    </div>
                    <button
                      onClick={handleConvert}
                      disabled={converting || !canConvert}
                      className="ml-auto btn-glow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {converting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                          </svg>
                          Jarayonda...
                        </>
                      ) : (
                        <><Zap size={16} /> Konvertatsiya</>
                      )}
                    </button>
                  </div>
                )}

                {convertResult && (
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <CheckCircle size={20} className="text-green-400" />
                    <div className="flex-1">
                      <p className="text-green-400 font-semibold">Tayyor!</p>
                      <p className="text-gray-500 text-xs">Yuklab olish uchun bosing</p>
                    </div>
                    <a
                      href={convertResult}
                      download
                      className="btn-glow flex items-center gap-2 text-sm py-2 px-4"
                    >
                      <Download size={15} /> Yuklab olish
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="page-transition">
            <h2 className="font-display text-xl font-bold text-white mb-6">Konvertatsiya tarixi</h2>
            {loadingHistory ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 rounded-xl shimmer" />
                ))}
              </div>
            ) : conversions.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <History size={40} className="mx-auto mb-3 opacity-30" />
                <p>Hali konvertatsiya qilmadingiz</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <table className="w-full admin-table">
                  <thead>
                    <tr>
                      <th className="text-left">Fayl nomi</th>
                      <th className="text-left hidden sm:table-cell">Konvertatsiya</th>
                      <th className="text-left hidden md:table-cell">Vaqt</th>
                      <th className="text-left">Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversions.map(conv => (
                      <tr key={conv.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span>{FORMAT_ICONS[conv.original_format] || '📁'}</span>
                            <span className="truncate max-w-[150px]">{conv.original_filename}</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <span className="text-gray-500">.{conv.original_format?.toUpperCase()}</span>
                          {' → '}
                          <span className="text-green-400">.{conv.target_format?.toUpperCase()}</span>
                        </td>
                        <td className="hidden md:table-cell text-gray-500 text-sm">
                          {format(new Date(conv.created_at), 'dd.MM.yyyy HH:mm')}
                        </td>
                        <td>
                          <span className={`status-badge ${
                            conv.status === 'completed' ? 'status-approved' :
                            conv.status === 'failed' ? 'status-rejected' : 'status-pending'
                          }`}>
                            {conv.status === 'completed' ? '✓ Tayyor' :
                             conv.status === 'failed' ? '✗ Xato' : '⏳ Jarayonda'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Premium Tab */}
        {tab === 'premium' && (
          <div className="page-transition max-w-2xl mx-auto">
            {isPremium ? (
              <div className="glass-card p-8 text-center">
                <Crown size={48} className="text-yellow-400 mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-white mb-2">Premium faol!</h2>
                <p className="text-gray-500 mb-4">
                  Muddati: {format(new Date(profile.premium_expires_at), 'dd MMMM yyyy')}
                </p>
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle size={16} />
                  <span>Cheksiz konvertatsiya</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Premium card */}
                <div className="gradient-border p-8 text-center">
                  <div className="badge-premium inline-flex items-center gap-1 mb-4">
                    <Crown size={12} /> PREMIUM
                  </div>
                  <h2 className="font-display text-3xl font-bold text-white mb-2">
                    {settings.premium_price 
                      ? Number(settings.premium_price).toLocaleString('uz-UZ') 
                      : '29,900'
                    } so'm
                  </h2>
                  <p className="text-gray-500 mb-8">oyiga</p>

                  <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
                    {[
                      '✓ Cheksiz konvertatsiya',
                      '✓ Tezlashtirilgan qayta ishlash',
                      '✓ 100MB gacha fayllar',
                      "✓ Ustunlik navbat",
                      '✓ Barcha formatlar',
                      '✓ 30 kunlik abonement',
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">{f}</div>
                    ))}
                  </div>

                  <button onClick={() => setTab('payment')} className="btn-glow flex items-center gap-2 mx-auto text-base px-8 py-4">
                    <CreditCard size={18} /> Obuna bo'lish
                  </button>
                </div>

                {/* Vs free */}
                <div className="glass-card p-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="badge-free mb-3">BEPUL</div>
                      <div className="space-y-2 text-sm text-gray-500">
                        <p>Kuniga {freeLimit} ta konvertatsiya</p>
                        <p>Standart tezlik</p>
                        <p>Barcha formatlar</p>
                      </div>
                    </div>
                    <div className="border-l border-gray-800 pl-4">
                      <div className="badge-premium mb-3">PREMIUM</div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>Cheksiz konvertatsiya</p>
                        <p>Yuqori tezlik</p>
                        <p>Barcha formatlar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {tab === 'payment' && (
          <div className="page-transition space-y-6">
            {/* Payment form */}
            {!isPremium && (
              <div className="glass-card p-6 max-w-xl">
                <h2 className="font-display text-xl font-bold text-white mb-1">Premium uchun to'lash</h2>
                <p className="text-gray-500 text-sm mb-6">Quyidagi karta raqamiga o'tkazing va chekni yuboring</p>

                {/* Card info */}
                <div className="p-5 bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-800/30 rounded-xl mb-6">
                  <div className="text-xs text-gray-500 mb-1">Karta raqami</div>
                  <div className="font-mono text-xl font-bold text-white tracking-widest mb-3">
                    {settings.payment_card_number || '8600 1234 5678 9012'}
                  </div>
                  <div className="text-sm text-gray-400">{settings.payment_card_holder || 'Karimov Kamron'}</div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-yellow-400 font-bold">
                      {settings.premium_price 
                        ? Number(settings.premium_price).toLocaleString('uz-UZ') 
                        : '29,900'
                      } so'm
                    </span>
                    <span className="text-gray-600 text-sm"> o'tkazing</span>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">To'lov cheki (skrinshotni yuklang) *</label>
                    <div
                      onClick={() => document.getElementById('check-input')?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        checkImage 
                          ? 'border-green-600 bg-green-500/5' 
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <input
                        id="check-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => setCheckImage(e.target.files?.[0] || null)}
                      />
                      {checkImage ? (
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <CheckCircle size={18} />
                          <span className="text-sm">{checkImage.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} className="text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">Chek rasmini yuklang</p>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitLoading || !checkImage}
                    className="btn-glow w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitLoading ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                      </svg>
                    ) : <><CreditCard size={16} /> To'lovni yuborish</>}
                  </button>
                </form>
              </div>
            )}

            {/* Payment history */}
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-4">To'lovlar tarixi</h3>
              {payments.length === 0 ? (
                <div className="text-center py-12 text-gray-600 glass-card">
                  <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
                  <p>Hali to'lov qilmadingiz</p>
                </div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <table className="w-full admin-table">
                    <thead>
                      <tr>
                        <th className="text-left">Sana</th>
                        <th className="text-left">Miqdor</th>
                        <th className="text-left">Holat</th>
                        <th className="text-left hidden sm:table-cell">Izoh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td className="text-gray-500 text-sm">{format(new Date(p.created_at), 'dd.MM.yyyy')}</td>
                          <td className="font-semibold">{Number(p.amount).toLocaleString()} so'm</td>
                          <td>
                            <span className={`status-badge ${
                              p.status === 'approved' ? 'status-approved' :
                              p.status === 'rejected' ? 'status-rejected' : 'status-pending'
                            }`}>
                              {p.status === 'approved' ? '✓ Tasdiqlandi' :
                               p.status === 'rejected' ? '✗ Rad etildi' : '⏳ Kutilmoqda'}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell text-gray-500 text-sm">{p.admin_note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-primary)'}}>
      <div className="text-gray-500">Yuklanmoqda...</div>
    </div>}>
      <DashboardContent />
    </Suspense>
  )
}
