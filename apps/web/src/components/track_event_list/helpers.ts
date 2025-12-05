import type { EventResponse } from '@packages/types'
import type { EventDateGroup } from './types'

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const dateLabelFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC'
})

export function formatEventDate(isoString: string): string {
  return dateTimeFormatter.format(new Date(isoString))
}

export function formatDateLabel(isoString: string): string {
  return dateLabelFormatter.format(new Date(isoString))
}

export function formatEventTime(isoString: string): string {
  return timeFormatter.format(new Date(isoString))
}

export function groupEventsByDate(events: EventResponse[]): EventDateGroup[] {
  const groups: EventDateGroup[] = []
  const grouped = new Map<string, EventResponse[]>()

  events.forEach((event) => {
    const dateKey = event.date.slice(0, 10)
    if (!grouped.has(dateKey)) {
      const newGroup: EventResponse[] = []
      grouped.set(dateKey, newGroup)
      groups.push({ date: dateKey, events: newGroup })
    }

    grouped.get(dateKey)?.push(event)
  })

  return groups
}
