import { render, screen } from '@testing-library/react'
import TracksPage from '../page'
import { fetchTracksWithCookies } from '@/lib/fetch_tracks'
import type { TrackResponse } from '@packages/types'

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

jest.mock('@/lib/fetch_tracks', () => ({
  fetchTracksWithCookies: jest.fn()
}))

jest.mock('../tracks_page_client', () => ({
  TracksPageClient: ({ userId, tracks }: { userId: string; tracks: TrackResponse[] }) => (
    <div data-testid='tracks-page-client' data-user-id={userId} data-tracks-count={tracks.length}>
      TracksPageClient
    </div>
  )
}))

describe('TracksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch tracks and render TracksPageClient', async () => {
    const mockTracks: TrackResponse[] = [
      {
        id: 'track-1',
        userId: 'user-123',
        title: 'Diabetes Management',
        slug: 'diabetes-management',
        description: 'Tracking blood sugar',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    ;(fetchTracksWithCookies as jest.Mock).mockResolvedValue(mockTracks)

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await TracksPage({ params })

    render(result)

    expect(fetchTracksWithCookies).toHaveBeenCalledWith('user-123')
    expect(screen.getByTestId('tracks-page-client')).toBeInTheDocument()
    expect(screen.getByTestId('tracks-page-client')).toHaveAttribute('data-user-id', 'user-123')
    expect(screen.getByTestId('tracks-page-client')).toHaveAttribute('data-tracks-count', '1')
  })

  it('should pass empty tracks array when user has no tracks', async () => {
    ;(fetchTracksWithCookies as jest.Mock).mockResolvedValue([])

    const params = Promise.resolve({ userId: 'user-456' })
    const result = await TracksPage({ params })

    render(result)

    expect(fetchTracksWithCookies).toHaveBeenCalledWith('user-456')
    expect(screen.getByTestId('tracks-page-client')).toHaveAttribute('data-tracks-count', '0')
  })
})
