import { render, screen } from '@testing-library/react'
import UserHomePage from '../page'
import * as helpers from '../helpers'
import * as fetchUserProfile from '@/lib/fetch_user_profile'
import * as fetchTracks from '@/lib/fetch_tracks'
import * as fetchHubNotifications from '@/lib/fetch_hub_notifications'

// Mock dependencies
jest.mock('../helpers', () => ({
  getGreetingForUser: jest.fn(),
  mapTracksToHealthTrackSummary: jest.fn(),
  fetchUpcomingAppointmentsForHub: jest.fn()
}))

jest.mock('@/lib/fetch_user_profile', () => ({
  fetchUserProfileWithCookies: jest.fn()
}))

jest.mock('@/lib/fetch_tracks', () => ({
  fetchTracksWithCookies: jest.fn()
}))

jest.mock('@/lib/fetch_hub_notifications', () => ({
  fetchHubNotifications: jest.fn()
}))

jest.mock('../constants', () => ({
  WELCOME_SUBTITLE: 'Test subtitle'
}))

jest.mock('@/components/hub_footer', () => ({
  HubFooter: () => <footer data-testid='hub-footer'>Footer</footer>
}))

jest.mock('@/components/hub_health_tracks', () => ({
  HubHealthTracks: ({ tracks, userId }: { tracks: unknown[]; userId: string }) => (
    <div data-testid='hub-health-tracks' data-tracks-count={tracks.length} data-user-id={userId}>
      Health Tracks
    </div>
  )
}))

jest.mock('@/components/reminders_panel', () => ({
  RemindersPanel: ({ notifications }: { notifications: unknown[] }) => (
    <div data-testid='reminders-panel' data-notifications-count={notifications.length}>
      Notifications
    </div>
  )
}))

jest.mock('@/components/hub_quick_actions', () => ({
  HubQuickActions: ({ tracks, userId }: { tracks: unknown[]; userId: string }) => (
    <div data-testid='hub-quick-actions' data-user-id={userId} data-tracks-count={tracks.length}>
      Quick Actions
    </div>
  )
}))

jest.mock('@/components/hub_recent_activity', () => ({
  HubRecentActivity: ({ items }: { items: unknown[] }) => (
    <div data-testid='hub-recent-activity' data-items-count={items.length}>
      Recent Activity
    </div>
  )
}))

jest.mock('@/components/upcoming_events_panel', () => ({
  UpcomingEventsPanel: ({
    upcomingEvents
  }: {
    title: string
    upcomingEvents: Array<{ id: string; title: string; datetime: Date | string; href: string }>
  }) => (
    <div
      data-testid='hub-upcoming-appointments'
      data-appointments-count={upcomingEvents?.length ?? 0}
    >
      Upcoming Appointments
    </div>
  )
}))

jest.mock('@/components/hub_welcome_header', () => ({
  HubWelcomeHeader: ({ greeting, subtitle }: { greeting: string; subtitle: string }) => (
    <div data-testid='hub-welcome-header' data-greeting={greeting} data-subtitle={subtitle}>
      Welcome Header
    </div>
  )
}))

