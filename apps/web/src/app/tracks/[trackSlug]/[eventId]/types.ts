export type EventPageProps = {
  params: Promise<{
    trackSlug: string
    eventId: string
  }>
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export type EventLayoutProps = {
  children: React.ReactNode
}
