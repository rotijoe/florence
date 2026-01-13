import {
  fetchTrack,
  fetchTrackEvents,
  filterNotificationsForTrack,
  mapEventResponseToUpcomingEvent
} from '../helpers'
import { SERVER_API_BASE_URL } from '@/constants/api'
import { EventType, type EventResponse } from '@packages/types'
import type { Notification } from '@/app/[userId]/types'

// Mock fetch globally
global.fetch = jest.fn()

// Mock next/headers cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => [
      { name: 'session', value: 'test-session-value' },
      { name: 'other-cookie', value: 'other-value' }
    ])
  }))
}))

describe('fetchTrack helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchTrack', () => {
    it('handles network connection errors', async () => {
      const networkError = new TypeError('fetch failed')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

      await expect(fetchTrack('user-1', 'test-slug')).rejects.toThrow(
        `Failed to connect to API server at ${SERVER_API_BASE_URL}. Make sure the API server is running.`
      )
    })

    it('re-throws non-network errors', async () => {
      const customError = new Error('Custom error')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(customError)

      await expect(fetchTrack('user-1', 'test-slug')).rejects.toThrow('Custom error')
    })

    it('handles API error without error message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false })
      })

      await expect(fetchTrack('user-1', 'test-slug')).rejects.toThrow('Failed to fetch track')
    })
  })

  describe('fetchTrackEvents', () => {
    it('handles network connection errors', async () => {
      const networkError = new TypeError('fetch failed')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

      await expect(fetchTrackEvents('user-1', 'test-slug')).rejects.toThrow(
        `Failed to connect to API server at ${SERVER_API_BASE_URL}. Make sure the API server is running.`
      )
    })

    it('re-throws non-network errors', async () => {
      const customError = new Error('Custom error')
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(customError)

      await expect(fetchTrackEvents('user-1', 'test-slug')).rejects.toThrow('Custom error')
    })

    it('handles API error without error message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false })
      })

      await expect(fetchTrackEvents('user-1', 'test-slug')).rejects.toThrow(
        'Failed to fetch events'
      )
    })
  })

  describe('filterNotificationsForTrack', () => {
    it('filters symptom reminder notifications by trackSlug', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'symptomReminder',
          trackSlug: 'track-1',
          message: 'Reminder 1'
        },
        {
          id: '2',
          type: 'symptomReminder',
          trackSlug: 'track-2',
          message: 'Reminder 2'
        }
      ]

      const result = filterNotificationsForTrack(notifications, 'user-1', 'track-1')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters appointment details notifications by matching href', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'appointmentDetails',
          href: '/user-1/tracks/track-1/event-1',
          message: 'Appointment 1'
        },
        {
          id: '2',
          type: 'appointmentDetails',
          href: '/user-1/tracks/track-2/event-2',
          message: 'Appointment 2'
        }
      ]

      const result = filterNotificationsForTrack(notifications, 'user-1', 'track-1')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('excludes appointment notifications with non-matching href', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'appointmentDetails',
          href: '/user-1/tracks/track-2/event-1',
          message: 'Appointment 1'
        }
      ]

      const result = filterNotificationsForTrack(notifications, 'user-1', 'track-1')

      expect(result).toHaveLength(0)
    })

    it('handles appointment notification with undefined href', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'appointmentDetails',
          href: undefined,
          message: 'Appointment 1'
        }
      ]

      const result = filterNotificationsForTrack(notifications, 'user-1', 'track-1')

      expect(result).toHaveLength(0)
    })

    it('handles invalid URL in appointment notification href', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'appointmentDetails',
          href: 'not-a-valid-url',
          message: 'Appointment 1'
        }
      ]

      // Should not throw, should return empty array
      const result = filterNotificationsForTrack(notifications, 'user-1', 'track-1')

      expect(result).toHaveLength(0)
    })

    it('excludes notifications with unknown types', () => {
      const notifications: Notification[] = [
        {
          id: '1',
          type: 'symptomReminder',
          trackSlug: 'track-1',
          message: 'Reminder'
        },
        {
          id: '2',
          type: 'unknownType' as Notification['type'],
          message: 'Unknown'
        }
      ]

      const result = filterNotificationsForTrack(notifications, 'user-1', 'track-1')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('handles empty notifications array', () => {
      const result = filterNotificationsForTrack([], 'user-1', 'track-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('mapEventResponseToUpcomingEvent', () => {
    it('maps event response to upcoming event correctly', () => {
      const event: EventResponse = {
        id: 'event-1',
        trackId: 'track-1',
        date: '2024-01-01T00:00:00.000Z',
        type: EventType.NOTE,
        title: 'Test Event',
        notes: 'Test notes',
        fileUrl: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const result = mapEventResponseToUpcomingEvent(event, 'user-1', 'track-slug')

      expect(result).toEqual({
        id: 'event-1',
        title: 'Test Event',
        datetime: '2024-01-01T00:00:00.000Z',
        href: '/user-1/tracks/track-slug/event-1'
      })
    })

    it('handles event with different userId and trackSlug', () => {
      const event: EventResponse = {
        id: 'event-2',
        trackId: 'track-2',
        date: '2024-02-01T00:00:00.000Z',
        type: EventType.APPOINTMENT,
        title: 'Another Event',
        notes: null,
        fileUrl: null,
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z'
      }

      const result = mapEventResponseToUpcomingEvent(event, 'user-2', 'different-track')

      expect(result).toEqual({
        id: 'event-2',
        title: 'Another Event',
        datetime: '2024-02-01T00:00:00.000Z',
        href: '/user-2/tracks/different-track/event-2'
      })
    })
  })
})
