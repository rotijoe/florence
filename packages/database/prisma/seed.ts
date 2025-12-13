import { PrismaClient, EventType } from '@prisma/client'
import { hashPassword } from 'better-auth/crypto'

const prisma = new PrismaClient()
const DEFAULT_PASSWORD = '123456'

const users = [
  { email: 'alice@example.com', name: 'Alice' },
  { email: 'bob@example.com', name: 'Bob' },
  { email: 'carol@example.com', name: 'Carol' }
]

// Helper for future dates (days from now)
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000)
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)
const yearsFromNow = (years: number) => new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000)

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
        date: daysAgo(1),
        notes: '120/80 mmHg'
      },
      {
        type: EventType.FEELING,
        title: 'Mood check-in',
        date: daysAgo(2),
        notes: 'Calm'
      },
      {
        type: EventType.SYMPTOM,
        title: 'Headache',
        date: daysAgo(3),
        notes: 'Mild headache in the afternoon',
        symptomType: 'headache',
        severity: 2
      },
      {
        type: EventType.APPOINTMENT,
        title: 'GP check-up',
        date: daysFromNow(14),
        notes: 'Routine health check with Dr Smith'
      },
      {
        type: EventType.APPOINTMENT,
        title: 'Blood test',
        date: daysFromNow(30),
        notes: 'Fasting required - arrive 15 mins early'
      },
      {
        type: EventType.APPOINTMENT,
        title: 'Annual health screening',
        date: yearsFromNow(1),
        notes:
          'Full annual health check-up - includes blood work, physical exam, and health assessment'
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
        date: daysFromNow(7),
        notes: 'Pickup statins'
      },
      {
        type: EventType.LETTER,
        title: 'Doctor letter',
        date: daysAgo(3),
        notes: 'Updated dosage'
      },
      {
        type: EventType.APPOINTMENT,
        title: 'Medication review',
        date: daysFromNow(45),
        notes: 'Annual medication review with pharmacist'
      },
      {
        type: EventType.APPOINTMENT,
        title: 'Prescription renewal',
        date: yearsFromNow(1),
        notes: 'Annual prescription renewal appointment with GP'
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
        date: daysAgo(1),
        notes: 'Restless night, woke up multiple times'
      },
      {
        type: EventType.NOTE,
        title: '8h 15m sleep',
        date: daysAgo(2),
        notes: 'Deep sleep, felt great in the morning'
      },
      {
        type: EventType.NOTE,
        title: '7h 0m sleep',
        date: daysAgo(3),
        notes: 'Average sleep quality'
      },
      {
        type: EventType.SYMPTOM,
        title: 'Fatigue',
        date: daysAgo(4),
        notes: 'Feeling very tired throughout the day',
        symptomType: 'fatigue',
        severity: 4
      },
      {
        type: EventType.APPOINTMENT,
        title: 'Sleep clinic consultation',
        date: daysFromNow(21),
        notes: 'Follow-up for sleep study results'
      },
      {
        type: EventType.APPOINTMENT,
        title: 'Annual sleep assessment',
        date: yearsFromNow(1),
        notes: 'Yearly sleep quality review and potential study scheduling'
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
        date: daysAgo(1),
        notes: 'Below target, need to drink more'
      },
      {
        type: EventType.RESULT,
        title: '3.0L water intake',
        date: daysAgo(2),
        notes: 'Excellent hydration, exceeded goal'
      },
      {
        type: EventType.SYMPTOM,
        title: 'Thirst',
        date: daysAgo(5),
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
  console.log('')
  console.log('📅 Upcoming appointments seeded:')
  console.log('   - Pharmacy visit (in 7 days)')
  console.log('   - GP check-up (in 14 days)')
  console.log('   - Sleep clinic consultation (in 21 days)')
  console.log('   - Blood test (in 30 days)')
  console.log('   - Medication review (in 45 days)')
  console.log('')
  console.log('📅 Long-term appointments (1 year out):')
  console.log('   - Annual health screening')
  console.log('   - Prescription renewal')
  console.log('   - Annual sleep assessment')
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
