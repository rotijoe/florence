import Link from 'next/link'
import { EventType } from '@packages/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { EVENT_TYPE_OPTIONS, EVENT_TYPE_LABELS } from '@/components/hub_quick_actions/document_upload_dialogue/constants'
import { buildAddEventHref } from './helpers'
import { EVENT_TYPE_PASTEL_STYLES } from './constants'
import type { TrackQuickAddBarProps } from './types'
import {
  Activity,
  Calendar,
  Dumbbell,
  FileText,
  Heart,
  Mail,
  TestTube,
  StickyNote
} from 'lucide-react'

function renderIcon(type: EventType) {
  const iconClassName = 'size-4'
  const testId = `event-type-icon-${type}`

  if (type === EventType.APPOINTMENT) {
    return <Calendar className={iconClassName} data-testid={testId} />
  }

  if (type === EventType.NOTE) {
    return <StickyNote className={iconClassName} data-testid={testId} />
  }

  if (type === EventType.RESULT) {
    return <TestTube className={iconClassName} data-testid={testId} />
  }

  if (type === EventType.LETTER) {
    return <Mail className={iconClassName} data-testid={testId} />
  }

  if (type === EventType.FEELING) {
    return <Heart className={iconClassName} data-testid={testId} />
  }

  if (type === EventType.EXERCISE) {
    return <Dumbbell className={iconClassName} data-testid={testId} />
  }

  if (type === EventType.SYMPTOM) {
    return <Activity className={iconClassName} data-testid={testId} />
  }

  return <FileText className={iconClassName} data-testid={testId} />
}

function renderButtons(userId: string, trackSlug: string) {
  return EVENT_TYPE_OPTIONS.map((type) => {
    const label = EVENT_TYPE_LABELS[type]
    const href = buildAddEventHref({ userId, trackSlug, type })

    return (
      <Button
        key={type}
        asChild
        variant='secondary'
        className={cn(
          'h-auto w-full justify-start gap-2 rounded-xl border border-border/60 px-4 py-3 font-medium shadow-none transition-colors',
          EVENT_TYPE_PASTEL_STYLES[type]
        )}
      >
        <Link href={href} aria-label={`Add ${label}`}>
          {renderIcon(type)}
          <span className='text-sm'>{`Add ${label}`}</span>
        </Link>
      </Button>
    )
  })
}

export function TrackQuickAddBar({ userId, trackSlug }: TrackQuickAddBarProps) {
  return (
    <div className='grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7'>
      {renderButtons(userId, trackSlug)}
    </div>
  )
}



