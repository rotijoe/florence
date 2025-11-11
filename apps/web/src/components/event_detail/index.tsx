import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatTimestamp } from './helpers'
import type { EventDetailProps } from './types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'

export function EventDetail({ event }: EventDetailProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 lg:min-h-[calc(100vh-8rem)]">
      {renderLayout(event)}
    </section>
  )
}

function renderMobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full lg:hidden">
          <MoreVertical className="size-4" />
          <span className="sr-only">Event actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>Edit event</DropdownMenuItem>
        <DropdownMenuItem>Upload document</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete event</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function renderDesktopMenu() {
  return (
    <aside className="hidden flex-col gap-2 border-l bg-card px-4 py-10 lg:sticky lg:top-[30px] lg:flex lg:h-full lg:max-h-[calc(100vh-46px)]">
      <Button type="button" size="sm">
        Edit event
      </Button>
      <Button type="button" variant="outline" size="sm">
        Upload document
      </Button>
      <Button type="button" variant="destructive" size="sm" className="mt-auto bg-pink-500">
        Delete event
      </Button>
    </aside>
  )
}

function renderLayout(event: EventDetailProps['event']) {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:h-full lg:gap-8">
      <div className="lg:hidden">{renderMobileMenu()}</div>
      <div className="h-[2000px]">
        {renderHeader(event)}
        {renderContent(event)}
        {renderFooter(event)}
      </div>
      <div className="hidden lg:block lg:h-full">{renderDesktopMenu()}</div>
    </div>
  )
}

function renderHeader(event: EventDetailProps['event']) {
  return (
    <CardHeader className="gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl">{event.title}</CardTitle>
        </div>
        <span className="w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-primary">
          {event.type}
        </span>
      </div>
    </CardHeader>
  )
}

function renderContent(event: EventDetailProps['event']) {
  return (
    <CardContent className="space-y-6">
      {Boolean(event.description) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Notes</h3>
          <p className="text-sm leading-6 text-foreground">{event.description}</p>
        </div>
      )}
      {renderDocumentButton(event.fileUrl)}
    </CardContent>
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
