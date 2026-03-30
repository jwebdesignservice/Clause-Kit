import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Require ADMIN_PASSWORD env var — credentials login is for operator access only
        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminPassword) return null
        if (credentials.password !== adminPassword) return null

        return {
          id: credentials.email as string,
          email: credentials.email as string,
          name: (credentials.email as string).split('@')[0],
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'clausekit-dev-secret-change-in-production',
}
