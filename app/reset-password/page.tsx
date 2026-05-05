'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error("Parollar mos kelmadi"); return }
    if (password.length < 6) { toast.error("Parol kamida 6 ta belgi"); return }
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error('Xato yuz berdi')
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="glass-card p-10 text-center max-w-sm">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Parol yangilandi!</h2>
          <p className="text-gray-500">Bosh sahifaga yo'naltirilmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="glass-card p-8">
          <h2 className="font-display text-2xl font-bold text-white mb-1">Yangi parol</h2>
          <p className="text-gray-500 text-sm mb-6">Yangi parolingizni kiriting</p>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Yangi parol</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  className="input-field pl-9 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Parolni tasdiqlang</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-9"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-glow w-full py-3 disabled:opacity-50">
              {loading ? 'Yuklanmoqda...' : 'Parolni yangilash'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
