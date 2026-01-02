/**
 * Formats an appointment time in 24-hour format (e.g., "14:30").
 *
 * @param datetime - The appointment date as a Date object or ISO string
 * @returns Formatted time string
 */
export function formatAppointmentTime(datetime: Date | string): string {
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Formats an appointment date label based on how many days away it is.
 *
 * Rules:
 * - Today: "TODAY"
 * - Tomorrow: "TOM"
 * - 2-6 days from now: Day abbreviation (e.g., "SUN", "MON", "TUE")
 * - 7+ days from now: Date format (e.g., "9 JAN")
 *
 * @param datetime - The appointment date as a Date object or ISO string
 * @param referenceDate - Optional reference date (defaults to now)
 * @returns Formatted date label string
 */
export function formatAppointmentDateLabel(datetime: Date | string, referenceDate?: Date): string {
  const appointmentDate = typeof datetime === 'string' ? new Date(datetime) : datetime
  const refDate = referenceDate ?? new Date()

  // Normalize dates to start of day for accurate day comparison
  const appointmentDay = new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate()
  )
  const refDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate())

  // Calculate days difference
  const diffMs = appointmentDay.getTime() - refDay.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'TODAY'
  }

  if (diffDays === 1) {
    return 'TOM'
  }

  if (diffDays >= 2 && diffDays <= 6) {
    // Return day abbreviation (SUN, MON, TUE, etc.)
    return appointmentDate.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
  }

  // 7+ days: Return date format (e.g., "9 JAN")
  return appointmentDate
    .toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
    .toUpperCase()
}
