'use client'

import type { HubWelcomeHeaderProps } from './types'

export function HubWelcomeHeader({ greeting, subtitle }: HubWelcomeHeaderProps) {
  return (
    <div className='space-y-2'>
      <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>{greeting}</h1>
      <p className='max-w-2xl text-base text-muted-foreground'>{subtitle}</p>
    </div>
  )
}
