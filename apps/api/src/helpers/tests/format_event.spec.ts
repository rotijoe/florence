import { formatEvent } from '../format_event.js'
import { EventType } from '@packages/types'

describe('formatEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('formats event without fileUrl', async () => {
    const event = {
      id: 'event-1',
      trackId: 'track-1',
      date: new Date('2024-01-01T00:00:00Z'),
      type: EventType.NOTE,
      title: 'Test Event',
      notes: 'Test Notes',
      fileUrl: null,
      symptomType: null,
      severity: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    }

    const result = await formatEvent(event)

    expect(result).toEqual({
      id: 'event-1',
      trackId: 'track-1',
      date: '2024-01-01T00:00:00.000Z',
      type: EventType.NOTE,
      title: 'Test Event',
      notes: 'Test Notes',
      fileUrl: null,
      symptomType: null,
      severity: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    })
  })

  it('formats event with fileUrl and generates presigned URL', async () => {
    const event = {
      id: 'event-1',
      trackId: 'track-1',
      date: new Date('2024-01-01T00:00:00Z'),
      type: EventType.NOTE,
      title: 'Test Event',
      notes: 'Test Notes',
      fileUrl: 'https://bucket.s3.amazonaws.com/events/event-1/file.pdf',
      symptomType: null,
      severity: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    }

    const result = await formatEvent(event)

    // Verify that fileUrl is a presigned URL (contains query parameters)
    expect(result.fileUrl).toBeDefined()
    expect(result.fileUrl).toContain('X-Amz-Signature')
    expect(result.fileUrl).not.toBe(event.fileUrl)
  })

  // Note: Testing S3 error handling requires complex mocking with ESM modules
  // The error handling logic is covered by integration tests in handler tests
})

