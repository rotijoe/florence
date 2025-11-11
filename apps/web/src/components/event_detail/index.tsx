'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldLabel, FieldContent } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { MoreVertical } from 'lucide-react'
import { formatTimestamp } from './helpers'
import type { EventDetailProps } from './types'

export function EventDetail({ event }: EventDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayNotes, setDisplayNotes] = useState(event.description || '')
  const [editedNotes, setEditedNotes] = useState(event.description || '')

  const handleEdit = () => {
    setEditedNotes(displayNotes)
    setIsEditing(true)
  }

  const handleSave = () => {
    setDisplayNotes(editedNotes)
    setIsEditing(false)
    // In the future, this will call a backend API
  }

  const handleCancel = () => {
    setEditedNotes(displayNotes)
    setIsEditing(false)
  }

  return (
    <>
      <Card>
        {renderHeader(event, isEditing, handleSave, handleCancel, handleEdit)}
        {renderContent(event, isEditing, editedNotes, setEditedNotes, displayNotes)}
        {renderFooter(event)}
      </Card>
    </>
  )
}

function renderActionsMenu(onEditEvent: () => void) {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <MoreVertical className="size-4" />
            <span className="sr-only">Event actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={onEditEvent}>Edit event</DropdownMenuItem>
          <DropdownMenuItem>Upload document</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete event</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function renderEditingButtons(onSave: () => void, onCancel: () => void, isEditing: boolean) {
  if (!isEditing) return null

  return (
    <>
      <Button onClick={onSave} size="sm">
        Save
      </Button>

      <Button onClick={onCancel} variant="outline" size="sm">
        Cancel
      </Button>
    </>
  )
}

function renderHeader(
  event: EventDetailProps['event'],
  isEditing: boolean,
  onSave: () => void,
  onCancel: () => void,
  handleEdit: () => void
) {
  return (
    <CardHeader className="gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl">{event.title}</CardTitle>
          <span className="w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-primary">
            {event.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {renderEditingButtons(onSave, onCancel, isEditing)}
          </div>
          {renderActionsMenu(handleEdit)}
        </div>
      </div>
    </CardHeader>
  )
}

function renderContent(
  event: EventDetailProps['event'],
  isEditing: boolean,
  editedNotes: string,
  setEditedNotes: (value: string) => void,
  displayNotes: string
) {
  return (
    <CardContent className="space-y-6">
      {renderNotes(displayNotes, isEditing, editedNotes, setEditedNotes)}
      {renderDocumentButton(event.fileUrl)}
    </CardContent>
  )
}

const renderNotes = (
  displayNotes: string,
  isEditing: boolean,
  editedNotes: string,
  setEditedNotes: (value: string) => void
) => {
  if (isEditing) {
    return (
      <Field>
        <FieldLabel htmlFor="notes">Notes</FieldLabel>
        <FieldContent>
          <Textarea
            id="notes"
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </FieldContent>
      </Field>
    )
  }
  return (
    <div className="border border-border px-3 py-2 rounded-md text-foreground bg-cardspace-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Notes</h3>
      <p className="text-sm leading-6">{displayNotes}</p>
    </div>
  )
}

function renderDocumentButton(fileUrl: string | null | undefined) {
  if (!fileUrl) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Attachments</h3>
      <Button asChild variant="secondary" size="sm">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          View attached document
        </a>
      </Button>
    </div>
  )
}

function renderFooter(event: EventDetailProps['event']) {
  return (
    <CardFooter className="flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground">
      <div>
        <span className="font-medium">Created:</span> {formatTimestamp(event.createdAt)}
      </div>
      {event.updatedAt !== event.createdAt && (
        <div>
          <span className="font-medium">Updated:</span> {formatTimestamp(event.updatedAt)}
        </div>
      )}
    </CardFooter>
  )
}
