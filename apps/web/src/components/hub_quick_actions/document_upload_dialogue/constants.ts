import { EventType } from '@packages/types'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.NOTE]: 'Note',
  [EventType.APPOINTMENT]: 'Appointment',
  [EventType.RESULT]: 'Result',
  [EventType.LETTER]: 'Letter',
  [EventType.FEELING]: 'Feeling',
  [EventType.EXERCISE]: 'Exercise',
  [EventType.SYMPTOM]: 'Symptom'
}

export const EVENT_TYPE_OPTIONS = Object.values(EventType)
