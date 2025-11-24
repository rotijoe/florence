import { generateBreadcrumbs } from '../helpers'

describe('generateBreadcrumbs', () => {
  it('returns home breadcrumb for root path', () => {
    const result = generateBreadcrumbs('/')

    expect(result).toEqual([
      { label: 'home', href: '/' }
    ])
  })

  it('returns home and tracks for /tracks', () => {
    const result = generateBreadcrumbs('/tracks')

    expect(result).toEqual([
      { label: 'home', href: '/' },
      { label: 'tracks', href: '/tracks' }
    ])
  })

  it('returns breadcrumbs for track detail page', () => {
    const result = generateBreadcrumbs('/tracks/test-track')

    expect(result).toEqual([
      { label: 'home', href: '/' },
      { label: 'tracks', href: '/tracks' },
      { label: 'test-track', href: '/tracks/test-track' }
    ])
  })

  it('returns breadcrumbs for event detail page', () => {
    const result = generateBreadcrumbs('/tracks/test-track/event-123')

    expect(result).toEqual([
      { label: 'home', href: '/' },
      { label: 'tracks', href: '/tracks' },
      { label: 'test-track', href: '/tracks/test-track' },
      { label: 'event', href: '/tracks/test-track/event-123' }
    ])
  })

  it('returns only home for unknown routes', () => {
    const result = generateBreadcrumbs('/unknown/route')

    expect(result).toEqual([
      { label: 'home', href: '/' }
    ])
  })

  it('handles empty pathname', () => {
    const result = generateBreadcrumbs('')

    expect(result).toEqual([
      { label: 'home', href: '/' }
    ])
  })
})

