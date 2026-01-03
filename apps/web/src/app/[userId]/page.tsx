import { getServerSession } from '@/lib/auth_server'
import { HubFooter } from '@/components/hub_footer'
import { HubHealthTracks } from '@/components/hub_health_tracks'
import { RemindersPanel } from '@/components/reminders_panel'
import { HubQuickActions } from '@/components/hub_quick_actions'
import { buildTrackOptions } from '@/components/hub_quick_actions/helpers'
import { HubRecentActivity } from '@/components/hub_recent_activity'
import { UpcomingEventsPanel } from '@/components/upcoming_events_panel'
import type { UpcomingEvent } from '@/components/upcoming_events_panel/types'
import { HubWelcomeHeader } from '@/components/hub_welcome_header'
import {
  buildMockAccountOverviewData,
  getGreetingForUser,
  fetchUserMeWithCookies,
  mapTracksToHealthTrackSummary,
  fetchUpcomingAppointmentsForHub,
  fetchHubNotifications
} from './helpers'
import { WELCOME_SUBTITLE } from './constants'
import { HealthTrackSummary, Notification } from './types'

interface UserHomePageProps {
  params: Promise<{ userId: string }>
}

export default async function Hub({ params }: UserHomePageProps) {
  const { userId } = await params
  const session = await getServerSession()
  const userName = session?.user?.name ?? userId ?? null

  const overview = buildMockAccountOverviewData(userName)
  const greeting = getGreetingForUser(overview.user.name)

  // Fetch real tracks from API
  let tracks: HealthTrackSummary[] = []
  let actualUserId = userId
  let upcomingEvents: UpcomingEvent[] = []
  let notifications: Notification[] = []

  try {
    if (session?.user?.id) {
      const userMe = await fetchUserMeWithCookies(session.user.id)
      actualUserId = userMe.id
      tracks = mapTracksToHealthTrackSummary(userMe.tracks)
      upcomingEvents = await fetchUpcomingAppointmentsForHub(actualUserId)
      notifications = await fetchHubNotifications(actualUserId)
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  }

  const quickActionTrackOptions = buildTrackOptions(tracks)

  return (
    <div className='bg-background'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <section className='space-y-4'>
          <HubWelcomeHeader greeting={greeting} subtitle={WELCOME_SUBTITLE} />
          <HubQuickActions tracks={quickActionTrackOptions} userId={actualUserId} />
        </section>

        <section className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]'>
          <div className='space-y-4'>
            <HubHealthTracks userId={actualUserId} tracks={tracks} />
            <UpcomingEventsPanel title='Upcoming appointments' upcomingEvents={upcomingEvents} />
          </div>

          <div className='space-y-4'>
            <RemindersPanel
              notifications={notifications}
              tracks={quickActionTrackOptions}
              userId={actualUserId}
              title='Notifications'
            />
            <HubRecentActivity items={overview.recentActivity} />
          </div>
        </section>

        <section>
          <HubFooter />
        </section>
      </div>
    </div>
  )
}
