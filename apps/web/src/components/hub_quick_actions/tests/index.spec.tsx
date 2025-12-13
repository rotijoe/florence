import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { TrackOption } from '../types'

const pushMock = jest.fn()
const refreshMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  })
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn()
  }
}))

// Prevent Next `use server` modules from being imported in jsdom/Jest
jest.mock('@/app/[userId]/tracks/[trackSlug]/actions', () => ({
  createEventAction: jest.fn()
}))

jest.mock('@/hooks/use_event_upload', () => ({
  useEventUpload: jest.fn(() => ({
    status: 'idle',
    error: null,
    isUploading: false,
    upload: jest.fn(),
    reset: jest.fn()
  }))
}))

// Mock child components
jest.mock('../symptom_dialogue', () => ({
  SymptomDialogue: ({ open, onOpenChange, onSuccess }: any) => {
    if (!open) return null
    return (
      <div data-testid='symptom-dialogue'>
        <button onClick={() => onSuccess?.()}>Trigger Success</button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    )
  }
}))

jest.mock('../document_upload_dialogue', () => ({
  DocumentUploadDialogue: ({ open, onOpenChange, onSuccess }: any) => {
    if (!open) return null
    return (
      <div data-testid='document-upload-dialogue'>
        <button
          onClick={() => onSuccess?.({ eventId: 'event-123', trackSlug: 'test-track' })}
        >
          Trigger Success
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    )
  }
}))

import { toast } from 'sonner'

const { HubQuickActions } = require('../index')

const mockToastSuccess = toast.success as jest.MockedFunction<typeof toast.success>

global.fetch = jest.fn()

function renderComponent(tracks: TrackOption[], onTrackCreated?: () => void) {
  return render(
    <HubQuickActions tracks={tracks} userId='user-123' onTrackCreated={onTrackCreated} />
  )
}

describe('HubQuickActions - event combobox', () => {
  beforeEach(() => {
    pushMock.mockReset()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('navigates to track event create when a track is selected', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      },
      {
        id: 'track-2',
        slug: 'track-two',
        title: 'Track Two',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const eventButton = screen.getByRole('button', { name: /event/i })

    await user.click(eventButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(pushMock).toHaveBeenCalledWith(
      `/user-123/tracks/track-one/new?returnTo=${encodeURIComponent('/user-123')}`
    )
  })

  it('disables the event button and shows tooltip guidance when there are no tracks', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const eventButton = screen.getByRole('button', { name: /event/i })

    expect(eventButton).toBeDisabled()

    await user.hover(eventButton)

    const tooltips = await screen.findAllByRole('tooltip')

    expect(tooltips[0]).toHaveTextContent('Add a track before creating events')
  })
})

describe('HubQuickActions - track button', () => {
  beforeEach(() => {
    pushMock.mockReset()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('opens track create dialog when track button is clicked', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const trackButton = screen.getByRole('button', { name: /track/i })

    await user.click(trackButton)

    expect(screen.getByRole('heading', { name: /create new health track/i })).toBeInTheDocument()
  })

  it('closes track create dialog when cancel is clicked', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const trackButton = screen.getByRole('button', { name: /track/i })

    await user.click(trackButton)
    expect(screen.getByRole('heading', { name: /create new health track/i })).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(
      screen.queryByRole('heading', { name: /create new health track/i })
    ).not.toBeInTheDocument()
  })

  it('calls onTrackCreated callback when track is successfully created', async () => {
    const mockOnTrackCreated = jest.fn()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'track-1',
          title: 'New Track',
          slug: 'new-track',
          description: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    })

    renderComponent([], mockOnTrackCreated)

    const user = userEvent.setup()
    const trackButton = screen.getByRole('button', { name: /track/i })

    await user.click(trackButton)

    const titleInput = screen.getByLabelText(/track name/i)
    await user.type(titleInput, 'New Track')

    const submitButton = screen.getByRole('button', { name: /^create$/i })
    await user.click(submitButton)

    await screen.findByRole('button', { name: /track/i })

    expect(mockOnTrackCreated).toHaveBeenCalled()
  })
})

