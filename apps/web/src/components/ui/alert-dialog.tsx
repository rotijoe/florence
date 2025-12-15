'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog'

function AlertDialog(props: React.ComponentProps<typeof Dialog>) {
  return <Dialog data-slot='alert-dialog' {...props} />
}

function AlertDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger data-slot='alert-dialog-trigger' {...props} />
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return <DialogContent data-slot='alert-dialog-content' className={cn(className)} {...props} />
}

function AlertDialogHeader(props: React.ComponentProps<typeof DialogHeader>) {
  return <DialogHeader data-slot='alert-dialog-header' {...props} />
}

function AlertDialogFooter(props: React.ComponentProps<typeof DialogFooter>) {
  return <DialogFooter data-slot='alert-dialog-footer' {...props} />
}

function AlertDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot='alert-dialog-title' {...props} />
}

function AlertDialogDescription(props: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot='alert-dialog-description' {...props} />
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <DialogClose asChild>
      <Button
        data-slot='alert-dialog-cancel'
        variant='outline'
        className={cn('mt-2 sm:mt-0', className)}
        {...props}
      />
    </DialogClose>
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <DialogClose asChild>
      <Button data-slot='alert-dialog-action' className={cn(className)} {...props} />
    </DialogClose>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
}


