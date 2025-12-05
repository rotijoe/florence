import { hubHasNotifications } from '../helpers'
import type { Notification } from '@/app/[userId]/types'

describe('hubHasNotifications', () => {
  it('returns false for empty array', () => {
    expect(hubHasNotifications([])).toBe(false)
  })

  it('returns false for non-array', () => {
    expect(hubHasNotifications(null as unknown as Notification[])).toBe(false)
  })

  it('returns true for array with items', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'appointmentDetails',
        title: 'Test',
        message: 'Test message',
        ctaLabel: undefined
      }
    ]
    expect(hubHasNotifications(notifications)).toBe(true)
  })
})

