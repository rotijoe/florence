import { uploadUrlSchema, uploadConfirmSchema } from '../validators.js'
import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE_BYTES } from '../constants.js'

describe('Uploads Validators', () => {
  describe('uploadUrlSchema', () => {
    it('parses valid upload URL data', () => {
      const result = uploadUrlSchema.parse({
        fileName: 'test.pdf',
        contentType: 'application/pdf',
        size: 1024
      })

      expect(result.fileName).toBe('test.pdf')
      expect(result.contentType).toBe('application/pdf')
      expect(result.size).toBe(1024)
    })

    it('rejects empty fileName', () => {
      const result = uploadUrlSchema.safeParse({
        fileName: '',
        contentType: 'application/pdf',
        size: 1024
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('fileName')
      }
    })

    it('rejects invalid contentType', () => {
      const result = uploadUrlSchema.safeParse({
        fileName: 'test.pdf',
        contentType: 'invalid/type',
        size: 1024
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('contentType')
      }
    })

    it('accepts all allowed content types', () => {
      for (const contentType of ALLOWED_CONTENT_TYPES) {
        const result = uploadUrlSchema.safeParse({
          fileName: 'test.file',
          contentType,
          size: 1024
        })
        expect(result.success).toBe(true)
      }
    })

    it('rejects negative size', () => {
      const result = uploadUrlSchema.safeParse({
        fileName: 'test.pdf',
        contentType: 'application/pdf',
        size: -1
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('size')
      }
    })

    it('rejects size exceeding maximum', () => {
      const result = uploadUrlSchema.safeParse({
        fileName: 'test.pdf',
        contentType: 'application/pdf',
        size: MAX_FILE_SIZE_BYTES + 1
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('size')
      }
    })

    it('accepts maximum allowed size', () => {
      const result = uploadUrlSchema.parse({
        fileName: 'test.pdf',
        contentType: 'application/pdf',
        size: MAX_FILE_SIZE_BYTES
      })
      expect(result.size).toBe(MAX_FILE_SIZE_BYTES)
    })
  })

  describe('uploadConfirmSchema', () => {
    it('parses valid upload confirm data', () => {
      const result = uploadConfirmSchema.parse({
        fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
        key: 'events/event-1/file.pdf'
      })

      expect(result.fileUrl).toBe('https://bucket.s3.amazonaws.com/file.pdf')
      expect(result.key).toBe('events/event-1/file.pdf')
    })

    it('rejects invalid fileUrl', () => {
      const result = uploadConfirmSchema.safeParse({
        fileUrl: 'not-a-valid-url',
        key: 'events/event-1/file.pdf'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('fileUrl')
      }
    })

    it('rejects empty key', () => {
      const result = uploadConfirmSchema.safeParse({
        fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
        key: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('key')
      }
    })
  })
})
