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
  getWelcomeSubtitle: jest.fn()
}))

jest.mock('@/components/hub_footer', () => ({
  HubFooter: () => <footer data-testid='hub-footer'>Footer</footer>
}))

jest.mock('@/components/hub_health_tracks', () => ({
  HubHealthTracks: ({ tracks }: { tracks: unknown[] }) => (
    <div data-testid='hub-health-tracks' data-tracks-count={tracks.length}>
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
  HubQuickActions: ({
    eventOptions,
    tracks,
    userId
  }: {
    eventOptions: unknown[]
    tracks: unknown[]
    userId: string
  }) => (
    <div
      data-testid='hub-quick-actions'
      data-user-id={userId}
      data-tracks-count={tracks.length}
      data-event-options-count={eventOptions.length}
    >
      Quick Actions
    </div>
  )
}))

jest.mock('@/components/hub_quick_actions/constants', () => ({
  HUB_EVENT_QUICK_ACTIONS: [
    { id: 'action-1', label: 'Action 1' },
    { id: 'action-2', label: 'Action 2' }
  ]
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
  const mockGetWelcomeSubtitle = helpers.getWelcomeSubtitle as jest.Mock

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

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', name: 'John Doe' }
    })
    mockBuildMockAccountOverviewData.mockReturnValue(mockOverviewData)
    mockGetGreetingForUser.mockReturnValue('Welcome back, John Doe')
    mockGetWelcomeSubtitle.mockReturnValue('Test subtitle')
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
    mockGetWelcomeSubtitle.mockReturnValue('Custom subtitle message')

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const welcomeHeader = screen.getByTestId('hub-welcome-header')
    expect(welcomeHeader).toHaveAttribute('data-subtitle', 'Custom subtitle message')
  })

  it('should pass userId to HubQuickActions', async () => {
    const params = Promise.resolve({ userId: 'user-456' })
    const result = await UserHomePage({ params })

    render(result)

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-user-id', 'user-456')
  })

  it('should pass health tracks to HubQuickActions with correct shape', async () => {
    const tracksWithDates = {
      ...mockOverviewData,
      healthTracks: [
        {
          id: 'track-1',
          title: 'Sleep',
          slug: 'sleep',
          lastUpdatedAt: new Date('2024-01-01')
        },
        {
          id: 'track-2',
          title: 'Pain',
          slug: 'pain',
          lastUpdatedAt: new Date('2024-01-02')
        }
      ]
    }
    mockBuildMockAccountOverviewData.mockReturnValue(tracksWithDates)

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserHomePage({ params })

    render(result)

    const quickActions = screen.getByTestId('hub-quick-actions')
    expect(quickActions).toHaveAttribute('data-tracks-count', '2')
  })

  it('should pass notifications to HubNotifications', async () => {
    const dataWithNotifications = {
      ...mockOverviewData,
      notifications: [
        { id: 'n1', type: 'symptomReminder', title: 'Test 1' },
        { id: 'n2', type: 'appointmentDetails', title: 'Test 2' }
      ]
    }
    mockBuildMockAccountOverviewData.mockReturnValue(dataWithNotifications)

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
    const dataWithAppointments = {
      ...mockOverviewData,
      appointments: [
        { id: 'a1', title: 'GP Visit' },
        { id: 'a2', title: 'Physio' },
        { id: 'a3', title: 'Dentist' }
      ]
    }
    mockBuildMockAccountOverviewData.mockReturnValue(dataWithAppointments)

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

  it('should call getWelcomeSubtitle', async () => {
    const params = Promise.resolve({ userId: 'user-123' })
    await UserHomePage({ params })

    expect(mockGetWelcomeSubtitle).toHaveBeenCalled()
  })
})

