import { fetchTracksWithCookies } from '@/lib/fetch_tracks'
import { TracksPageClient } from './tracks_page_client'

interface TracksPageProps {
  params: Promise<{ userId: string }>
}

export default async function TracksPage({ params }: TracksPageProps) {
  const { userId } = await params

  // Layout already validates userId matches session, so we can trust it here
  const tracks = await fetchTracksWithCookies(userId)

  return <TracksPageClient userId={userId} tracks={tracks} />
}
