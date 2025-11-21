import { useState, useCallback } from 'react'
import {
  createEventUploadIntentAction,
  confirmEventUploadAction
} from '@/app/tracks/[trackSlug]/[eventId]/actions'
import { UploadStatus } from './constants'
import { UseEventUploadProps, UseEventUploadReturn } from './types'

export function useEventUpload({
  eventId,
  trackSlug,
  onComplete
}: UseEventUploadProps): UseEventUploadReturn {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
  }, [])

  const upload = useCallback(
    async (file: File) => {
      setStatus('getting-url')
      setError(null)

      try {
        // Step 1: Get presigned URL
        const formData = new FormData()
        formData.append('eventId', eventId)
        formData.append('trackSlug', trackSlug)
        formData.append('fileName', file.name)
        formData.append('contentType', file.type)
        formData.append('size', file.size.toString())

        const intentResult = await createEventUploadIntentAction(formData)

        if (
          intentResult.error ||
          !intentResult.uploadUrl ||
          !intentResult.fileUrl ||
          !intentResult.key
        ) {
          throw new Error(intentResult.error || 'Failed to get upload URL')
        }

        // Step 2: Upload directly to S3
        setStatus('uploading')
        const uploadResponse = await fetch(intentResult.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type
          },
          body: file
        })

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`)
        }

        // Step 3: Confirm upload
        setStatus('confirming')
        const confirmFormData = new FormData()
        confirmFormData.append('eventId', eventId)
        confirmFormData.append('trackSlug', trackSlug)
        confirmFormData.append('fileUrl', intentResult.fileUrl)
        confirmFormData.append('key', intentResult.key)

        const confirmResult = await confirmEventUploadAction(confirmFormData)

        if (confirmResult.error || !confirmResult.event) {
          throw new Error(confirmResult.error || 'Failed to confirm upload')
        }

        setStatus('success')
        onComplete?.(confirmResult.event)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        setStatus('error')
      }
    },
    [eventId, trackSlug, onComplete]
  )

  const isUploading = status === 'getting-url' || status === 'uploading' || status === 'confirming'

  return {
    status,
    error,
    isUploading,
    upload,
    reset
  }
}
