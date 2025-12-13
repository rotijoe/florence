import { UploadStatus } from '@/hooks/use_event_upload/constants'

export function getStatusText(isCreatingEvent: boolean, status: UploadStatus): string {
  if (isCreatingEvent) {
    return 'Creating event...'
  }
  switch (status) {
    case 'getting-url':
      return 'Preparing upload...'
    case 'uploading':
      return 'Uploading file...'
    case 'confirming':
      return 'Saving...'
    case 'success':
      return 'Upload complete!'
    case 'error':
      return 'Upload failed'
    default:
      return 'Select a file to upload'
  }
}
