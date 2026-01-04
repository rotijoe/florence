'use client'

import { cn } from '@/lib/utils'
import type { SeverityIndicatorProps } from './types'

export function SeverityIndicator({ severity }: SeverityIndicatorProps) {
  const severityValue = severity ?? 1
  const maxSeverity = 5

  return (
    <div
      className='flex items-center gap-1'
      aria-label={`Severity ${severityValue} out of ${maxSeverity}`}
    >
      {Array.from({ length: maxSeverity }, (_, i) => {
        const isFilled = i < severityValue
        return (
          <span
            key={i}
            className={cn(
              'size-2.5 rounded-full border border-current transition-colors',
              isFilled ? 'bg-current' : 'bg-transparent'
            )}
            aria-hidden
          />
        )
      })}
    </div>
  )
}

