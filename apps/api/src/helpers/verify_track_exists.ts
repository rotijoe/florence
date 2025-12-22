import { prisma } from '@packages/database'

export async function verifyTrackExists(
  userId: string,
  slug: string
): Promise<{ id: string } | null> {
  return await prisma.healthTrack.findFirst({
    where: { userId, slug },
    select: { id: true }
  })
}

