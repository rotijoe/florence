'use client'

import { FileText, Image, File, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFileDetails } from './helpers'
import type { EventAttachmentProps } from './types'
import { DocumentViewer } from '@/components/document_viewer'

export function EventAttachment({ fileUrl, onDelete }: EventAttachmentProps) {
  if (!fileUrl) {
    return null
  }

  const details = getFileDetails(fileUrl)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Attachments</h3>
        <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
          <FileIcon fileType={details.fileType} />
          <span className="flex-1 text-sm text-foreground">{details.filename}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                // Placeholder - no functionality yet
              }}
              aria-label="Download"
            >
              <Download className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      <DocumentViewer url={fileUrl} fileType={details.fileType} />
    </div>
  )
}

function FileIcon({ fileType }: { fileType: 'image' | 'pdf' | 'word' | 'text' | 'other' }) {
  if (fileType === 'pdf') {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded border border-border bg-destructive/10">
        <FileText className="size-6 text-destructive" />
      </div>
    )
  }

  if (fileType === 'word') {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded border border-border bg-blue-500/10">
        <FileText className="size-6 text-blue-600" />
      </div>
    )
  }

  if (fileType === 'image') {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded border border-border bg-muted">
        <Image className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (fileType === 'text') {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded border border-border bg-muted">
        <FileText className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded border border-border bg-muted">
      <File className="size-6 text-muted-foreground" />
    </div>
  )
}
