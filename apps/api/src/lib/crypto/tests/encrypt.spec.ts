import { describe, it, expect, beforeEach } from '@jest/globals'
import { encryptEventContent, decryptEventContent, type EventContentPayload } from '../encrypt.js'

describe('encryptEventContent / decryptEventContent', () => {
  const originalEnv = process.env.ENCRYPTION_KEY

  beforeEach(() => {
    // Set a test encryption key (32 bytes as hex)
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  })

  afterEach(() => {
    if (originalEnv) {
      process.env.ENCRYPTION_KEY = originalEnv
    } else {
      delete process.env.ENCRYPTION_KEY
    }
  })

  it('should encrypt and decrypt a complete payload', () => {
    const payload: EventContentPayload = {
      title: 'Test Event',
      notes: 'Test notes',
      fileUrl: 'https://bucket.s3.amazonaws.com/file.pdf',
      symptomType: 'pain',
      severity: 5
    }

    const encrypted = encryptEventContent(payload)
    expect(encrypted).toBeInstanceOf(Buffer)
    expect(encrypted.length).toBeGreaterThan(0)

    const decrypted = decryptEventContent(encrypted)
    expect(decrypted).toEqual(payload)
  })

  it('should encrypt and decrypt with null values', () => {
    const payload: EventContentPayload = {
      title: 'Test Event',
      notes: null,
      fileUrl: null,
      symptomType: null,
      severity: null
    }

    const encrypted = encryptEventContent(payload)
    const decrypted = decryptEventContent(encrypted)
    expect(decrypted).toEqual(payload)
  })

  it('should encrypt and decrypt with empty strings', () => {
    const payload: EventContentPayload = {
      title: 'Test Event',
      notes: '',
      fileUrl: null,
      symptomType: null,
      severity: null
    }

    const encrypted = encryptEventContent(payload)
    const decrypted = decryptEventContent(encrypted)
    expect(decrypted.title).toBe('Test Event')
    expect(decrypted.notes).toBe('')
  })

  it('should produce different ciphertext for same plaintext (nonce/IV)', () => {
    const payload: EventContentPayload = {
      title: 'Test Event',
      notes: 'Test notes',
      fileUrl: null,
      symptomType: null,
      severity: null
    }

    const encrypted1 = encryptEventContent(payload)
    const encrypted2 = encryptEventContent(payload)

    // Should be different due to random IV
    expect(encrypted1).not.toEqual(encrypted2)

    // But both should decrypt to the same value
    expect(decryptEventContent(encrypted1)).toEqual(payload)
    expect(decryptEventContent(encrypted2)).toEqual(payload)
  })

  it('should throw error when ENCRYPTION_KEY is missing', () => {
    delete process.env.ENCRYPTION_KEY

    const payload: EventContentPayload = {
      title: 'Test',
      notes: null,
      fileUrl: null,
      symptomType: null,
      severity: null
    }

    expect(() => encryptEventContent(payload)).toThrow('ENCRYPTION_KEY')
  })

  it('should throw error when decrypting with wrong key', () => {
    const payload: EventContentPayload = {
      title: 'Test',
      notes: null,
      fileUrl: null,
      symptomType: null,
      severity: null
    }

    const encrypted = encryptEventContent(payload)

    // Change the key
    process.env.ENCRYPTION_KEY = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'

    expect(() => decryptEventContent(encrypted)).toThrow()
  })

  it('should throw error when decrypting corrupted data', () => {
    const corrupted = Buffer.from('corrupted data')

    expect(() => decryptEventContent(corrupted)).toThrow()
  })

  it('should throw error when decrypting too-short blob', () => {
    const tooShort = Buffer.from('short')

    expect(() => decryptEventContent(tooShort)).toThrow('too short')
  })
})
