import { createTrackSchema } from '../validators.js'

describe('Tracks Validators', () => {
  describe('createTrackSchema', () => {
    it('parses valid track data', () => {
      const result = createTrackSchema.parse({
        title: 'Test Track',
        description: 'Test description'
      })

      expect(result.title).toBe('Test Track')
      expect(result.description).toBe('Test description')
    })

    it('parses track data without description', () => {
      const result = createTrackSchema.parse({
        title: 'Test Track'
      })

      expect(result.title).toBe('Test Track')
      expect(result.description).toBeUndefined()
    })

    it('accepts null description', () => {
      const result = createTrackSchema.parse({
        title: 'Test Track',
        description: null
      })

      expect(result.title).toBe('Test Track')
      expect(result.description).toBeNull()
    })

    it('rejects empty title', () => {
      const result = createTrackSchema.safeParse({
        title: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title')
      }
    })

    it('rejects missing title', () => {
      const result = createTrackSchema.safeParse({})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title')
      }
    })

    it('trims whitespace from title', () => {
      const result = createTrackSchema.parse({
        title: '  Test Track  '
      })

      expect(result.title).toBe('Test Track')
    })
  })
})

