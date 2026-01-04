'use client'

import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFileDetails } from '@/lib/get_file_details'
import { FileIcon } from '@/components/file_icon'
import type { EventAttachmentProps, FileDetails } from './types'
import { DocumentViewer } from '@/components/document_viewer'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export function EventAttachment({ fileUrl, onDelete }: EventAttachmentProps) {
  function renderEmptyState() {
    return (
      <Card className='space-y-2'>
        <CardHeader>
          <div className='flex items-center justify-between gap-3'>
            <CardTitle>Attachments</CardTitle>
            <Button variant='outline' onClick={() => {}} aria-label='Add attachment'>
              Add attachment
              <Plus className='size-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>No attachments found</p>
        </CardContent>
      </Card>
    )
  }

  function renderAttachment(details: FileDetails, fileUrl: string) {
    return (
      <div className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground'>Attachments</h3>
        <div className='flex items-center gap-3 rounded-md border border-border bg-card p-3'>
          <FileIcon fileType={details.fileType} size='md' />
          <span className='flex-1 text-sm text-foreground'>{details.filename}</span>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            aria-label='Delete'
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
        <DocumentViewer url={fileUrl} fileType={details.fileType} />
      </div>
    )
  }

  if (!fileUrl) {
    return renderEmptyState()
  }

  const details = getFileDetails(fileUrl)

  if (!details) {
    return renderEmptyState()
  }

  return renderAttachment(details, fileUrl)
}
