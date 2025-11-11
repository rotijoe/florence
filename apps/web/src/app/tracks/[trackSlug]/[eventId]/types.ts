export type EventPageProps = {
  params: Promise<{
    trackSlug: string
    eventId: string
  }>
}

export type EventLayoutProps = {
  children: React.ReactNode
}
