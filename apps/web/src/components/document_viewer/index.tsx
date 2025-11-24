'use client'

import type { DocumentViewerProps } from './types'
import { extractFilename } from './helpers'

export function DocumentViewer({ url, fileType }: DocumentViewerProps) {
  const filename = extractFilename(url)

  if (fileType === 'image') {
    return (
      <div className="relative flex h-full w-full items-center justify-center rounded-md border border-border bg-muted/10">
        <img src={url} alt={filename} className="max-h-[500px] max-w-full object-contain" />
      </div>
    )
  }

  if (fileType === 'pdf' || fileType === 'text') {
    return (
      <div className="h-[500px] w-full overflow-hidden rounded-md border border-border bg-muted/10">
        <iframe src={url} className="h-full w-full border-0" title={filename} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-border bg-muted/10 p-8 text-center">
      <p className="text-muted-foreground">This file type cannot be previewed.</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-primary underline hover:text-primary/80"
      >
        Download File
      </a>
    </div>
  )
}
