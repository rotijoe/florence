export type NewEventPageProps = {
  params: Promise<{
    userId: string
    trackSlug: string
  }>
}

export type NewEventLayoutProps = {
  children: React.ReactNode
}
