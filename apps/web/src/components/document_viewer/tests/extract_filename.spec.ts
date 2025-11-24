import { extractFilename } from '../helpers'

describe('extractFilename', () => {
  it('extracts filename from simple URL', () => {
    const url = 'https://example.com/path/to/document.pdf'
    expect(extractFilename(url)).toBe('document.pdf')
  })

  it('extracts filename from URL with query parameters', () => {
    const url = 'https://example.com/file.jpg?token=abc123'
    expect(extractFilename(url)).toBe('file.jpg')
  })

  it('extracts filename from presigned S3 URL', () => {
    const url = 'https://bucket.s3.amazonaws.com/events/event-id/file.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc123'
    expect(extractFilename(url)).toBe('file.pdf')
  })

  it('extracts filename from URL with hash fragment', () => {
    const url = 'https://example.com/image.png#section'
    expect(extractFilename(url)).toBe('image.png')
  })

  it('handles URL without filename extension', () => {
    const url = 'https://example.com/path/to/file'
    expect(extractFilename(url)).toBe('file')
  })

  it('handles URL ending with slash', () => {
    const url = 'https://example.com/path/to/'
    expect(extractFilename(url)).toBe('attachment')
  })

  it('handles URL with multiple dots in filename', () => {
    const url = 'https://example.com/my.file.name.pdf'
    expect(extractFilename(url)).toBe('my.file.name.pdf')
  })

  it('handles invalid URL gracefully', () => {
    const url = 'not-a-valid-url'
    expect(extractFilename(url)).toBe('not-a-valid-url')
  })

  it('handles empty string', () => {
    const url = ''
    expect(extractFilename(url)).toBe('attachment')
  })
})

