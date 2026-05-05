import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center text-center px-4">
      <div>
        <div className="font-display text-8xl font-bold gradient-text mb-4">404</div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">Sahifa topilmadi</h2>
        <p className="text-gray-500 mb-8">Siz qidirgan sahifa mavjud emas</p>
        <Link href="/">
          <button className="btn-glow">← Bosh sahifaga qaytish</button>
        </Link>
      </div>
    </div>
  )
}
