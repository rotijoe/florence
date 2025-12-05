import { getFileDetails } from '../helpers'

describe('getFileDetails', () => {
  it('extracts filename from URL', () => {
    const url = 'https://example.com/path/to/document.pdf'
    const result = getFileDetails(url)

    expect(result.filename).toBe('document.pdf')
  })

  it('handles URLs with query parameters', () => {
    const url = 'https://example.com/file.jpg?token=abc123'
    const result = getFileDetails(url)

    expect(result.filename).toBe('file.jpg')
  })

  it('handles URLs with hash fragments', () => {
    const url = 'https://example.com/image.png#section'
    const result = getFileDetails(url)

    expect(result.filename).toBe('image.png')
  })

  it('handles URLs without filename extension', () => {
    const url = 'https://example.com/path/to/file'
    const result = getFileDetails(url)

    expect(result.filename).toBe('file')
    expect(result.fileType).toBe('other')
  })

  it('handles URLs ending with slash', () => {
    const url = 'https://example.com/path/to/'
    const result = getFileDetails(url)

    expect(result.filename).toBe('attachment')
  })

  it('identifies image files correctly', () => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']

    imageExtensions.forEach((ext) => {
      const url = `https://example.com/image.${ext}`
      const result = getFileDetails(url)

      expect(result.fileType).toBe('image')
      expect(result.filename).toBe(`image.${ext}`)
    })
  })

  it('identifies PDF files correctly', () => {
    const url = 'https://example.com/document.PDF'
    const result = getFileDetails(url)

    expect(result.fileType).toBe('pdf')
    expect(result.filename).toBe('document.PDF')
  })

  it('identifies PDF files with lowercase extension', () => {
    const url = 'https://example.com/document.pdf'
    const result = getFileDetails(url)

    expect(result.fileType).toBe('pdf')
  })

  it('identifies Word files correctly', () => {
    const wordExtensions = ['doc', 'docx']

    wordExtensions.forEach((ext) => {
      const url = `https://example.com/document.${ext}`
      const result = getFileDetails(url)

      expect(result.fileType).toBe('word')
      expect(result.filename).toBe(`document.${ext}`)
    })
  })

  it('identifies text files correctly', () => {
    const url = 'https://example.com/document.txt'
    const result = getFileDetails(url)

    expect(result.fileType).toBe('text')
    expect(result.filename).toBe('document.txt')
  })

  it('identifies other file types correctly', () => {
    const otherExtensions = ['zip', 'xlsx', 'csv']

    otherExtensions.forEach((ext) => {
      const url = `https://example.com/file.${ext}`
      const result = getFileDetails(url)

      expect(result.fileType).toBe('other')
      expect(result.filename).toBe(`file.${ext}`)
    })
  })

  it('preserves original URL', () => {
    const url = 'https://example.com/path/to/file.pdf'
    const result = getFileDetails(url)

    expect(result.url).toBe(url)
  })

  it('handles case-insensitive image extensions', () => {
    const url = 'https://example.com/image.JPG'
    const result = getFileDetails(url)

    expect(result.fileType).toBe('image')
  })

  it('handles URLs with multiple dots in filename', () => {
    const url = 'https://example.com/my.file.name.pdf'
    const result = getFileDetails(url)

    expect(result.filename).toBe('my.file.name.pdf')
    expect(result.fileType).toBe('pdf')
  })
})
