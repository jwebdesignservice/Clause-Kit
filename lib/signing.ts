import jwt from 'jsonwebtoken'

// Lazy — only checked when signing functions are called at runtime
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET env var is not set')
  return secret
}
const EXPIRY_DAYS = 7

export interface SigningTokenPayload {
  contractId: string
  role: 'party1' | 'party2'
  email: string
  iat?: number
  exp?: number
}

export function createSigningToken(contractId: string, role: 'party1' | 'party2', email: string): string {
  return jwt.sign(
    { contractId, role, email },
    getJwtSecret(),
    { expiresIn: `${EXPIRY_DAYS}d` }
  )
}

export function verifySigningToken(token: string): SigningTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as SigningTokenPayload
  } catch {
    return null
  }
}

export function getExpiryDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + EXPIRY_DAYS)
  return d.toISOString()
}
