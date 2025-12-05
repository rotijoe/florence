import { render, screen } from '@testing-library/react'
import { DocumentViewer } from '../index'

describe('DocumentViewer', () => {
  it('renders image when fileType is image', () => {
    const url = 'https://example.com/image.jpg'
    render(<DocumentViewer url={url} fileType='image' />)

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', url)
  })

  it('renders iframe when fileType is pdf', () => {
    const url = 'https://example.com/document.pdf'
    render(<DocumentViewer url={url} fileType='pdf' />)

    const iframe = screen.getByTitle('document.pdf')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', url)
    expect(iframe.tagName).toBe('IFRAME')
  })

  it('renders iframe when fileType is text', () => {
    const url = 'https://example.com/file.txt'
    render(<DocumentViewer url={url} fileType='text' />)

    const iframe = screen.getByTitle('file.txt')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', url)
    expect(iframe.tagName).toBe('IFRAME')
  })

  it('renders fallback message when fileType is word', () => {
    const url = 'https://example.com/document.docx'
    render(<DocumentViewer url={url} fileType='word' />)

    expect(screen.getByText(/this file type cannot be previewed/i)).toBeInTheDocument()
    const downloadLink = screen.getByRole('link', { name: /download file/i })
    expect(downloadLink).toBeInTheDocument()
    expect(downloadLink).toHaveAttribute('href', url)
    expect(downloadLink).toHaveAttribute('target', '_blank')
  })

  it('renders fallback message when fileType is other', () => {
    const url = 'https://example.com/file.xyz'
    render(<DocumentViewer url={url} fileType='other' />)

    expect(screen.getByText(/this file type cannot be previewed/i)).toBeInTheDocument()
    const downloadLink = screen.getByRole('link', { name: /download file/i })
    expect(downloadLink).toBeInTheDocument()
    expect(downloadLink).toHaveAttribute('href', url)
    expect(downloadLink).toHaveAttribute('target', '_blank')
  })

  it('uses filename from URL for image alt text', () => {
    const url = 'https://example.com/path/to/my-image.png'
    render(<DocumentViewer url={url} fileType='image' />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'my-image.png')
  })

  it('handles URL without filename gracefully for image', () => {
    const url = 'https://example.com/'
    render(<DocumentViewer url={url} fileType='image' />)

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
  })

  it('handles URL without filename gracefully for iframe', () => {
    const url = 'https://example.com/'
    render(<DocumentViewer url={url} fileType='pdf' />)

    const iframe = screen.getByTitle('attachment')
    expect(iframe).toBeInTheDocument()
  })

  it('extracts filename correctly from presigned S3 URL with query parameters', () => {
    const url =
      'https://bucket.s3.amazonaws.com/events/event-id/document.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc123'
    render(<DocumentViewer url={url} fileType='pdf' />)

    const iframe = screen.getByTitle('document.pdf')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', url)
  })

  it('extracts filename correctly from presigned S3 URL for images', () => {
    const url = 'https://bucket.s3.amazonaws.com/events/event-id/image.jpg?X-Amz-Signature=xyz789'
    render(<DocumentViewer url={url} fileType='image' />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'image.jpg')
    expect(img).toHaveAttribute('src', url)
  })
})
