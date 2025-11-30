import { generateBreadcrumbs } from '../helpers'

describe('generateBreadcrumbs', () => {
  it('returns home breadcrumb for root path', () => {
    const result = generateBreadcrumbs('/')

    expect(result).toEqual([{ label: 'home', href: '/' }])
  })

  it('returns home and tracks for /userId/tracks', () => {
    const result = generateBreadcrumbs('/user-123/tracks')

    expect(result).toEqual([
      { label: 'home', href: '/' },
      { label: 'tracks', href: '/user-123/tracks' }
    ])
  })

  it('returns breadcrumbs for track detail page', () => {
    const result = generateBreadcrumbs('/user-123/tracks/test-track')

    expect(result).toEqual([
      { label: 'home', href: '/' },
      { label: 'tracks', href: '/user-123/tracks' },
      { label: 'test-track', href: '/user-123/tracks/test-track' }
    ])
  })

  it('returns breadcrumbs for event detail page', () => {
    const result = generateBreadcrumbs('/user-123/tracks/test-track/event-123')

    expect(result).toEqual([
      { label: 'home', href: '/' },
      { label: 'tracks', href: '/user-123/tracks' },
      { label: 'test-track', href: '/user-123/tracks/test-track' },
      { label: 'event', href: '/user-123/tracks/test-track/event-123' }
    ])
  })

  it('returns only home for unknown routes', () => {
    const result = generateBreadcrumbs('/unknown/route')

    expect(result).toEqual([{ label: 'home', href: '/' }])
  })

  it('handles empty pathname', () => {
    const result = generateBreadcrumbs('')

    expect(result).toEqual([{ label: 'home', href: '/' }])
  })
})