describe('HubQuickActions - document button', () => {
  beforeEach(() => {
    pushMock.mockReset()
    refreshMock.mockReset()
    mockToastSuccess.mockReset()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('disables the document button and shows tooltip guidance when there are no tracks', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    expect(documentButton).toBeDisabled()

    await user.hover(documentButton)

    const tooltips = await screen.findAllByRole('tooltip')

    expect(tooltips[0]).toHaveTextContent('Add a track before uploading documents')
  })

  it('opens document upload dialog when a track is selected from dropdown', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      },
      {
        id: 'track-2',
        slug: 'track-two',
        title: 'Track Two',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    await user.click(documentButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(screen.getByTestId('document-upload-dialogue')).toBeInTheDocument()
  })

  it('closes document upload dialog when close is clicked', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    await user.click(documentButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(screen.getByTestId('document-upload-dialogue')).toBeInTheDocument()

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(screen.queryByTestId('document-upload-dialogue')).not.toBeInTheDocument()
  })

  it('refreshes page and shows toast with link when document upload succeeds', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: 'track-one',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    await user.click(documentButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(screen.getByTestId('document-upload-dialogue')).toBeInTheDocument()

    const triggerSuccessButton = screen.getByRole('button', { name: /trigger success/i })
    await user.click(triggerSuccessButton)

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled()
      expect(mockToastSuccess).toHaveBeenCalledWith('Document uploaded successfully', {
        action: expect.objectContaining({
          label: 'View event',
          onClick: expect.any(Function)
        })
      })
    })

    // Test toast action onClick navigates to event detail
    const toastCall = mockToastSuccess.mock.calls[0]
    const toastOptions = toastCall[1] as { action?: { label: string; onClick: () => void } }
    if (toastOptions?.action?.onClick) {
      toastOptions.action.onClick()
    }

    expect(pushMock).toHaveBeenCalledWith('/user-123/tracks/test-track/event-123')
  })

  it('does not navigate when event track has empty slug', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: '',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const eventButton = screen.getByRole('button', { name: /event/i })

    await user.click(eventButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(pushMock).not.toHaveBeenCalled()
  })

  it('does not open document dialog when track has empty slug', async () => {
    const tracks: TrackOption[] = [
      {
        id: 'track-1',
        slug: '',
        title: 'Track One',
        lastUpdatedAt: new Date().toISOString()
      }
    ]

    renderComponent(tracks)

    const user = userEvent.setup()
    const documentButton = screen.getByRole('button', { name: /document/i })

    await user.click(documentButton)
    const trackItem = await screen.findByText('Track One')
    await user.click(trackItem)

    expect(screen.queryByTestId('document-upload-dialogue')).not.toBeInTheDocument()
  })
})

describe('HubQuickActions - symptom button', () => {
  beforeEach(() => {
    pushMock.mockReset()
    refreshMock.mockReset()
    mockToastSuccess.mockReset()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('opens symptom dialog when Log symptom button is clicked', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const symptomButton = screen.getByRole('button', { name: /log symptom/i })

    await user.click(symptomButton)

    expect(screen.getByTestId('symptom-dialogue')).toBeInTheDocument()
  })

  it('closes symptom dialog when success is triggered', async () => {
    renderComponent([])

    const user = userEvent.setup()
    const symptomButton = screen.getByRole('button', { name: /log symptom/i })

    await user.click(symptomButton)
    expect(screen.getByTestId('symptom-dialogue')).toBeInTheDocument()

    const triggerSuccessButton = screen.getByRole('button', { name: /trigger success/i })
    await user.click(triggerSuccessButton)

    await waitFor(() => {
      expect(screen.queryByTestId('symptom-dialogue')).not.toBeInTheDocument()
    })
  })
})