describe('UserHomePage', () => {
  const mockGetGreetingForUser = helpers.getGreetingForUser as jest.Mock
  const mockFetchUserProfileWithCookies = fetchUserProfile.fetchUserProfileWithCookies as jest.Mock
  const mockFetchTracksWithCookies = fetchTracks.fetchTracksWithCookies as jest.Mock
  const mockMapTracksToHealthTrackSummary = helpers.mapTracksToHealthTrackSummary as jest.Mock
  const mockFetchUpcomingAppointmentsForHub = (
    helpers as unknown as { fetchUpcomingAppointmentsForHub: jest.Mock }
  ).fetchUpcomingAppointmentsForHub
  const mockFetchHubNotifications = fetchHubNotifications.fetchHubNotifications as jest.Mock

  const mockUserProfile = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com'
  }

  const mockTracksData = [
    {
      id: 'api-track-1',
      userId: 'user-123',
      title: 'API Sleep Track',
      description: 'API description',
      slug: 'api-sleep',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ]

  const mockMappedTracks = [
    {
      id: 'api-track-1',
      title: 'API Sleep Track',
      description: 'API description',
      slug: 'api-sleep',
      lastUpdatedAt: '2024-01-15T10:00:00Z',
      lastUpdatedLabel: 'Updated today'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetGreetingForUser.mockReturnValue('Welcome back, John Doe')
    mockFetchUserProfileWithCookies.mockResolvedValue(mockUserProfile)
    mockFetchTracksWithCookies.mockResolvedValue(mockTracksData)
    mockMapTracksToHealthTrackSummary.mockReturnValue(mockMappedTracks)
    mockFetchUpcomingAppointmentsForHub.mockResolvedValue([])
    mockFetchHubNotifications.mockResolvedValue([])
  })

  it('should render all hub components', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    expect(screen.getByTestId('hub-welcome-header')).toBeInTheDocument()
    expect(screen.getByTestId('hub-quick-actions')).toBeInTheDocument()
    expect(screen.getByTestId('hub-health-tracks')).toBeInTheDocument()
    expect(screen.getByTestId('hub-upcoming-appointments')).toBeInTheDocument()
    expect(screen.getByTestId('reminders-panel')).toBeInTheDocument()
    expect(screen.getByTestId('hub-recent-activity')).toBeInTheDocument()
    expect(screen.getByTestId('hub-footer')).toBeInTheDocument()
  })

  it('should fetch user profile and tracks with userId from params', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    await UserHomePage({ params })

    expect(mockFetchUserProfileWithCookies).toHaveBeenCalledWith('user-123')
    expect(mockFetchTracksWithCookies).toHaveBeenCalledWith('user-123')
  })

  it('should call getGreetingForUser with user name from profile data', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    await UserHomePage({ params })

    expect(mockGetGreetingForUser).toHaveBeenCalledWith('John Doe')
  })

  it('should pass greeting to HubWelcomeHeader', async () => {
    mockGetGreetingForUser.mockReturnValue('Welcome back, Test User')

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const welcomeHeader = screen.getByTestId('hub-welcome-header')
    expect(welcomeHeader).toHaveAttribute('data-greeting', 'Welcome back, Test User')
  })

  it('should pass subtitle to HubWelcomeHeader', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const welcomeHeader = screen.getByTestId('hub-welcome-header')
    expect(welcomeHeader).toHaveAttribute('data-subtitle', 'Test subtitle')
  })

  it('should pass userId from params to HubQuickActions', async () => {
    const params = Promise.resolve({ userId: 'user-456' })
    const result = await UserHomePage({ params })

    render(result)

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-user-id', 'user-456')
  })

  it('should pass health tracks to HubQuickActions with correct shape', async () => {
    // Mock API to return multiple tracks
    const apiTracksWithMultiple = [
      {
        id: 'api-track-1',
        userId: 'user-123',
        title: 'API Sleep Track',
        description: 'API description',
        slug: 'api-sleep',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'api-track-2',
        userId: 'user-123',
        title: 'API Pain Track',
        description: null,
        slug: 'api-pain',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z'
      }
    ]
    const mappedTracksMultiple = [
      {
        id: 'api-track-1',
        title: 'API Sleep Track',
        description: 'API description',
        slug: 'api-sleep',
        lastUpdatedAt: '2024-01-15T10:00:00Z',
        lastUpdatedLabel: 'Updated today'
      },
      {
        id: 'api-track-2',
        title: 'API Pain Track',
        description: null,
        slug: 'api-pain',
        lastUpdatedAt: '2024-01-16T10:00:00Z',
        lastUpdatedLabel: 'Updated today'
      }
    ]

    mockFetchTracksWithCookies.mockResolvedValue(apiTracksWithMultiple)
    mockMapTracksToHealthTrackSummary.mockReturnValue(mappedTracksMultiple)

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-tracks-count', '2')
  })

  it('should pass notifications to RemindersPanel', async () => {
    mockFetchHubNotifications.mockResolvedValue([
      { id: 'n1', type: 'symptomReminder', title: 'Test 1' },
      { id: 'n2', type: 'appointmentDetails', title: 'Test 2' }
    ])

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const notifications = screen.getByTestId('reminders-panel')
    expect(notifications).toHaveAttribute('data-notifications-count', '2')
  })

  it('should pass health tracks to HubHealthTracks', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const healthTracks = screen.getByTestId('hub-health-tracks')
    expect(healthTracks).toHaveAttribute('data-tracks-count', '1')
  })

  it('should pass appointments to UpcomingEventsPanel', async () => {
    mockFetchUpcomingAppointmentsForHub.mockResolvedValue([
      {
        id: 'a1',
        title: 'GP Visit',
        datetime: '2024-01-10T10:00:00Z',
        href: '/user-123/tracks/sleep/a1'
      },
      {
        id: 'a2',
        title: 'Physio',
        datetime: '2024-01-11T14:00:00Z',
        href: '/user-123/tracks/pain/a2'
      },
      {
        id: 'a3',
        title: 'Dentist',
        datetime: '2024-01-12T09:00:00Z',
        href: '/user-123/tracks/dental/a3'
      }
    ])

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const appointments = screen.getByTestId('hub-upcoming-appointments')
    expect(appointments).toHaveAttribute('data-appointments-count', '3')
  })

  it('should pass empty recent activity to HubRecentActivity', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const recentActivity = screen.getByTestId('hub-recent-activity')
    expect(recentActivity).toHaveAttribute('data-items-count', '0')
  })

  it('should fetch tracks from API and pass to HubHealthTracks', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    expect(mockFetchTracksWithCookies).toHaveBeenCalledWith('user-123')
    expect(mockMapTracksToHealthTrackSummary).toHaveBeenCalledWith(mockTracksData)

    const healthTracks = screen.getByTestId('hub-health-tracks')
    expect(healthTracks).toHaveAttribute('data-tracks-count', '1')
    expect(healthTracks).toHaveAttribute('data-user-id', 'user-123')
  })

  it('should use userId from params consistently for all components', async () => {
    const params = Promise.resolve({ userId: 'user-456' })
    const result = await UserHomePage({ params })

    render(result)

    expect(mockFetchUserProfileWithCookies).toHaveBeenCalledWith('user-456')
    expect(mockFetchTracksWithCookies).toHaveBeenCalledWith('user-456')
    expect(mockFetchUpcomingAppointmentsForHub).toHaveBeenCalledWith('user-456')
    expect(mockFetchHubNotifications).toHaveBeenCalledWith('user-456')

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-user-id', 'user-456')

    const healthTracks = screen.getByTestId('hub-health-tracks')
    expect(healthTracks).toHaveAttribute('data-user-id', 'user-456')
  })
})
