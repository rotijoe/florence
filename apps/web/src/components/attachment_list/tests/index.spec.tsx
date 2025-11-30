import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventAttachment } from '../index'

// Mock DocumentViewer to verify it's rendered with correct props
const mockDocumentViewer = jest.fn(({ url, fileType }: { url: string; fileType: string }) => (
  <div data-testid="document-viewer" data-url={url} data-file-type={fileType}>
    Document Viewer
  </div>
))

jest.mock('@/components/document_viewer', () => ({
  DocumentViewer: (props: { url: string; fileType: string }) => mockDocumentViewer(props)
}))

describe('EventAttachment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when fileUrl is null', () => {
    const { container } = render(<EventAttachment fileUrl={null} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when fileUrl is undefined', () => {
    const { container } = render(<EventAttachment fileUrl={undefined} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders attachment header with filename when fileUrl is provided', () => {
    const url = 'https://example.com/document.pdf'
    render(<EventAttachment fileUrl={url} />)

    expect(screen.getByText('Attachments')).toBeInTheDocument()
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
  })

  it('renders Delete button', () => {
    const url = 'https://example.com/document.pdf'
    render(<EventAttachment fileUrl={url} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })

    expect(deleteButton).toBeInTheDocument()
  })

  it('renders DocumentViewer with correct props when fileUrl is provided', () => {
    const url = 'https://example.com/document.pdf'
    render(<EventAttachment fileUrl={url} />)

    expect(mockDocumentViewer).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        fileType: 'pdf'
      })
    )

    expect(screen.getByTestId('document-viewer')).toBeInTheDocument()
  })

  it('renders DocumentViewer for image files', () => {
    const url = 'https://example.com/image.jpg'
    render(<EventAttachment fileUrl={url} />)

    expect(mockDocumentViewer).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        fileType: 'image'
      })
    )
  })

  it('renders DocumentViewer for text files', () => {
    const url = 'https://example.com/file.txt'
    render(<EventAttachment fileUrl={url} />)

    expect(mockDocumentViewer).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        fileType: 'text'
      })
    )
  })

  it('renders DocumentViewer for word files', () => {
    const url = 'https://example.com/document.docx'
    render(<EventAttachment fileUrl={url} />)

    expect(mockDocumentViewer).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        fileType: 'word'
      })
    )
  })

  it('renders DocumentViewer for other file types', () => {
    const url = 'https://example.com/file.xyz'
    render(<EventAttachment fileUrl={url} />)

    expect(mockDocumentViewer).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        fileType: 'other'
      })
    )
  })

  it('does not trigger expansion when Delete button is clicked', async () => {
    const user = userEvent.setup()
    const url = 'https://example.com/document.pdf'
    render(<EventAttachment fileUrl={url} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })

    // DocumentViewer should already be rendered (always visible)
    expect(screen.getByTestId('document-viewer')).toBeInTheDocument()

    await user.click(deleteButton)

    // DocumentViewer should still be rendered (no change)
    expect(screen.getByTestId('document-viewer')).toBeInTheDocument()
    expect(mockDocumentViewer).toHaveBeenCalledTimes(1)
  })

  it('handles URLs with query parameters', () => {
    const url = 'https://example.com/file.pdf?token=abc123'
    render(<EventAttachment fileUrl={url} />)

    expect(screen.getByText('file.pdf')).toBeInTheDocument()
  })

  it('handles URLs with hash fragments', () => {
    const url = 'https://example.com/file.pdf#section'
    render(<EventAttachment fileUrl={url} />)

    expect(screen.getByText('file.pdf')).toBeInTheDocument()
  })

  it('calls onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnDelete = jest.fn()
    const url = 'https://example.com/document.pdf'
    render(<EventAttachment fileUrl={url} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('does not call onDelete when Delete button is clicked but onDelete is not provided', async () => {
    const user = userEvent.setup()
    const url = 'https://example.com/document.pdf'
    render(<EventAttachment fileUrl={url} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Should not throw error, just do nothing
    expect(deleteButton).toBeInTheDocument()
  })
})
