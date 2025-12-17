import { EventType } from '@packages/types'

export const EVENT_TYPE_PASTEL_STYLES: Record<EventType, string> = {
  [EventType.NOTE]: 'bg-sky-500/10 text-sky-700 hover:bg-sky-500/15 dark:bg-sky-400/10 dark:text-sky-200',
  [EventType.APPOINTMENT]:
    'bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/15 dark:bg-indigo-400/10 dark:text-indigo-200',
  [EventType.RESULT]:
    'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-200',
  [EventType.LETTER]:
    'bg-amber-500/10 text-amber-800 hover:bg-amber-500/15 dark:bg-amber-400/10 dark:text-amber-200',
  [EventType.FEELING]:
    'bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:bg-rose-400/10 dark:text-rose-200',
  [EventType.EXERCISE]:
    'bg-teal-500/10 text-teal-700 hover:bg-teal-500/15 dark:bg-teal-400/10 dark:text-teal-200',
  [EventType.SYMPTOM]:
    'bg-violet-500/10 text-violet-700 hover:bg-violet-500/15 dark:bg-violet-400/10 dark:text-violet-200'
}


