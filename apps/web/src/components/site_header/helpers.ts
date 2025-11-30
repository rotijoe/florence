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

  // Handle routes with userId: /[userId]/tracks/[trackSlug] or /[userId]/tracks/[trackSlug]/[eventId]
  if (segments.length >= 2 && segments[1] === 'tracks') {
    const userId = segments[0]
    const basePath = `/${userId}/tracks`

    // Add tracks breadcrumb
    breadcrumbs.push({ label: 'tracks', href: basePath })

    // If there's a trackSlug
    if (segments.length >= 3) {
      const trackSlug = segments[2]
      const trackPath = `${basePath}/${trackSlug}`
      breadcrumbs.push({ label: trackSlug, href: trackPath })

      // If there's an eventId
      if (segments.length >= 4) {
        const eventId = segments[3]
        breadcrumbs.push({
          label: 'event',
          href: `${trackPath}/${eventId}`
        })
      }
    }

    return breadcrumbs
  }

  // Fallback for unknown routes
  return breadcrumbs
}
