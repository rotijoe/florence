import type { Prisma } from '@prisma/client'

export async function verifyTrackExists(
  tx: Prisma.TransactionClient,
  slug: string
): Promise<{ id: string } | null> {
  return await tx.healthTrack.findFirst({
    where: { slug },
    select: { id: true }
  })
}

