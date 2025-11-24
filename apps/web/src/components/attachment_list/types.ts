export type AttachmentItem = {
  url: string
  filename: string
  fileType: 'image' | 'pdf' | 'word' | 'text' | 'other'
}

export type AttachmentListProps = {
  fileUrl: string | null | undefined
}
