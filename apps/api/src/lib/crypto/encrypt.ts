import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits for GCM
const TAG_LENGTH = 16 // 128 bits for GCM

export interface EventContentPayload {
  title: string
  notes: string | null
  fileUrl: string | null
  symptomType: string | null
  severity: number | null
}

/**
 * Gets the encryption key from KMS or environment.
 * In production, this should fetch from KMS.
 * For development, falls back to ENCRYPTION_KEY env var.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }

  // Key should be 32 bytes (256 bits) for AES-256
  // If provided as hex string, decode it; otherwise use as-is
  if (key.length === 64) {
    // Assume hex-encoded 32-byte key
    return Buffer.from(key, 'hex')
  }

  // Otherwise, use the key directly (must be exactly 32 bytes)
  const keyBuffer = Buffer.from(key, 'utf8')
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (or 64 hex characters)')
  }

  return keyBuffer
}

/**
 * Encrypts event content payload into a single blob.
 * Uses AES-256-GCM for authenticated encryption.
 *
 * @param payload - The event content to encrypt
 * @returns Encrypted blob as Buffer
 */
export function encryptEventContent(payload: EventContentPayload): Buffer {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv)
  cipher.setAAD(Buffer.from('event-content')) // Additional authenticated data

  const payloadJson = JSON.stringify(payload)
  const encrypted = Buffer.concat([cipher.update(payloadJson, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  // Format: [salt][iv][tag][encrypted]
  // For now, we'll use a simpler format: [iv][tag][encrypted]
  // In production, you might want to add salt for key derivation
  return Buffer.concat([iv, tag, encrypted])
}

/**
 * Decrypts event content blob back to payload.
 *
 * @param encryptedBlob - The encrypted blob from database (Uint8Array or Buffer)
 * @returns Decrypted event content payload
 * @throws Error if decryption fails (invalid key, corrupted data, etc.)
 */
export function decryptEventContent(encryptedBlob: Buffer | Uint8Array): EventContentPayload {
  const key = getEncryptionKey()

  // Convert Uint8Array to Buffer if needed
  const blob = Buffer.isBuffer(encryptedBlob) ? encryptedBlob : Buffer.from(encryptedBlob)

  if (blob.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid encrypted blob: too short')
  }

  const iv = blob.subarray(0, IV_LENGTH)
  const tag = blob.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = blob.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAAD(Buffer.from('event-content'))
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  const payloadJson = decrypted.toString('utf8')

  return JSON.parse(payloadJson) as EventContentPayload
}
