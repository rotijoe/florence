import type { Prisma, PrismaClient } from '@prisma/client'

/**
 * Wraps a Prisma query in a transaction with Row-Level Security context.
 * Sets the user context for the transaction, ensuring RLS policies can filter rows.
 *
 * @param prisma - Prisma client instance (should be prismaRuntime for RLS enforcement)
 * @param userId - The user ID to set as context for RLS policies
 * @param fn - Function that receives a transaction client and returns a promise
 * @returns The result of the function
 *
 * @example
 * ```ts
 * const tracks = await withUserRls(prismaRuntime, userId, (tx) =>
 *   tx.healthTrack.findMany()
 * )
 * ```
 */
export async function withUserRls<T>(
  prisma: PrismaClient,
  userId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  if (!userId) {
    throw new Error('withUserRls requires a valid userId')
  }

  return prisma.$transaction(async (tx) => {
    // Set user context for this transaction (local = true means transaction-scoped)
    await tx.$executeRaw`SELECT set_config('app.user_id', ${userId}, true)`
    return fn(tx)
  })
}
