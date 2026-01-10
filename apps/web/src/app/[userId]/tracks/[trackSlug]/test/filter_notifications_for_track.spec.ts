import type { Notification } from '@/app/[userId]/types'
import { filterNotificationsForTrack } from '../helpers'

describe('filterNotificationsForTrack', () => {
  it('includes symptomReminder notifications matching trackSlug', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'symptomReminder',
        title: 'Log a symptom',
        message: '...',
        trackSlug: 'pain'
      },
      {
        id: '2',
        type: 'symptomReminder',
        title: 'Log a symptom',
        message: '...',
        trackSlug: 'sleep'
      }
    ]

    const result = filterNotificationsForTrack(notifications, 'user-1', 'pain')
    expect(result.map((n) => n.id)).toEqual(['1'])
  })

  it('includes appointmentDetails notifications whose href points to this track', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Add details',
        message: '...',
        href: '/user-1/tracks/pain/event-123'
      },
      {
        id: '2',
        type: 'appointmentDetails',
        title: 'Add details',
        message: '...',
        href: '/user-1/tracks/sleep/event-999'
      },
      {
        id: '3',
        type: 'appointmentDetails',
        title: 'Add details',
        message: '...',
        href: undefined
      }
    ]

    const result = filterNotificationsForTrack(notifications, 'user-1', 'pain')
    expect(result.map((n) => n.id)).toEqual(['1'])
  })
})



