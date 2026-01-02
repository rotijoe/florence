import { formatAppointmentTime } from '../helpers'

describe('formatAppointmentTime', () => {
  describe('Date object input', () => {
    it('formats morning time correctly', () => {
      const date = new Date(2025, 0, 3, 9, 30, 0)
      expect(formatAppointmentTime(date)).toBe('09:30')
    })

    it('formats afternoon time correctly', () => {
      const date = new Date(2025, 0, 3, 14, 45, 0)
      expect(formatAppointmentTime(date)).toBe('14:45')
    })

    it('formats midnight correctly', () => {
      const date = new Date(2025, 0, 3, 0, 0, 0)
      expect(formatAppointmentTime(date)).toBe('00:00')
    })

    it('formats noon correctly', () => {
      const date = new Date(2025, 0, 3, 12, 0, 0)
      expect(formatAppointmentTime(date)).toBe('12:00')
    })

    it('formats end of day correctly', () => {
      const date = new Date(2025, 0, 3, 23, 59, 0)
      expect(formatAppointmentTime(date)).toBe('23:59')
    })
  })

  describe('ISO string input', () => {
    it('formats ISO string time correctly', () => {
      const isoString = '2025-01-03T10:30:00Z'
      const result = formatAppointmentTime(isoString)
      // Note: Result depends on local timezone, so we just verify format
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('handles ISO string with different times', () => {
      const isoString = '2025-01-03T15:00:00Z'
      const result = formatAppointmentTime(isoString)
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  describe('edge cases', () => {
    it('pads single digit hours with leading zero', () => {
      const date = new Date(2025, 0, 3, 8, 5, 0)
      expect(formatAppointmentTime(date)).toBe('08:05')
    })

    it('pads single digit minutes with leading zero', () => {
      const date = new Date(2025, 0, 3, 10, 5, 0)
      expect(formatAppointmentTime(date)).toBe('10:05')
    })
  })
})

