import { EventType, type EventResponse } from '@packages/types'
import { getPresignedDownloadUrl, getObjectKeyFromUrl } from '@/lib/s3/index.js'

export type EventSelectResult = {
  id: string
  trackId: string
  date: Date
  type: string
  title: string
  notes: string | null
  fileUrl: string | null
  symptomType: string | null
  severity: number | null
  createdAt: Date
  updatedAt: Date
}

export async function formatEvent(event: EventSelectResult): Promise<EventResponse> {
  let fileUrl = event.fileUrl
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
    title: event.title,
    notes: event.notes,
    fileUrl,
    symptomType: event.symptomType,
    severity: event.severity,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  }
}
