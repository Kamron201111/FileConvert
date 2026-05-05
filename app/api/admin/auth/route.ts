import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json()

    const validLogin = process.env.ADMIN_LOGIN || 'kamron201'
    const validPassword = process.env.ADMIN_PASSWORD || '128787$Kam'

    if (login !== validLogin || password !== validPassword) {
      return NextResponse.json({ error: "Login yoki parol noto'g'ri" }, { status: 401 })
    }

    const token = createAdminToken()
    
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Xato' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}
