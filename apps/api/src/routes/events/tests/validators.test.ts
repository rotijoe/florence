import { listEventsQuerySchema, createEventSchema, updateEventSchema } from '../validators.js'
import { EventType } from '@packages/types'

describe('Events Validators', () => {
  describe('listEventsQuerySchema', () => {
    it('parses valid limit query', () => {
      const result = listEventsQuerySchema.parse({ limit: '50' })
      expect(result.limit).toBe(50)
    })

    it('uses default limit when limit is not provided', () => {
      const result = listEventsQuerySchema.parse({})
      expect(result.limit).toBe(100)
    })

    it('enforces maximum limit of 1000', () => {
      const result = listEventsQuerySchema.parse({ limit: '2000' })
      expect(result.limit).toBe(1000)
    })

    it('enforces minimum limit of 1', () => {
      const result = listEventsQuerySchema.parse({ limit: '0' })
      expect(result.limit).toBe(1)
    })

    it('handles invalid limit gracefully', () => {
      const result = listEventsQuerySchema.parse({ limit: 'invalid' })
      expect(result.limit).toBe(100) // defaults to DEFAULT_LIMIT
    })
  })

  describe('createEventSchema', () => {
    it('parses valid event data with all fields', () => {
      const result = createEventSchema.parse({
        title: 'Test Event',
        type: EventType.NOTE,
        date: '2024-01-01T00:00:00Z',
        notes: 'Test notes',
        symptomType: 'Headache',
        severity: 3
      })

      expect(result.title).toBe('Test Event')
      expect(result.type).toBe(EventType.NOTE)
      expect(result.date).toBeInstanceOf(Date)
      expect(result.notes).toBe('Test notes')
      expect(result.symptomType).toBe('Headache')
      expect(result.severity).toBe(3)
    })

    it('uses defaults for optional fields', () => {
      const result = createEventSchema.parse({})

      expect(result.title).toBe('Untitled event')
      expect(result.type).toBe(EventType.NOTE)
      expect(result.date).toBeInstanceOf(Date)
      expect(result.notes).toBeUndefined()
      expect(result.symptomType).toBeUndefined()
      expect(result.severity).toBeUndefined()
    })

    it('rejects empty title', () => {
      const result = createEventSchema.safeParse({ title: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title')
      }
    })

    it('rejects invalid event type', () => {
      const result = createEventSchema.safeParse({ type: 'INVALID_TYPE' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('type')
      }
    })

    it('rejects severity outside 1-5 range', () => {
      const result1 = createEventSchema.safeParse({ severity: 0 })
      expect(result1.success).toBe(false)

      const result2 = createEventSchema.safeParse({ severity: 6 })
      expect(result2.success).toBe(false)

      const result3 = createEventSchema.safeParse({ severity: 3 })
      expect(result3.success).toBe(true)
    })

    it('accepts null for nullable fields', () => {
      const result = createEventSchema.parse({
        notes: null,
        symptomType: null,
        severity: null
      })

      expect(result.notes).toBeNull()
      expect(result.symptomType).toBeNull()
      expect(result.severity).toBeNull()
    })

    it('transforms date string to Date object', () => {
      const result = createEventSchema.parse({
        date: '2024-01-01T00:00:00Z'
      })

      expect(result.date).toBeInstanceOf(Date)
      expect(result.date.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    it('uses current date when date is not provided', () => {
      const before = new Date()
      const result = createEventSchema.parse({})
      const after = new Date()

      expect(result.date).toBeInstanceOf(Date)
      expect(result.date.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.date.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('updateEventSchema', () => {
    it('parses valid update data', () => {
      const result = updateEventSchema.parse({
        title: 'Updated Title',
        notes: 'Updated notes'
      })

      expect(result.title).toBe('Updated Title')
      expect(result.notes).toBe('Updated notes')
    })

    it('allows partial updates', () => {
      const result1 = updateEventSchema.parse({ title: 'Updated Title' })
      expect(result1.title).toBe('Updated Title')
      expect(result1.notes).toBeUndefined()

      const result2 = updateEventSchema.parse({ notes: 'Updated notes' })
      expect(result2.notes).toBe('Updated notes')
      expect(result2.title).toBeUndefined()
    })

    it('rejects empty title', () => {
      const result = updateEventSchema.safeParse({ title: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title')
      }
    })

    it('accepts null for notes', () => {
      const result = updateEventSchema.parse({ notes: null })
      expect(result.notes).toBeNull()
    })

    it('rejects invalid notes type', () => {
      const result = updateEventSchema.safeParse({ notes: 123 })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('notes')
      }
    })
  })
})

