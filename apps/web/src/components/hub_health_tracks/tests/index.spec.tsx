import { render, screen } from '@testing-library/react'
import { HubHealthTracks } from '../index'
import type { HealthTrackSummary } from '@/app/[userId]/types'

describe('HubHealthTracks', () => {
  it('renders empty state when no tracks', () => {
    render(<HubHealthTracks tracks={[]} />)

    expect(screen.getByText('Health tracks')).toBeInTheDocument()
    expect(screen.getByText('When you create health tracks they will appear here.')).toBeInTheDocument()
  })

  it('renders tracks when present', () => {
    const tracks: HealthTrackSummary[] = [
      {
        id: '1',
        title: 'Test Track',
        description: 'Test description',
        lastUpdatedLabel: 'Updated today'
      }
    ]

    render(<HubHealthTracks tracks={tracks} />)

    expect(screen.getByText('Test Track')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('Updated today')).toBeInTheDocument()
  })

  it('renders add button when tracks exist', () => {
    const tracks: HealthTrackSummary[] = [
      {
        id: '1',
        title: 'Test Track',
        description: null,
        lastUpdatedLabel: 'Updated today'
      }
    ]

    render(<HubHealthTracks tracks={tracks} />)

    expect(screen.getByLabelText('Add health track')).toBeInTheDocument()
  })
})

