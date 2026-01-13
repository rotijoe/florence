import type { Prisma } from '@prisma/client'
import { generateSlug } from './generate_slug'

export async function generateUniqueSlug(
  tx: Prisma.TransactionClient,
  title: string
): Promise<string> {
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 2

  while (true) {
    const existing = await tx.healthTrack.findFirst({
      where: {
        slug
      }
    })

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

