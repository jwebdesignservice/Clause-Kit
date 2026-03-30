import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET env var is not set')
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
    JWT_SECRET as string,
    { expiresIn: `${EXPIRY_DAYS}d` }
  )
}

export function verifySigningToken(token: string): SigningTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as SigningTokenPayload
  } catch {
    return null
  }
}

export function getExpiryDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + EXPIRY_DAYS)
  return d.toISOString()
}
