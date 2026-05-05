import { NextRequest } from 'next/server'

export function verifyAdminAuth(request: NextRequest): boolean {
  const adminToken = request.cookies.get('admin_token')?.value
  if (!adminToken) return false
  
  try {
    const decoded = Buffer.from(adminToken, 'base64').toString('utf-8')
    return decoded === `${process.env.ADMIN_LOGIN}:${process.env.ADMIN_PASSWORD}`
  } catch {
    return false
  }
}

export function createAdminToken(): string {
  const credentials = `${process.env.ADMIN_LOGIN}:${process.env.ADMIN_PASSWORD}`
  return Buffer.from(credentials).toString('base64')
}
