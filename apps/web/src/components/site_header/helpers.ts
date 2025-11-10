export interface BreadcrumbItem {
  label: string
  href: string
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Always start with Home
  breadcrumbs.push({ label: 'home', href: '/' })

  if (segments.length === 0) {
    return breadcrumbs
  }

  // Handle dashboard
  if (segments[0] === 'tracks' && segments.length === 1) {
    breadcrumbs.push({ label: 'tracks', href: '/tracks' })
    return breadcrumbs
  }

  // Handle tracks routes
  if (segments[0] === 'tracks' && segments.length >= 2) {
    const trackSlug = segments[1]
    breadcrumbs.push({ label: 'tracks', href: '/tracks' })

    // Use track slug as label (will be updated by layout if needed)
    breadcrumbs.push({ label: trackSlug, href: `/tracks/${trackSlug}` })

    // If there's an eventId
    if (segments.length >= 3) {
      const eventId = segments[2]
      breadcrumbs.push({
        label: 'event',
        href: `/tracks/${trackSlug}/${eventId}`,
      })
    }

    return breadcrumbs
  }

  // Fallback for unknown routes
  return breadcrumbs
}
