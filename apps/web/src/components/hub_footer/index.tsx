'use client'

import { Card, CardFooter } from '@/components/ui/card'
import type { HubFooterProps } from './types'

export function HubFooter({ appName = 'Florence' }: HubFooterProps) {
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardFooter className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>Made for quieter health admin moments.</span>
        <span>
          {appName} ·{' '}
          <button type="button" className="underline-offset-4 hover:underline">
            Settings
          </button>
        </span>
      </CardFooter>
    </Card>
  )
}

