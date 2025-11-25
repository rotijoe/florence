export type AttachmentItem = {
  url: string
  filename: string
  fileType: 'image' | 'pdf' | 'word' | 'text' | 'other'
}

export type EventAttachmentProps = {
  fileUrl: string | null | undefined
  onDelete?: () => void
}
