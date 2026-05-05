'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })

    if (res.ok) {
      toast.success('Xush kelibsiz, Admin!')
      router.push('/admin')
    } else {
      const data = await res.json()
      toast.error(data.error || 'Noto\'g\'ri ma\'lumotlar')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/30">
            <Shield size={28} color="white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-600 text-sm mt-1">FileConvert.uz boshqaruvi</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Login</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="Admin login"
                  className="input-field pl-9"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Parol</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-9 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                </svg>
              ) : <Lock size={16} />}
              Kirish
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
