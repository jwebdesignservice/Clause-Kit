'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FileText, Loader2, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/app'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false, callbackUrl })
    setLoading(false)
    if (result?.error) setError('Invalid email or password.')
    else router.push(callbackUrl)
  }

  const inputClass = "w-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
  const inputStyle = { borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAFAF8' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: '#1B4332' }}>ClauseKit</span>
        </div>

        <div className="bg-white border p-8" style={{ borderColor: '#E5E5E2' }}>
          <h1 className="font-display text-2xl font-bold mb-1 text-center" style={{ color: '#1B4332' }}>Sign in</h1>
          <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>Access your contracts and account</p>

          {process.env.NEXT_PUBLIC_GOOGLE_ENABLED !== 'false' && (
            <>
              <button
                onClick={() => { setGoogleLoading(true); signIn('google', { callbackUrl }) }}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 border py-2.5 text-sm font-medium hover:bg-[#FAFAF8] transition-colors mb-4 disabled:opacity-50"
                style={{ borderColor: '#E5E5E2', color: '#374151' }}
              >
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ backgroundColor: '#E5E5E2' }} />
                <span className="text-xs" style={{ color: '#9CA3AF' }}>or</span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#E5E5E2' }} />
              </div>
            </>
          )}

          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1B4332' }}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.co.uk" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1B4332' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" className={inputClass} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs font-medium" style={{ color: '#EF4444' }}>{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#2D6A4F' }}>
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing in&hellip;</span> : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs mt-5" style={{ color: '#9CA3AF' }}>
          Don&rsquo;t have an account?{' '}
          <Link href="/auth/signup" className="font-semibold hover:opacity-70" style={{ color: '#2D6A4F' }}>Create one free</Link>
        </p>
        <p className="text-center text-xs mt-2">
          <Link href="/" className="hover:opacity-70" style={{ color: '#9CA3AF' }}>&larr; Back to ClauseKit</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return <Suspense><SignInForm /></Suspense>
}
