'use client'

import { useState, useOptimistic, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SymptomDialogue } from '@/components/hub_quick_actions/symptom_dialogue'
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_EMPTY_STATE_MESSAGE } from './constants'
import { hasNotifications, notificationsOptimisticReducer } from './helpers'
import type { RemindersPanelProps } from './types'
import { API_BASE_URL } from '@/constants/api'

export function RemindersPanel({
  notifications: initialNotifications,
  tracks,
  userId,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  emptyStateMessage = DEFAULT_EMPTY_STATE_MESSAGE,
  addEventHref
}: RemindersPanelProps) {
  const router = useRouter()
  const [optimisticNotifications, updateOptimisticNotifications] = useOptimistic(
    initialNotifications,
    notificationsOptimisticReducer
  )
  const [isSymptomDialogOpen, setIsSymptomDialogOpen] = useState(false)
  const [selectedSymptomTrackSlug, setSelectedSymptomTrackSlug] = useState<string | undefined>(
    undefined
  )

  function handleDismiss(notification: (typeof initialNotifications)[0]) {
    if (!notification.entityId || !notification.notificationType) {
      return
    }

    startTransition(async () => {
      updateOptimisticNotifications({ type: 'REMOVE_BY_ID', id: notification.id })

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/hub/notifications/dismiss`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            type: notification.notificationType,
            entityId: notification.entityId
          })
        })

        if (!response.ok) {
          updateOptimisticNotifications({ type: 'RESTORE', notification })
        } else {
          router.refresh()
        }
      } catch (error) {
        updateOptimisticNotifications({ type: 'RESTORE', notification })
        console.error('Failed to dismiss notification:', error)
      }
    })
  }

  if (!hasNotifications(optimisticNotifications)) {
    return (
      <Card className='border-muted/40 bg-muted/40 shadow-none'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>{title}</CardTitle>
          <CardDescription className='text-sm'>{emptyStateMessage}</CardDescription>
        </CardHeader>
        {addEventHref && (
          <CardContent>
            <Button asChild variant='outline' className='w-full'>
              <Link href={addEventHref}>
                <Plus className='mr-2 size-4' />
                Add event
              </Link>
            </Button>
          </CardContent>
        )}
      </Card>
    )
  }

  function renderItems() {
    return optimisticNotifications.map((notification, index) => {
      const showSeparator = index < optimisticNotifications.length - 1

      return (
        <div key={notification.id} className='space-y-2'>
          <div className='flex flex-col items-start justify-between gap-3'>
            <div className='flex justify-between items-start w-full gap-1.5'>
              <div>
                <p className='font-medium text-sm sm:text-[15px]'>{notification.title}</p>
              </div>
              <Button
                variant='outline'
                size='icon-sm'
                className='rounded-full bg-transparent p-0 shadow-none'
                type='button'
                aria-label='Dismiss notification'
                onClick={() => handleDismiss(notification)}
              >
                <X className='size-3.5' />
              </Button>
            </div>
            <div className='flex justify-between w-full gap-1.5'>
              {notification.ctaLabel ? (
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  onClick={() => {
                    if (notification.type === 'symptomReminder' && notification.trackSlug) {
                      setSelectedSymptomTrackSlug(notification.trackSlug)
                      setIsSymptomDialogOpen(true)
                    } else if (notification.href) {
                      window.location.href = notification.href
                    }
                  }}
                >
                  {notification.ctaLabel}
                </Button>
              ) : null}
            </div>
          </div>
          {showSeparator ? <Separator className='my-6' /> : null}
        </div>
      )
    })
  }

  function handleSymptomSuccess() {
    setIsSymptomDialogOpen(false)
    // Remove the notification for the track that was just logged
    if (selectedSymptomTrackSlug) {
      startTransition(() => {
        updateOptimisticNotifications({
          type: 'REMOVE_BY_TRACK_SLUG',
          trackSlug: selectedSymptomTrackSlug
        })
        router.refresh()
      })
    }
    setSelectedSymptomTrackSlug(undefined)
  }

  return (
    <>
      <Card className='border-muted/40 bg-muted/40 shadow-none'>
        <CardHeader>
          <CardTitle className='text-base font-semibold'>{title}</CardTitle>
          <CardDescription className='text-sm'>{description}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>{renderItems()}</CardContent>
      </Card>
      <SymptomDialogue
        open={isSymptomDialogOpen}
        onOpenChange={setIsSymptomDialogOpen}
        tracks={tracks}
        userId={userId}
        onSuccess={handleSymptomSuccess}
        initialTrackSlug={selectedSymptomTrackSlug}
      />
    </>
  )
}

