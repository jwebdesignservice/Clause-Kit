'use client'

import { signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { FileText } from 'lucide-react'

export default function SignOutPage() {
  useEffect(() => { signOut({ callbackUrl: '/' }) }, [])
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="text-center">
        <div className="w-8 h-8 flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#2D6A4F' }}>
          <FileText className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm" style={{ color: '#6B7280' }}>Signing out&hellip;</p>
      </div>
    </div>
  )
}
