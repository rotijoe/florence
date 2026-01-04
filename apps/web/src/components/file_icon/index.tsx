'use client'

import { FileText, Image, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileIconProps } from './types'

export function FileIcon({ fileType, size = 'sm' }: FileIconProps) {
  const containerSize = size === 'md' ? 'size-12' : 'size-8'
  const iconSize = size === 'md' ? 'size-6' : 'size-4'

  if (fileType === 'pdf') {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded border border-border bg-destructive/10',
          containerSize
        )}
      >
        <FileText className={cn('text-destructive', iconSize)} />
      </div>
    )
  }

  if (fileType === 'word') {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded border border-border bg-blue-500/10',
          containerSize
        )}
      >
        <FileText className={cn('text-blue-600', iconSize)} />
      </div>
    )
  }

  if (fileType === 'image') {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded border border-border bg-muted',
          containerSize
        )}
      >
        <Image className={cn('text-muted-foreground', iconSize)} />
      </div>
    )
  }

  if (fileType === 'text') {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded border border-border bg-muted',
          containerSize
        )}
      >
        <FileText className={cn('text-muted-foreground', iconSize)} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded border border-border bg-muted',
        containerSize
      )}
    >
      <File className={cn('text-muted-foreground', iconSize)} />
    </div>
  )
}

