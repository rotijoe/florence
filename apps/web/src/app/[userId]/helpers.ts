import type { AccountOverviewData } from './types'

export function getGreetingForUser(name: string | null | undefined): string {
  if (!name) {
    return 'Welcome back'
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return 'Welcome back'
  }

  return `Welcome back, ${trimmedName}`
}

export function getWelcomeSubtitle(): string {
  return 'Log how you are feeling, keep your details up to date, and stay on top of upcoming care.'
}

export function buildMockAccountOverviewData(name: string | null | undefined): AccountOverviewData {
  const displayName = name && name.trim().length > 0 ? name : 'there'

  return {
    user: {
      id: 'mock-user',
      name: displayName
    },
    notifications: [
      {
        id: 'appointment-details-reminder',
        type: 'appointmentDetails',
        title: 'Add details from your recent appointment',
        message:
          'Capture key points and any follow‑up actions from your last visit while they are still fresh.',
        ctaLabel: 'Add details'
      },
      {
        id: 'symptom-reminder',
        type: 'symptomReminder',
        title: 'Log how you are feeling today',
        message: 'A quick check‑in helps you and your care team see patterns over time.',
        ctaLabel: 'Log symptom'
      }
    ],
    healthTracks: [
      {
        id: 'sleep-track',
        title: 'Sleep',
        description: 'Track your sleep quality and routines.',
        lastUpdatedLabel: 'Updated yesterday',
        slug: 'sleep',
        lastUpdatedAt: new Date(Date.now() - 86400000)
      },
      {
        id: 'pain-track',
        title: 'Pain',
        description: 'Log pain levels and triggers to spot patterns.',
        lastUpdatedLabel: 'Updated this morning',
        slug: 'pain',
        lastUpdatedAt: new Date()
      }
    ],
    appointments: [
      {
        id: 'upcoming-appointment-1',
        title: 'GP follow‑up',
        datetimeLabel: 'Tue, 14 Jan · 10:30',
        location: 'City Health Centre'
      },
      {
        id: 'upcoming-appointment-2',
        title: 'Physio session',
        datetimeLabel: 'Fri, 17 Jan · 15:00',
        location: 'Riverside Clinic'
      }
    ],
    recentActivity: []
  }
}
