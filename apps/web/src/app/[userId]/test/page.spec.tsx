import { render, screen } from '@testing-library/react'
import UserHomePage from '../page'
import { getServerSession } from '@/lib/auth_server'
import * as helpers from '../helpers'

// Mock dependencies
jest.mock('@/lib/auth_server', () => ({
  getServerSession: jest.fn()
}))

jest.mock('../helpers', () => ({
  buildMockAccountOverviewData: jest.fn(),
  getGreetingForUser: jest.fn(),
  fetchUserMeWithCookies: jest.fn(),
  mapTracksToHealthTrackSummary: jest.fn(),
  fetchUpcomingAppointmentsForHub: jest.fn(),
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

jest.mock('@/components/hub_notifications', () => ({
  HubNotifications: ({ notifications }: { notifications: unknown[] }) => (
    <div data-testid='hub-notifications' data-notifications-count={notifications.length}>
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

jest.mock('@/components/hub_upcoming_appointments', () => ({
  HubUpcomingAppointments: ({ appointments }: { appointments: unknown[] }) => (
    <div data-testid='hub-upcoming-appointments' data-appointments-count={appointments.length}>
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
  const mockGetServerSession = getServerSession as jest.Mock
  const mockBuildMockAccountOverviewData = helpers.buildMockAccountOverviewData as jest.Mock
  const mockGetGreetingForUser = helpers.getGreetingForUser as jest.Mock
  const mockFetchUserMeWithCookies = helpers.fetchUserMeWithCookies as jest.Mock
  const mockMapTracksToHealthTrackSummary = helpers.mapTracksToHealthTrackSummary as jest.Mock
  const mockFetchUpcomingAppointmentsForHub = (
    helpers as unknown as { fetchUpcomingAppointmentsForHub: jest.Mock }
  ).fetchUpcomingAppointmentsForHub
  const mockFetchHubNotifications = (
    helpers as unknown as { fetchHubNotifications: jest.Mock }
  ).fetchHubNotifications

  const mockOverviewData = {
    user: { id: 'user-123', name: 'John Doe' },
    notifications: [{ id: 'notif-1', type: 'symptomReminder', title: 'Test' }],
    healthTracks: [
      {
        id: 'track-1',
        title: 'Sleep',
        slug: 'sleep',
        lastUpdatedAt: new Date('2024-01-01')
      }
    ],
    appointments: [{ id: 'appt-1', title: 'GP Visit' }],
    recentActivity: []
  }

  const mockUserMeData = {
    id: 'user-api-456',
    name: 'API User',
    email: 'api@example.com',
    tracks: [
      {
        id: 'api-track-1',
        title: 'API Sleep Track',
        description: 'API description',
        slug: 'api-sleep',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]
  }

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
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', name: 'John Doe' }
    })
    mockBuildMockAccountOverviewData.mockReturnValue(mockOverviewData)
    mockGetGreetingForUser.mockReturnValue('Welcome back, John Doe')
    mockFetchUserMeWithCookies.mockResolvedValue(mockUserMeData)
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
    expect(screen.getByTestId('hub-notifications')).toBeInTheDocument()
    expect(screen.getByTestId('hub-recent-activity')).toBeInTheDocument()
    expect(screen.getByTestId('hub-footer')).toBeInTheDocument()
  })

  it('should use session user name for building overview data', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', name: 'Jane Smith' }
    })

    const params = Promise.resolve({ userId: 'user-123' })
    await UserHomePage({ params })

    expect(mockBuildMockAccountOverviewData).toHaveBeenCalledWith('Jane Smith')
  })

  it('should use userId as fallback when session user name is null', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', name: null }
    })

    const params = Promise.resolve({ userId: 'user-123' })
    await UserHomePage({ params })

    expect(mockBuildMockAccountOverviewData).toHaveBeenCalledWith('user-123')
  })

  it('should use userId as fallback when session is null', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const params = Promise.resolve({ userId: 'user-123' })
    await UserHomePage({ params })

    expect(mockBuildMockAccountOverviewData).toHaveBeenCalledWith('user-123')
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

  it('should pass userId to HubQuickActions', async () => {
    // Mock API to fail so it falls back to params userId
    mockFetchUserMeWithCookies.mockRejectedValue(new Error('API Error'))

    const params = Promise.resolve({ userId: 'user-456' })
    const result = await UserHomePage({ params })

    render(result)

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-user-id', 'user-456')
  })

  it('should pass health tracks to HubQuickActions with correct shape', async () => {
    // Mock API to return multiple tracks
    const apiTracksWithMultiple = {
      ...mockUserMeData,
      tracks: [
        {
          id: 'api-track-1',
          title: 'API Sleep Track',
          description: 'API description',
          slug: 'api-sleep',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'api-track-2',
          title: 'API Pain Track',
          description: null,
          slug: 'api-pain',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-16T10:00:00Z'
        }
      ]
    }
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

    mockFetchUserMeWithCookies.mockResolvedValue(apiTracksWithMultiple)
    mockMapTracksToHealthTrackSummary.mockReturnValue(mappedTracksMultiple)

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-tracks-count', '2')
  })

  it('should pass notifications to HubNotifications', async () => {
    mockFetchHubNotifications.mockResolvedValue([
      { id: 'n1', type: 'symptomReminder', title: 'Test 1' },
      { id: 'n2', type: 'appointmentDetails', title: 'Test 2' }
    ])

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const notifications = screen.getByTestId('hub-notifications')
    expect(notifications).toHaveAttribute('data-notifications-count', '2')
  })

  it('should pass health tracks to HubHealthTracks', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const healthTracks = screen.getByTestId('hub-health-tracks')
    expect(healthTracks).toHaveAttribute('data-tracks-count', '1')
  })

  it('should pass appointments to HubUpcomingAppointments', async () => {
    mockFetchUpcomingAppointmentsForHub.mockResolvedValue([
      { id: 'a1', title: 'GP Visit', datetimeLabel: 'Mon, 10 Jan · 10:00', href: '/user-123/tracks/sleep/a1' },
      { id: 'a2', title: 'Physio', datetimeLabel: 'Tue, 11 Jan · 14:00', href: '/user-123/tracks/pain/a2' },
      { id: 'a3', title: 'Dentist', datetimeLabel: 'Wed, 12 Jan · 09:00', href: '/user-123/tracks/dental/a3' }
    ])

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const appointments = screen.getByTestId('hub-upcoming-appointments')
    expect(appointments).toHaveAttribute('data-appointments-count', '3')
  })

  it('should pass recent activity to HubRecentActivity', async () => {
    const dataWithActivity = {
      ...mockOverviewData,
      recentActivity: [{ id: 'ra1', label: 'Activity 1' }]
    }
    mockBuildMockAccountOverviewData.mockReturnValue(dataWithActivity)

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const recentActivity = screen.getByTestId('hub-recent-activity')
    expect(recentActivity).toHaveAttribute('data-items-count', '1')
  })

  it('should call getGreetingForUser with user name from overview data', async () => {
    mockBuildMockAccountOverviewData.mockReturnValue({
      ...mockOverviewData,
      user: { id: 'user-123', name: 'Alice' }
    })

    const params = Promise.resolve({ userId: 'user-123' })
    await UserHomePage({ params })

    expect(mockGetGreetingForUser).toHaveBeenCalledWith('Alice')
  })

  it('should fetch tracks from API and pass to HubHealthTracks', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    expect(mockFetchUserMeWithCookies).toHaveBeenCalledWith('user-123')
    expect(mockMapTracksToHealthTrackSummary).toHaveBeenCalledWith(mockUserMeData.tracks)

    const healthTracks = screen.getByTestId('hub-health-tracks')
    expect(healthTracks).toHaveAttribute('data-tracks-count', '1')
    expect(healthTracks).toHaveAttribute('data-user-id', 'user-api-456')
  })

  it('should use API userId for HubQuickActions when API succeeds', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-user-id', 'user-api-456')
  })

  it('should handle API failure gracefully with empty tracks', async () => {
    mockFetchUserMeWithCookies.mockRejectedValue(new Error('API Error'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user data:', expect.any(Error))

    const healthTracks = screen.getByTestId('hub-health-tracks')
    expect(healthTracks).toHaveAttribute('data-tracks-count', '0')
    expect(healthTracks).toHaveAttribute('data-user-id', 'user-123')

    consoleSpy.mockRestore()
  })

  it('should use API userId when API succeeds, even if different from params userId', async () => {
    const params = Promise.resolve({ userId: 'param-user-789' })
    const result = await UserHomePage({ params })

    render(result)

    const healthTracks = screen.getByTestId('hub-health-tracks')
    expect(healthTracks).toHaveAttribute('data-user-id', 'user-api-456')

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-user-id', 'user-api-456')
  })
})
