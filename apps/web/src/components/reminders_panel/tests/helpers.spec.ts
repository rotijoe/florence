import { notificationsOptimisticReducer, hasNotifications } from '../helpers'
import type { Notification } from '@/app/[userId]/types'

const createNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'default-id',
  type: 'appointmentDetails',
  title: 'Default notification',
  message: 'Default message',
  ...overrides
})

describe('notificationsOptimisticReducer', () => {
  describe('REMOVE_BY_ID action', () => {
    it('removes notification with matching id', () => {
      const notifications: Notification[] = [
        createNotification({ id: '1', title: 'First' }),
        createNotification({ id: '2', title: 'Second' }),
        createNotification({ id: '3', title: 'Third' })
      ]

      const result = notificationsOptimisticReducer(notifications, {
        type: 'REMOVE_BY_ID',
        id: '2'
      })

      expect(result).toHaveLength(2)
      expect(result.map((n) => n.id)).toEqual(['1', '3'])
    })

    it('returns same array if id not found', () => {
      const notifications: Notification[] = [
        createNotification({ id: '1', title: 'First' }),
        createNotification({ id: '2', title: 'Second' })
      ]

      const result = notificationsOptimisticReducer(notifications, {
        type: 'REMOVE_BY_ID',
        id: 'non-existent'
      })

      expect(result).toHaveLength(2)
    })

    it('returns empty array when removing last notification', () => {
      const notifications: Notification[] = [createNotification({ id: '1' })]

      const result = notificationsOptimisticReducer(notifications, {
        type: 'REMOVE_BY_ID',
        id: '1'
      })

      expect(result).toHaveLength(0)
    })
  })

  describe('REMOVE_BY_TRACK_SLUG action', () => {
    it('removes symptomReminder notification with matching trackSlug', () => {
      const notifications: Notification[] = [
        createNotification({ id: '1', type: 'appointmentDetails', title: 'Appointment' }),
        createNotification({
          id: '2',
          type: 'symptomReminder',
          title: 'Symptom',
          trackSlug: 'pain'
        }),
        createNotification({
          id: '3',
          type: 'symptomReminder',
          title: 'Other Symptom',
          trackSlug: 'sleep'
        })
      ]

      const result = notificationsOptimisticReducer(notifications, {
        type: 'REMOVE_BY_TRACK_SLUG',
        trackSlug: 'pain'
      })

      expect(result).toHaveLength(2)
      expect(result.map((n) => n.id)).toEqual(['1', '3'])
    })

    it('does not remove appointmentDetails notifications with matching trackSlug', () => {
      const notifications: Notification[] = [
        createNotification({
          id: '1',
          type: 'appointmentDetails',
          title: 'Appointment',
          trackSlug: 'pain'
        }),
        createNotification({
          id: '2',
          type: 'symptomReminder',
          title: 'Symptom',
          trackSlug: 'pain'
        })
      ]

      const result = notificationsOptimisticReducer(notifications, {
        type: 'REMOVE_BY_TRACK_SLUG',
        trackSlug: 'pain'
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('returns same array if trackSlug not found', () => {
      const notifications: Notification[] = [
        createNotification({ id: '1', type: 'symptomReminder', trackSlug: 'pain' })
      ]

      const result = notificationsOptimisticReducer(notifications, {
        type: 'REMOVE_BY_TRACK_SLUG',
        trackSlug: 'non-existent'
      })

      expect(result).toHaveLength(1)
    })
  })

  describe('RESTORE action', () => {
    it('adds notification back and sorts by id', () => {
      const notifications: Notification[] = [
        createNotification({ id: '1', title: 'First' }),
        createNotification({ id: '3', title: 'Third' })
      ]

      const restoredNotification = createNotification({ id: '2', title: 'Second' })

      const result = notificationsOptimisticReducer(notifications, {
        type: 'RESTORE',
        notification: restoredNotification
      })

      expect(result).toHaveLength(3)
      expect(result.map((n) => n.id)).toEqual(['1', '2', '3'])
    })

    it('adds notification to empty array', () => {
      const notifications: Notification[] = []
      const restoredNotification = createNotification({ id: '1', title: 'Restored' })

      const result = notificationsOptimisticReducer(notifications, {
        type: 'RESTORE',
        notification: restoredNotification
      })

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Restored')
    })
  })

  describe('default case', () => {
    it('returns state unchanged for unknown action', () => {
      const notifications: Notification[] = [createNotification({ id: '1' })]

      // @ts-expect-error Testing unknown action type
      const result = notificationsOptimisticReducer(notifications, { type: 'UNKNOWN' })

      expect(result).toEqual(notifications)
    })
  })
})

describe('hasNotifications', () => {
  it('returns false for empty array', () => {
    expect(hasNotifications([])).toBe(false)
  })

  it('returns false for non-array', () => {
    expect(hasNotifications(null as unknown as Notification[])).toBe(false)
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
    expect(hasNotifications(notifications)).toBe(true)
  })
})
