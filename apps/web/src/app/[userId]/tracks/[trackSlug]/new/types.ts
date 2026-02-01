export type NewEventPageProps = {
  params: Promise<{
    userId: string
    trackSlug: string
  }>
  searchParams?: Promise<{
    type?: string
    returnTo?: string
  }>
}

export type NewEventLayoutProps = {
  children: React.ReactNode
}
