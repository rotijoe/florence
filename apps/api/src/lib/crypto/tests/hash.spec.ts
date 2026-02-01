import { describe, it, expect } from '@jest/globals'
import { hashToken, verifyTokenHash } from '../hash.js'

describe('hashToken / verifyTokenHash', () => {
  it('should hash a token consistently', () => {
    const token = 'test-token-123'
    const hash1 = hashToken(token)
    const hash2 = hashToken(token)

    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/) // SHA-256 produces 64 hex characters
  })

  it('should produce different hashes for different tokens', () => {
    const hash1 = hashToken('token1')
    const hash2 = hashToken('token2')

    expect(hash1).not.toBe(hash2)
  })

  it('should verify correct token against hash', () => {
    const token = 'test-token'
    const hash = hashToken(token)

    expect(verifyTokenHash(token, hash)).toBe(true)
  })

  it('should reject incorrect token against hash', () => {
    const token = 'test-token'
    const hash = hashToken(token)
    const wrongToken = 'wrong-token'

    expect(verifyTokenHash(wrongToken, hash)).toBe(false)
  })

  it('should handle empty token', () => {
    const token = ''
    const hash = hashToken(token)

    expect(verifyTokenHash(token, hash)).toBe(true)
    expect(verifyTokenHash('not-empty', hash)).toBe(false)
  })

  it('should handle long tokens', () => {
    const longToken = 'a'.repeat(1000)
    const hash = hashToken(longToken)

    expect(verifyTokenHash(longToken, hash)).toBe(true)
    expect(verifyTokenHash(longToken + 'x', hash)).toBe(false)
  })
})
