import { generateSlug } from '../generate_slug'

describe('generateSlug', () => {
  it('should convert title to lowercase', () => {
    expect(generateSlug('SLEEP')).toBe('sleep')
    expect(generateSlug('Sleep')).toBe('sleep')
    expect(generateSlug('SlEeP')).toBe('sleep')
  })

  it('should trim whitespace', () => {
    expect(generateSlug('  sleep  ')).toBe('sleep')
    expect(generateSlug('\tsleep\n')).toBe('sleep')
  })

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('sleep tracking')).toBe('sleep-tracking')
    expect(generateSlug('blood pressure')).toBe('blood-pressure')
  })

  it('should remove special characters', () => {
    expect(generateSlug('sleep!@#$%^&*()')).toBe('sleep')
    expect(generateSlug('sleep & hydration')).toBe('sleep-hydration')
  })

  it('should collapse multiple hyphens', () => {
    expect(generateSlug('sleep---tracking')).toBe('sleep-tracking')
    expect(generateSlug('sleep   tracking')).toBe('sleep-tracking')
  })

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('should handle string with only special characters', () => {
    expect(generateSlug('!@#$%')).toBe('')
  })

  it('should handle complex titles', () => {
    expect(generateSlug('Sleep & Hydration Tracking!')).toBe('sleep-hydration-tracking')
    expect(generateSlug('Blood Pressure Monitoring (Daily)')).toBe(
      'blood-pressure-monitoring-daily'
    )
  })
})
