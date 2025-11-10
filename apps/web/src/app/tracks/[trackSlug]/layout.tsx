import type { TrackLayoutProps } from './types'

export default async function TrackLayout({
  children,
  tracklist,
  event,
  params,
}: TrackLayoutProps) {
  await params // Ensure params are awaited

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:overflow-y-auto md:max-h-[calc(100vh-8rem)]">
          <div className="hidden md:block">{tracklist}</div>
          <div className="block md:hidden">{children}</div>
        </div>
        <div className="hidden md:block md:overflow-y-auto md:max-h-[calc(100vh-8rem)]">
          {event}
        </div>
      </div>
    </div>
  )
}
