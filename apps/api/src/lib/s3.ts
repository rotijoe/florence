import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export type StorageConfig = {
  awsRegion: string
  s3BucketAppDocuments: string
}

export function getStorageConfig(): StorageConfig {
  const awsRegion = process.env.AWS_REGION
  const s3BucketAppDocuments = process.env.S3_BUCKET_APP_DOCUMENTS

  if (!awsRegion) {
    throw new Error('AWS_REGION environment variable is required')
  }

  if (!s3BucketAppDocuments) {
    throw new Error('S3_BUCKET_APP_DOCUMENTS environment variable is required')
  }

  return {
    awsRegion,
    s3BucketAppDocuments
  }
}

const config = getStorageConfig()

export const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export function getEventDocumentKey(eventId: string, fileName: string): string {
  // Normalize filename: lowercase, remove special chars, keep extension
  const normalizedName = fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-')
  const ext = normalizedName.split('.').pop() || 'bin'
  const baseName = normalizedName.replace(/\.[^.]+$/, '') || 'file'
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)

  return `events/${eventId}/${timestamp}-${randomString}-${baseName}.${ext}`
}

export function getEventDocumentUrl(key: string): string {
  return `https://${config.s3BucketAppDocuments}.s3.${config.awsRegion}.amazonaws.com/${key}`
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.s3BucketAppDocuments,
    Key: key
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

export function getObjectKeyFromUrl(url: string): string | null {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    // pathname includes leading slash, so slice(1)
    // Decodes URI component to handle spaces/special chars if encoded
    return decodeURIComponent(urlObj.pathname.slice(1))
  } catch {
    return null
  }
}
