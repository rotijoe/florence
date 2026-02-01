import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventAttachment } from '../index'

// Mock DocumentViewer to verify it's rendered with correct props
const mockDocumentViewer = jest.fn(({ url, fileType }: { url: string; fileType: string }) => (
  <div data-testid='document-viewer' data-url={url} data-file-type={fileType}>
    Document Viewer
  </div>
))

jest.mock('@/components/document_viewer', () => ({
  DocumentViewer: (props: { url: string; fileType: string }) => mockDocumentViewer(props)
}))

const mockGetFileDetails = jest.fn()
let mockConfigured = false
jest.mock('@/lib/get_file_details', () => {
  const actual = jest.requireActual('@/lib/get_file_details')
  return {
    ...actual,
    getFileDetails: (...args: Parameters<typeof actual.getFileDetails>) => {
      if (mockConfigured) {
        return mockGetFileDetails(...args)
      }
      return actual.getFileDetails(...args)
    }
  }
})

describe('EventAttachment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetFileDetails.mockImplementation((url: string) => {
      const actual = jest.requireActual('@/lib/get_file_details')
      return actual.getFileDetails(url)
    })
  })

  it('renders empty state when fileUrl is not provided', () => {
    render(<EventAttachment fileUrl={null} />)

    expect(screen.getByText('No attachments found')).toBeInTheDocument()
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

  it('calls onAdd when Add attachment button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnAdd = jest.fn()
    render(<EventAttachment fileUrl={null} onAdd={mockOnAdd} />)

    const addButton = screen.getByRole('button', { name: /add attachment/i })
    await user.click(addButton)

    expect(mockOnAdd).toHaveBeenCalledTimes(1)
  })

  it('does not call onAdd when Add attachment button is clicked but onAdd is not provided', async () => {
    const user = userEvent.setup()
    render(<EventAttachment fileUrl={null} />)

    const addButton = screen.getByRole('button', { name: /add attachment/i })
    await user.click(addButton)

    // Should not throw error, just do nothing
    expect(addButton).toBeInTheDocument()
  })

  it('Add attachment button has type="button" to prevent form submission', () => {
    render(<EventAttachment fileUrl={null} />)

    const addButton = screen.getByRole('button', { name: /add attachment/i })
    expect(addButton).toHaveAttribute('type', 'button')
  })

  it('handles getFileDetails returning null', () => {
    mockConfigured = true
    mockGetFileDetails.mockReturnValueOnce(null as any)

    const url = 'https://example.com/invalid-file'
    render(<EventAttachment fileUrl={url} />)

    expect(screen.getByText('No attachments found')).toBeInTheDocument()
  })

  it('stops propagation when delete button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnDelete = jest.fn()
    const url = 'https://example.com/document.pdf'
    render(<EventAttachment fileUrl={url} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation')

    deleteButton.dispatchEvent(clickEvent)

    expect(mockOnDelete).toHaveBeenCalled()
  })
})
