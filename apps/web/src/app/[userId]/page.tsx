import { getServerSession } from '@/lib/auth_server'
import { HubFooter } from '@/components/hub_footer'
import { HubHealthTracks } from '@/components/hub_health_tracks'
import { HubNotifications } from '@/components/hub_notifications'
import { HubQuickActions } from '@/components/hub_quick_actions'
import { buildTrackOptions } from '@/components/hub_quick_actions/helpers'
import { HubRecentActivity } from '@/components/hub_recent_activity'
import { HubUpcomingAppointments } from '@/components/hub_upcoming_appointments'
import { HubWelcomeHeader } from '@/components/hub_welcome_header'
import { buildMockAccountOverviewData, getGreetingForUser } from './helpers'
import { WELCOME_SUBTITLE } from './constants'

interface UserHomePageProps {
  params: Promise<{ userId: string }>
}

export default async function Hub({ params }: UserHomePageProps) {
  const { userId } = await params
  const session = await getServerSession()
  const userName = session?.user?.name ?? userId ?? null

  const overview = buildMockAccountOverviewData(userName)
  const greeting = getGreetingForUser(overview.user.name)
  const trackSummaries = overview.healthTracks
  const quickActionTrackOptions = buildTrackOptions(trackSummaries)

  return (
    <div className='bg-background'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <section className='space-y-4'>
          <HubWelcomeHeader greeting={greeting} subtitle={WELCOME_SUBTITLE} />
          <HubQuickActions tracks={quickActionTrackOptions} userId={userId} />
        </section>

        <section className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]'>
          <div className='space-y-4'>
            <HubHealthTracks tracks={trackSummaries} />
            <HubUpcomingAppointments appointments={overview.appointments} />
          </div>

          <div className='space-y-4'>
            <HubNotifications notifications={overview.notifications} />
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
