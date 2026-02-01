import { createHash } from 'crypto'

const HASH_ALGORITHM = 'sha256'

/**
 * Hashes a token for secure storage.
 * Uses SHA-256 for one-way hashing.
 *
 * @param token - The token to hash
 * @returns Hex-encoded hash string
 */
export function hashToken(token: string): string {
  return createHash(HASH_ALGORITHM).update(token).digest('hex')
}

/**
 * Verifies a token against a stored hash.
 *
 * @param token - The token to verify
 * @param hash - The stored hash to compare against
 * @returns True if token matches hash, false otherwise
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  const computedHash = hashToken(token)
  return computedHash === hash
}
