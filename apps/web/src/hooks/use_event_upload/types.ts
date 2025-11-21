import { EventResponse } from '@packages/types'
import { UploadStatus } from './constants'

export type UseEventUploadProps = {
  eventId: string
  trackSlug: string
  onComplete?: (event: EventResponse) => void
}

export type UseEventUploadReturn = {
  status: UploadStatus
  error: string | null
  isUploading: boolean
  upload: (file: File) => Promise<void>
  reset: () => void
}
