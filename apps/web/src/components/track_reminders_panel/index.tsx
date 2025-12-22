import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { TrackRemindersPanelProps } from './types'

function renderEmptyState() {
  return (
    <CardContent className='pt-0 text-sm text-muted-foreground'>No reminders right now.</CardContent>
  )
}

function renderItems(notifications: TrackRemindersPanelProps['notifications']) {
  return (
    <CardContent className='pt-0'>
      <div className='space-y-4'>
        {notifications.map((n, index) => {
          return (
            <div key={n.id} className='space-y-2'>
              <div className='space-y-1'>
                <div className='text-sm font-semibold'>{n.title}</div>
                <div className='text-sm text-muted-foreground'>{n.message}</div>
              </div>

              {n.ctaLabel && n.href && (
                <Button asChild size='sm' variant='secondary'>
                  <Link href={n.href}>{n.ctaLabel}</Link>
                </Button>
              )}

              {index < notifications.length - 1 && <Separator />}
            </div>
          )
        })}
      </div>
    </CardContent>
  )
}

export function TrackRemindersPanel({ notifications }: TrackRemindersPanelProps) {
  const hasReminders = notifications.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Reminders</CardTitle>
      </CardHeader>
      {hasReminders ? renderItems(notifications) : renderEmptyState()}
    </Card>
  )
}



