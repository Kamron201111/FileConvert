'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, Users, CreditCard, BarChart2, Settings,
  LogOut, CheckCircle, XCircle, Eye, Crown,
  TrendingUp, FileText, Clock, RefreshCw, Save
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

type AdminTab = 'dashboard' | 'payments' | 'users' | 'settings'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [stats, setStats] = useState<any>({})
  const [payments, setPayments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (tab === 'dashboard') loadStats()
    if (tab === 'payments') loadPayments()
    if (tab === 'users') loadUsers()
    if (tab === 'settings') loadSettings()
  }, [tab, paymentFilter])

  async function checkAuth() {
    const res = await fetch('/api/admin/stats')
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    setStats(data)
    setLoading(false)
  }

  async function loadStats() {
    const res = await fetch('/api/admin/stats')
    if (res.ok) setStats(await res.json())
  }

  async function loadPayments() {
    const res = await fetch(`/api/admin/payments?status=${paymentFilter}`)
    if (res.ok) setPayments(await res.json())
  }

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
  }

  async function loadSettings() {
    const res = await fetch('/api/admin/settings')
    if (res.ok) setSettings(await res.json())
  }

  async function handlePaymentAction(paymentId: string, status: 'approved' | 'rejected') {
    setProcessingId(paymentId)
    const res = await fetch('/api/admin/payments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, status, adminNote }),
    })

    if (res.ok) {
      toast.success(status === 'approved' ? '✓ Tasdiqlandi! Premium faollashtirildi' : '✗ Rad etildi')
      setAdminNote('')
      setSelectedCheck(null)
      loadPayments()
      loadStats()
    } else {
      toast.error('Xato yuz berdi')
    }
    setProcessingId(null)
  }

  async function handleTogglePremium(userId: string, isPremium: boolean) {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isPremium: !isPremium, premiumDays: 30 }),
    })
    if (res.ok) {
      toast.success(!isPremium ? 'Premium berildi' : 'Premium olib tashlandi')
      loadUsers()
    }
  }

  async function saveSettings() {
    setSettingsSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) toast.success('Sozlamalar saqlandi!')
    else toast.error('Xato')
    setSettingsSaving(false)
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const TABS = [
    { id: 'dashboard', label: 'Statistika', icon: BarChart2 },
    { id: 'payments', label: "To'lovlar", icon: CreditCard, badge: stats.pendingPayments },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ] as const

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-gray-500 flex items-center gap-3">
          <RefreshCw className="animate-spin" size={20} />
          Yuklanmoqda...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 z-50" style={{ background: 'rgba(5,8,16,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
              <Shield size={15} color="white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-sm">Admin Panel</span>
              <span className="text-gray-600 text-xs ml-2">FileConvert.uz</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-900 transition-all text-sm"
          >
            <LogOut size={14} /> Chiqish
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon, badge }: any) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold font-display whitespace-nowrap flex-1 justify-center transition-all relative ${
                tab === id ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={15} />
              {label}
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {tab === 'dashboard' && (
          <div className="space-y-6 page-transition">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Jami foydalanuvchilar', value: stats.totalUsers || 0, icon: Users, color: '#3b82f6' },
                { label: 'Premium foydalanuvchilar', value: stats.premiumUsers || 0, icon: Crown, color: '#f59e0b' },
                { label: 'Jami konvertatsiyalar', value: stats.totalConversions || 0, icon: FileText, color: '#22c55e' },
                { label: "Kutilayotgan to'lovlar", value: stats.pendingPayments || 0, icon: Clock, color: '#ef4444' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: stat.color + '15', border: `1px solid ${stat.color}25` }}
                    >
                      <stat.icon size={18} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="font-display text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={20} className="text-green-400" />
                <h3 className="font-display font-bold text-white">Umumiy daromad</h3>
              </div>
              <div className="font-display text-4xl font-bold gradient-text">
                {(stats.totalRevenue || 0).toLocaleString('uz-UZ')} so'm
              </div>
              <p className="text-gray-600 text-sm mt-1">Tasdiqlangan to'lovlar</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTab('payments')}
                className="btn-glow flex items-center gap-2 text-sm"
              >
                <CreditCard size={15} /> To'lovlarni ko'rish
                {stats.pendingPayments > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingPayments} yangi
                  </span>
                )}
              </button>
              <button
                onClick={loadStats}
                className="flex items-center gap-2 px-4 py-2 border border-gray-800 rounded-xl text-gray-400 hover:border-gray-700 transition-all text-sm"
              >
                <RefreshCw size={14} /> Yangilash
              </button>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {tab === 'payments' && (
          <div className="page-transition space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display text-xl font-bold text-white">To'lovlar</h2>
              <div className="flex gap-2">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setPaymentFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      paymentFilter === f
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-800 text-gray-500 hover:border-gray-700'
                    }`}
                  >
                    {f === 'all' ? 'Barchasi' : f === 'pending' ? 'Kutilayotgan' : f === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                  </button>
                ))}
              </div>
            </div>

            {/* Check image modal */}
            {selectedCheck && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCheck(null)}>
                <div className="max-w-lg w-full glass-card p-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-white">To'lov cheki</h3>
                    <button onClick={() => setSelectedCheck(null)} className="text-gray-500 hover:text-white">✕</button>
                  </div>
                  <img src={selectedCheck} alt="Chek" className="w-full rounded-xl max-h-96 object-contain" />
                </div>
              </div>
            )}

            <div className="glass-card overflow-hidden">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th className="text-left">Foydalanuvchi</th>
                    <th className="text-left hidden sm:table-cell">Miqdor</th>
                    <th className="text-left hidden md:table-cell">Sana</th>
                    <th className="text-left">Holat</th>
                    <th className="text-left">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-600">
                        To'lovlar yo'q
                      </td>
                    </tr>
                  ) : payments.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="text-sm">{p.user_email}</div>
                      </td>
                      <td className="hidden sm:table-cell font-semibold">
                        {Number(p.amount).toLocaleString()} so'm
                      </td>
                      <td className="hidden md:table-cell text-gray-500 text-sm">
                        {format(new Date(p.created_at), 'dd.MM.yy HH:mm')}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          p.status === 'approved' ? 'status-approved' :
                          p.status === 'rejected' ? 'status-rejected' : 'status-pending'
                        }`}>
                          {p.status === 'approved' ? '✓ OK' :
                           p.status === 'rejected' ? '✗ Rad' : '⏳ Kutilmoqda'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {p.check_image_url && (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/admin/signed-url', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ path: p.check_image_url }),
                                  })
                                  const data = await res.json()
                                  setSelectedCheck(data.signedUrl || p.check_image_url)
                                } catch {
                                  setSelectedCheck(p.check_image_url)
                                }
                              }}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                              title="Chekni ko'rish"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          {p.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePaymentAction(p.id, 'approved')}
                                disabled={processingId === p.id}
                                className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
                                title="Tasdiqlash"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handlePaymentAction(p.id, 'rejected')}
                                disabled={processingId === p.id}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                title="Rad etish"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="page-transition space-y-4">
            <h2 className="font-display text-xl font-bold text-white">Foydalanuvchilar</h2>
            <div className="glass-card overflow-hidden">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th className="text-left">Email</th>
                    <th className="text-left hidden sm:table-cell">Ro'yxat</th>
                    <th className="text-left">Status</th>
                    <th className="text-left hidden md:table-cell">Premium muddat</th>
                    <th className="text-left">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isPremiumActive = u.is_premium && u.premium_expires_at && 
                      new Date(u.premium_expires_at) > new Date()
                    return (
                      <tr key={u.id}>
                        <td className="text-sm">{u.email}</td>
                        <td className="hidden sm:table-cell text-gray-500 text-sm">
                          {format(new Date(u.created_at), 'dd.MM.yyyy')}
                        </td>
                        <td>
                          {isPremiumActive ? (
                            <span className="badge-premium">Premium</span>
                          ) : (
                            <span className="badge-free">Bepul</span>
                          )}
                        </td>
                        <td className="hidden md:table-cell text-gray-500 text-sm">
                          {u.premium_expires_at ? format(new Date(u.premium_expires_at), 'dd.MM.yyyy') : '—'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleTogglePremium(u.id, isPremiumActive)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isPremiumActive
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                            }`}
                          >
                            {isPremiumActive ? 'Olib tashlash' : '+ Premium'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="page-transition max-w-2xl space-y-6">
            <h2 className="font-display text-xl font-bold text-white">Sozlamalar</h2>
            
            <div className="glass-card p-6 space-y-5">
              <h3 className="font-display font-bold text-white border-b border-gray-800 pb-3">💳 To'lov sozlamalari</h3>
              
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Karta raqami</label>
                <input
                  type="text"
                  value={settings.payment_card_number || ''}
                  onChange={e => setSettings({...settings, payment_card_number: e.target.value})}
                  placeholder="8600 0000 0000 0000"
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Karta egasi</label>
                <input
                  type="text"
                  value={settings.payment_card_holder || ''}
                  onChange={e => setSettings({...settings, payment_card_holder: e.target.value})}
                  placeholder="Ismi Familiyasi"
                  className="input-field"
                />
              </div>
            </div>

            <div className="glass-card p-6 space-y-5">
              <h3 className="font-display font-bold text-white border-b border-gray-800 pb-3">👑 Premium sozlamalari</h3>
              
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Oylik narxi (so'm)</label>
                <input
                  type="number"
                  value={settings.premium_price || ''}
                  onChange={e => setSettings({...settings, premium_price: e.target.value})}
                  placeholder="29900"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Abonement davri (kun)</label>
                <input
                  type="number"
                  value={settings.premium_duration_days || ''}
                  onChange={e => setSettings({...settings, premium_duration_days: e.target.value})}
                  placeholder="30"
                  className="input-field"
                />
              </div>
            </div>

            <div className="glass-card p-6 space-y-5">
              <h3 className="font-display font-bold text-white border-b border-gray-800 pb-3">⚙️ Umumiy sozlamalar</h3>
              
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Kunlik bepul limit</label>
                <input
                  type="number"
                  value={settings.free_daily_limit || ''}
                  onChange={e => setSettings({...settings, free_daily_limit: e.target.value})}
                  placeholder="2"
                  className="input-field"
                />
              </div>
            </div>

            <button
              onClick={saveSettings}
              disabled={settingsSaving}
              className="btn-glow flex items-center gap-2 disabled:opacity-50"
            >
              {settingsSaving ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                </svg>
              ) : <Save size={16} />}
              Saqlash
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
