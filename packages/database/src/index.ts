import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaRuntime: PrismaClient | undefined
}

// Migration client - used for prisma migrate/db push (has BYPASSRLS)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error']
  })

// Runtime client - used for application queries (RLS enforced)
// Falls back to DATABASE_URL if DATABASE_URL_RUNTIME is not set (for development)
export const prismaRuntime =
  globalForPrisma.prismaRuntime ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_RUNTIME || process.env.DATABASE_URL
      }
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaRuntime = prismaRuntime
}

export * from '@prisma/client'
export { withUserRls } from './rls.js'
