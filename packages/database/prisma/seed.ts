import { PrismaClient, EventType } from '@prisma/client'
import { hashPassword } from 'better-auth/crypto'

const prisma = new PrismaClient()
const DEFAULT_PASSWORD = '123456'

const users = [
  { email: 'alice@example.com', name: 'Alice' },
  { email: 'bob@example.com', name: 'Bob' },
  { email: 'carol@example.com', name: 'Carol' }
]

const tracksForUser = [
  {
    title: 'Vitals',
    slug: 'vitals',
    description: 'Blood pressure, heart rate, temperature',
    events: [
      {
        type: EventType.NOTE,
        title: 'Morning notes',
        date: new Date(),
        notes: 'Feeling good'
      },
      {
        type: EventType.RESULT,
        title: 'BP reading',
        date: new Date(Date.now() - 86400000),
        notes: '120/80 mmHg'
      },
      {
        type: EventType.FEELING,
        title: 'Mood check-in',
        date: new Date(Date.now() - 2 * 86400000),
        notes: 'Calm'
      },
      {
        type: EventType.SYMPTOM,
        title: 'Headache',
        date: new Date(Date.now() - 3 * 86400000),
        notes: 'Mild headache in the afternoon',
        symptomType: 'headache',
        severity: 2
      }
    ]
  },
  {
    title: 'Medication',
    slug: 'medication',
    description: 'Prescriptions and adherence logs',
    events: [
      {
        type: EventType.NOTE,
        title: 'Refill reminder',
        date: new Date(),
        notes: 'Refill due in 5 days'
      },
      {
        type: EventType.APPOINTMENT,
        title: 'Pharmacy visit',
        date: new Date(Date.now() + 86400000),
        notes: 'Pickup statins'
      },
      {
        type: EventType.LETTER,
        title: 'Doctor letter',
        date: new Date(Date.now() - 3 * 86400000),
        notes: 'Updated dosage'
      }
    ]
  }
]

const additionalTracksForUser = [
  {
    title: 'Sleep',
    slug: 'sleep',
    description: 'Sleep tracking and quality monitoring',
    events: [
      {
        type: EventType.NOTE,
        title: '7h 45m sleep',
        date: new Date(),
        notes: 'Woke up refreshed, good quality sleep'
      },
      {
        type: EventType.FEELING,
        title: '6h 30m sleep',
        date: new Date(Date.now() - 86400000),
        notes: 'Restless night, woke up multiple times'
      },
      {
        type: EventType.NOTE,
        title: '8h 15m sleep',
        date: new Date(Date.now() - 2 * 86400000),
        notes: 'Deep sleep, felt great in the morning'
      },
      {
        type: EventType.NOTE,
        title: '7h 0m sleep',
        date: new Date(Date.now() - 3 * 86400000),
        notes: 'Average sleep quality'
      },
      {
        type: EventType.SYMPTOM,
        title: 'Fatigue',
        date: new Date(Date.now() - 4 * 86400000),
        notes: 'Feeling very tired throughout the day',
        symptomType: 'fatigue',
        severity: 4
      }
    ]
  },
  {
    title: 'Hydration',
    slug: 'hydration',
    description: 'Daily water intake tracking',
    events: [
      {
        type: EventType.RESULT,
        title: '2.5L water intake',
        date: new Date(),
        notes: 'Met daily hydration goal'
      },
      {
        type: EventType.RESULT,
        title: '2.0L water intake',
        date: new Date(Date.now() - 86400000),
        notes: 'Below target, need to drink more'
      },
      {
        type: EventType.RESULT,
        title: '3.0L water intake',
        date: new Date(Date.now() - 2 * 86400000),
        notes: 'Excellent hydration, exceeded goal'
      },
      {
        type: EventType.SYMPTOM,
        title: 'Thirst',
        date: new Date(Date.now() - 5 * 86400000),
        notes: 'Experienced excessive thirst',
        symptomType: 'thirst',
        severity: 3
      }
    ]
  }
]

async function main() {
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD)

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: { email: u.email, name: u.name }
    })

    // Create or update Account record for email/password authentication
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: 'credential',
          accountId: u.email
        }
      },
      update: {
        password: hashedPassword
      },
      create: {
        userId: user.id,
        accountId: u.email,
        providerId: 'credential',
        password: hashedPassword
      }
    })

    for (const t of tracksForUser) {
      const existing = await prisma.healthTrack.findFirst({
        where: { userId: user.id, slug: t.slug }
      })
      if (existing) continue

      await prisma.healthTrack.create({
        data: {
          userId: user.id,
          title: t.title,
          slug: t.slug,
          description: t.description,
          events: { create: t.events.map((e) => ({ ...e })) }
        }
      })
    }

    for (const additionalTrack of additionalTracksForUser) {
      const existing = await prisma.healthTrack.findFirst({
        where: { userId: user.id, slug: additionalTrack.slug }
      })
      if (existing) continue

      await prisma.healthTrack.create({
        data: {
          userId: user.id,
          title: additionalTrack.title,
          slug: additionalTrack.slug,
          description: additionalTrack.description,
          events: { create: additionalTrack.events.map((e) => ({ ...e })) }
        }
      })
    }
  }

  console.log('✅ Seeded 3 users with credentials (password: 123456)')
  console.log('   - alice@example.com')
  console.log('   - bob@example.com')
  console.log('   - carol@example.com')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
