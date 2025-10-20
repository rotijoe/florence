import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@packages/database'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  baseURL: process.env.BASE_URL || 'http://localhost:8787',
  // Add trusted origins configuration
  trustedOrigins: [
    'http://localhost:3000', // Next.js dev server
    process.env.TRUSTED_ORIGIN || '' // Production web app URL
  ].filter(Boolean),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day (update session after 1 day of inactivity)
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true
    }
  }
})
