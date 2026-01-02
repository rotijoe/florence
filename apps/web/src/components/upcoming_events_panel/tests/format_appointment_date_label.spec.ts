import { formatAppointmentDateLabel } from '../helpers'

describe('formatAppointmentDateLabel', () => {
  // Use Friday, January 3rd as reference date (as per user example pattern)
  const referenceDate = new Date(2025, 0, 3, 12, 0, 0) // Fri 3rd Jan 2025, 12:00

  describe('same day (today)', () => {
    it('returns "TODAY" when appointment is on the same day', () => {
      const appointmentDate = new Date(2025, 0, 3, 14, 30, 0) // Same day, different time
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('TODAY')
    })

    it('returns "TODAY" when appointment is at midnight on the same day', () => {
      const appointmentDate = new Date(2025, 0, 3, 0, 0, 0)
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('TODAY')
    })

    it('returns "TODAY" when appointment is at end of day on the same day', () => {
      const appointmentDate = new Date(2025, 0, 3, 23, 59, 59)
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('TODAY')
    })
  })

  describe('next day (tomorrow)', () => {
    it('returns "TOM" when appointment is the next day', () => {
      const appointmentDate = new Date(2025, 0, 4, 10, 0, 0) // Sat 4th Jan
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('TOM')
    })

    it('returns "TOM" when appointment is at midnight the next day', () => {
      const appointmentDate = new Date(2025, 0, 4, 0, 0, 0)
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('TOM')
    })
  })

  describe('2-6 days from now (day abbreviations)', () => {
    it('returns "SUN" for 2 days from now', () => {
      const appointmentDate = new Date(2025, 0, 5, 10, 0, 0) // Sun 5th Jan
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('SUN')
    })

    it('returns "MON" for 3 days from now', () => {
      const appointmentDate = new Date(2025, 0, 6, 10, 0, 0) // Mon 6th Jan
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('MON')
    })

    it('returns "TUE" for 4 days from now', () => {
      const appointmentDate = new Date(2025, 0, 7, 10, 0, 0) // Tue 7th Jan
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('TUE')
    })

    it('returns "WED" for 5 days from now', () => {
      const appointmentDate = new Date(2025, 0, 8, 10, 0, 0) // Wed 8th Jan
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('WED')
    })

    it('returns "THU" for 6 days from now', () => {
      const appointmentDate = new Date(2025, 0, 9, 10, 0, 0) // Thu 9th Jan
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('THU')
    })
  })

  describe('7+ days from now (date format)', () => {
    it('returns date format for 7 days from now', () => {
      const appointmentDate = new Date(2025, 0, 10, 10, 0, 0) // Fri 10th Jan
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('10 JAN')
    })

    it('returns date format for 14 days from now', () => {
      const appointmentDate = new Date(2025, 0, 16, 10, 0, 0) // Fri 16th Jan
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('16 JAN')
    })

    it('returns date format for next month', () => {
      const appointmentDate = new Date(2025, 1, 1, 10, 0, 0) // Sat 1st Feb
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('1 FEB')
    })

    it('returns date format for multiple months away', () => {
      const appointmentDate = new Date(2025, 2, 15, 10, 0, 0) // Sat 15th Mar
      expect(formatAppointmentDateLabel(appointmentDate, referenceDate)).toBe('15 MAR')
    })
  })

  describe('string input handling', () => {
    it('handles ISO date string for today', () => {
      const isoString = '2025-01-03T14:30:00Z'
      expect(formatAppointmentDateLabel(isoString, referenceDate)).toBe('TODAY')
    })

    it('handles ISO date string for tomorrow', () => {
      const isoString = '2025-01-04T10:00:00Z'
      expect(formatAppointmentDateLabel(isoString, referenceDate)).toBe('TOM')
    })

    it('handles ISO date string for 2-6 days', () => {
      const isoString = '2025-01-05T10:00:00Z' // Sun 5th Jan
      expect(formatAppointmentDateLabel(isoString, referenceDate)).toBe('SUN')
    })

    it('handles ISO date string for 7+ days', () => {
      const isoString = '2025-01-10T10:00:00Z' // Fri 10th Jan
      expect(formatAppointmentDateLabel(isoString, referenceDate)).toBe('10 JAN')
    })
  })

  describe('Date object input handling', () => {
    it('handles Date object for today', () => {
      const dateObj = new Date(2025, 0, 3, 14, 30, 0)
      expect(formatAppointmentDateLabel(dateObj, referenceDate)).toBe('TODAY')
    })

    it('handles Date object for tomorrow', () => {
      const dateObj = new Date(2025, 0, 4, 10, 0, 0)
      expect(formatAppointmentDateLabel(dateObj, referenceDate)).toBe('TOM')
    })

    it('handles Date object for 7+ days', () => {
      const dateObj = new Date(2025, 0, 10, 10, 0, 0)
      expect(formatAppointmentDateLabel(dateObj, referenceDate)).toBe('10 JAN')
    })
  })

  describe('edge cases', () => {
    it('uses current date as reference when referenceDate is not provided', () => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)
      expect(formatAppointmentDateLabel(today)).toBe('TODAY')
    })

    it('handles end of month correctly', () => {
      const refDate = new Date(2025, 0, 31, 12, 0, 0) // Fri 31st Jan
      const appointmentDate = new Date(2025, 1, 1, 10, 0, 0) // Sat 1st Feb (next day)
      expect(formatAppointmentDateLabel(appointmentDate, refDate)).toBe('TOM')
    })

    it('handles year boundary correctly', () => {
      const refDate = new Date(2024, 11, 31, 12, 0, 0) // Tue 31st Dec 2024
      const appointmentDate = new Date(2025, 0, 1, 10, 0, 0) // Wed 1st Jan 2025 (next day)
      expect(formatAppointmentDateLabel(appointmentDate, refDate)).toBe('TOM')
    })

    it('handles leap year correctly', () => {
      const refDate = new Date(2024, 1, 28, 12, 0, 0) // Wed 28th Feb 2024
      const appointmentDate = new Date(2024, 1, 29, 10, 0, 0) // Thu 29th Feb 2024 (next day)
      expect(formatAppointmentDateLabel(appointmentDate, refDate)).toBe('TOM')
    })
  })
})

