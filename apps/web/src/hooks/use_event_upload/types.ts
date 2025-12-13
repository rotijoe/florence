import { EventResponse } from '@packages/types'
import { UploadStatus } from './constants'

export type UseEventUploadProps = {
  userId: string
  trackSlug: string
  onComplete?: (event: EventResponse) => void
}

export type UploadParams = {
  eventId: string
  file: File
}

export type UseEventUploadReturn = {
  status: UploadStatus
  error: string | null
  isUploading: boolean
  upload: (params: UploadParams) => Promise<void>
  reset: () => void
}
