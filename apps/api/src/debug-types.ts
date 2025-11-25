import { prisma } from '@packages/database'

async function test() {
  const event = await prisma.event.findFirst()
  if (event) {
    console.log(event.notes)
    // @ts-expect-error - description should not exist
    console.log(event.description)
  }
}

