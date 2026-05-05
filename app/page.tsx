'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, Image, Music, Video, Archive, 
  ArrowRight, Zap, Shield, Clock, Star,
  ChevronRight, LogOut, Crown, BarChart2
} from 'lucide-react'

const FEATURES = [
  { icon: FileText, title: 'Hujjatlar', desc: 'PDF, Word, Excel, PowerPoint va boshqalar', color: '#3b82f6' },
  { icon: Image, title: 'Rasmlar', desc: 'JPG, PNG, WebP, GIF, SVG, HEIC va boshqalar', color: '#ec4899' },
  { icon: Music, title: 'Audio', desc: 'MP3, WAV, FLAC, AAC, OGG va boshqalar', color: '#8b5cf6' },
  { icon: Video, title: 'Video', desc: 'MP4, AVI, MOV, MKV, WebM va boshqalar', color: '#f59e0b' },
  { icon: Archive, title: 'Arxivlar', desc: 'ZIP, RAR, 7Z, TAR va boshqalar', color: '#22c55e' },
]

const STATS = [
  { value: '500+', label: 'Format juftliklari' },
  { value: '100%', label: 'Xavfsiz' },
  { value: '24/7', label: 'Ishlaydi' },
  { value: '< 1 min', label: "O'rtacha vaqt" },
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    loadData()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    if (session?.user) await loadProfile(session.user.id)
    
    // Settings yuklash
    const { data } = await supabase.from('settings').select('*')
    if (data) {
      const s: any = {}
      data.forEach((row: any) => s[row.key] = row.value)
      setSettings(s)
    }
    setLoading(false)
  }

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isPremium = profile?.is_premium && 
    profile?.premium_expires_at && 
    new Date(profile.premium_expires_at) > new Date()

  return (
    <div className="min-h-screen grid-bg relative">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <Zap size={18} color="white" />
          </div>
          <span className="font-display text-xl font-bold text-white">FileConvert<span className="gradient-text">.uz</span></span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 mr-2">
                {isPremium ? (
                  <span className="badge-premium flex items-center gap-1">
                    <Crown size={10} /> Premium
                  </span>
                ) : (
                  <span className="badge-free">Bepul</span>
                )}
                <span className="text-sm text-gray-400">{user.email?.split('@')[0]}</span>
              </div>
              <Link href="/dashboard">
                <button className="btn-glow flex items-center gap-2 text-sm py-2 px-4">
                  <BarChart2 size={15} /> Boshqaruv
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-800 transition-all"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                  Kirish
                </button>
              </Link>
              <Link href="/login">
                <button className="btn-glow text-sm py-2 px-5">
                  Boshlash
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8 text-green-400 text-sm font-medium">
          <Star size={14} fill="currentColor" />
          O'zbekistonning №1 fayl konvertori
          <Star size={14} fill="currentColor" />
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Har qanday faylni<br />
          <span className="gradient-text">istalgan formatga</span>
        </h1>

        <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          PDF → Word, rasm → PDF, audio → MP3 va yana 500+ format. 
          Tez, xavfsiz va ishonchli. Hech qanday o'rnatish shart emas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={user ? '/dashboard' : '/login'}>
            <button className="btn-glow flex items-center gap-3 text-lg px-8 py-4 mx-auto sm:mx-0">
              Hozir boshlash <ArrowRight size={20} />
            </button>
          </Link>
          {!isPremium && (
            <Link href={user ? '/dashboard?tab=premium' : '/login'}>
              <button className="flex items-center gap-2 px-8 py-4 border border-yellow-500/30 text-yellow-400 rounded-xl hover:bg-yellow-500/10 transition-all text-base font-medium mx-auto sm:mx-0">
                <Crown size={18} />
                Premium —{' '}
                {settings.premium_price 
                  ? Number(settings.premium_price).toLocaleString('uz-UZ') + ' so\'m/oy'
                  : "29,900 so'm/oy"
                }
              </button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-display text-3xl font-bold text-center text-white mb-3">
          Qanday fayllarni konvertatsiya qilish mumkin?
        </h2>
        <p className="text-gray-500 text-center mb-12">Barcha mashhur formatlarni qo'llab-quvvatlaymiz</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <div key={i} className="glass-card p-6 group cursor-default">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: feat.color + '20', border: `1px solid ${feat.color}30` }}
              >
                <feat.icon size={22} style={{ color: feat.color }} />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}

          {/* Premium card */}
          <div className="gradient-border p-6 group cursor-default">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-yellow-500/10 border border-yellow-500/20">
              <Crown size={22} className="text-yellow-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Premium Tarif</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Cheksiz konvertatsiya, ustunlik navbat, tez qayta ishlash va boshqalar
            </p>
            <Link href={user ? '/dashboard?tab=premium' : '/login'}>
              <button className="flex items-center gap-1 text-green-400 text-sm font-semibold hover:gap-2 transition-all">
                Batafsil <ChevronRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
        <h2 className="font-display text-3xl font-bold text-white mb-3">Qanday ishlaydi?</h2>
        <p className="text-gray-500 mb-12">3 ta oddiy qadam</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Fayl yuklang', desc: "Istalgan faylni sudrab tashlang yoki tugmani bosib tanlang" },
            { step: '02', title: "Format tanlang", desc: "Kerakli formatni tanlang — 500+ variant mavjud" },
            { step: '03', title: "Yuklab oling", desc: "Konvertatsiya tugagach fayl avtomatik yuklanadi" },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="font-display text-6xl font-bold text-green-500/10 mb-4">{item.step}</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
              {i < 2 && (
                <div className="hidden sm:block absolute top-8 -right-4 text-green-500/30">
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="glass-card p-12">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Boshlashga tayyormisiz?</h2>
          <p className="text-gray-500 mb-8">Har kuni 2 ta bepul konvertatsiya. Premium bilan cheksiz!</p>
          <Link href={user ? '/dashboard' : '/login'}>
            <button className="btn-glow flex items-center gap-3 text-lg px-8 py-4 mx-auto">
              Hozir boshlash <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        <p>© 2024 FileConvert.uz — Barcha huquqlar himoyalangan</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Shield size={12} />
          <span>Fayllaringiz xavfsiz — konvertatsiyadan so'ng o'chiriladi</span>
        </div>
      </footer>
    </div>
  )
}
