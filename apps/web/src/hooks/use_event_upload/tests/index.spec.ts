import { renderHook, act } from '@testing-library/react'
import {
  createEventUploadIntentAction,
  confirmEventUploadAction
} from '@/app/[userId]/tracks/[trackSlug]/[eventId]/actions'
import { useEventUpload } from '@hooks/use_event_upload'

// Mock actions
jest.mock('@/app/[userId]/tracks/[trackSlug]/[eventId]/actions', () => ({
  createEventUploadIntentAction: jest.fn(),
  confirmEventUploadAction: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

describe('useEventUpload', () => {
  const mockEventId = 'evt_123'
  const mockTrackSlug = 'track_123'
  const mockUserId = 'user_123'
  const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })
  const mockOnComplete = jest.fn()

  const mockCreateIntent = createEventUploadIntentAction as jest.Mock
  const mockConfirmUpload = confirmEventUploadAction as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true })
  })

  it('should initialize with idle status', () => {
    const { result } = renderHook(() =>
      useEventUpload({ userId: mockUserId, eventId: mockEventId, trackSlug: mockTrackSlug })
    )
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })

  it('should handle successful upload flow', async () => {
    mockCreateIntent.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/upload',
      fileUrl: 'https://s3.example.com/file.txt',
      key: 'uploads/file.txt'
    })
    mockConfirmUpload.mockResolvedValue({
      event: { id: mockEventId }
    })

    const { result } = renderHook(() =>
      useEventUpload({
        userId: mockUserId,
        eventId: mockEventId,
        trackSlug: mockTrackSlug,
        onComplete: mockOnComplete
      })
    )

    await act(async () => {
      await result.current.upload(mockFile)
    })

    expect(result.current.status).toBe('success')
    expect(mockCreateIntent).toHaveBeenCalled()
    expect(global.fetch).toHaveBeenCalledWith('https://s3.example.com/upload', expect.anything())
    expect(mockConfirmUpload).toHaveBeenCalled()
    expect(mockOnComplete).toHaveBeenCalledWith({ id: mockEventId })
  })

  it('should handle intent error', async () => {
    mockCreateIntent.mockResolvedValue({
      error: 'Intent failed'
    })

    const { result } = renderHook(() =>
      useEventUpload({ userId: mockUserId, eventId: mockEventId, trackSlug: mockTrackSlug })
    )

    await act(async () => {
      await result.current.upload(mockFile)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Intent failed')
  })

  it('should handle upload error', async () => {
    mockCreateIntent.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/upload',
      fileUrl: 'https://s3.example.com/file.txt',
      key: 'uploads/file.txt'
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Forbidden'
    })

    const { result } = renderHook(() =>
      useEventUpload({ userId: mockUserId, eventId: mockEventId, trackSlug: mockTrackSlug })
    )

    await act(async () => {
      await result.current.upload(mockFile)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Upload failed: Forbidden')
  })

  it('should reset status and error', () => {
    const { result } = renderHook(() =>
      useEventUpload({ userId: mockUserId, eventId: mockEventId, trackSlug: mockTrackSlug })
    )

    // Set an error state first
    act(() => {
      result.current.upload(mockFile).catch(() => {})
    })

    // Reset the hook
    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })

  it('should handle confirm error', async () => {
    mockCreateIntent.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/upload',
      fileUrl: 'https://s3.example.com/file.txt',
      key: 'uploads/file.txt'
    })
    mockConfirmUpload.mockResolvedValue({
      error: 'Failed to confirm upload'
    })

    const { result } = renderHook(() =>
      useEventUpload({ userId: mockUserId, eventId: mockEventId, trackSlug: mockTrackSlug })
    )

    await act(async () => {
      await result.current.upload(mockFile)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Failed to confirm upload')
  })

  it('should handle confirm error when event is missing', async () => {
    mockCreateIntent.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/upload',
      fileUrl: 'https://s3.example.com/file.txt',
      key: 'uploads/file.txt'
    })
    mockConfirmUpload.mockResolvedValue({
      event: undefined
    })

    const { result } = renderHook(() =>
      useEventUpload({ userId: mockUserId, eventId: mockEventId, trackSlug: mockTrackSlug })
    )

    await act(async () => {
      await result.current.upload(mockFile)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Failed to confirm upload')
  })
})
