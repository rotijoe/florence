import { EventType, type EventResponse } from '@packages/types'
import { getPresignedDownloadUrl, getObjectKeyFromUrl } from '@/lib/s3/index.js'
import { decryptEventContent } from '@/lib/crypto/index.js'

export type EventSelectResult = {
  id: string
  trackId: string
  date: Date
  type: string
  createdAt: Date
  updatedAt: Date
  content: {
    contentEnc: Uint8Array
  } | null
}

export async function formatEvent(event: EventSelectResult): Promise<EventResponse> {
  // Decrypt content if present
  let title = 'Untitled event'
  let notes: string | null = null
  let fileUrl: string | null = null
  let symptomType: string | null = null
  let severity: number | null = null

  if (event.content?.contentEnc) {
    try {
      const content = decryptEventContent(event.content.contentEnc)
      title = content.title
      notes = content.notes
      fileUrl = content.fileUrl
      symptomType = content.symptomType
      severity = content.severity
    } catch (error) {
      console.error('Error decrypting event content:', error)
      // Fall back to defaults if decryption fails
    }
  }

  // Convert fileUrl to presigned URL if present
  if (fileUrl) {
    const key = getObjectKeyFromUrl(fileUrl)
    if (key) {
      try {
        fileUrl = await getPresignedDownloadUrl(key)
      } catch (error) {
        console.error('Error generating presigned URL:', error)
      }
    }
  }

  return {
    id: event.id,
    trackId: event.trackId,
    date: event.date.toISOString(),
    type: event.type as EventType,
    title,
    notes,
    fileUrl,
    symptomType,
    severity,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  }
}
