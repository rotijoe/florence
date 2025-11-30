import { prisma } from '@packages/database'
import { generateSlug } from './generate_slug'

export async function generateUniqueSlug(userId: string, title: string): Promise<string> {
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 2

  while (true) {
    const existing = await prisma.healthTrack.findFirst({
      where: {
        userId,
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
