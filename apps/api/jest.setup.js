// Jest setup file to configure globals
import { jest } from '@jest/globals'

// Make jest available globally
global.jest = jest

// Set up environment variables for tests
process.env.AWS_REGION = 'us-east-1'
process.env.S3_BUCKET_APP_DOCUMENTS = 'test-bucket'
process.env.AWS_ACCESS_KEY_ID = 'test-key'
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
// Set a dummy but valid DATABASE_URL to prevent Prisma from failing during initialization
// Tests will mock prismaRuntime methods, so this URL will never actually be used for connections
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test'
process.env.DATABASE_URL_RUNTIME = process.env.DATABASE_URL_RUNTIME || process.env.DATABASE_URL

// Global fail-fast guards to prevent accidental real DB/S3 calls in tests
// Tests can opt out by setting ALLOW_EXTERNAL_IO=true for integration tests
if (process.env.ALLOW_EXTERNAL_IO !== 'true') {
  // Synchronously set up prismaRuntime.$transaction mock before any tests run
  // This is critical because withUserRls calls $transaction which would otherwise
  // try to connect to the database
  const { prismaRuntime } = await import('@packages/database')

  // Mock prismaRuntime.$transaction to bypass actual DB connection
  // This allows withUserRls to work in tests by passing prismaRuntime as the tx client
  // Tests can then mock prismaRuntime.model.method() as usual
  prismaRuntime.$transaction = async (fn) => {
    // Skip the SET app.user_id query and just call the callback with prismaRuntime
    // This works because tests mock prismaRuntime.model.method()
    if (typeof fn === 'function') {
      // Create a mock tx that proxies to prismaRuntime but skips $executeRaw
      const mockTx = new Proxy(prismaRuntime, {
        get(target, prop) {
          if (prop === '$executeRaw') {
            // Skip the SET app.user_id query
            return async () => undefined
          }
          return target[prop]
        }
      })
      return fn(mockTx)
    }
    // For batch transactions (array of promises), throw - not supported in tests
    throw new Error('Batch transactions not supported in tests')
  }

  // S3 guard: Override s3Client.send to throw by default
  // Tests that need S3 should use jest.spyOn(s3Client, 'send').mockResolvedValue(...)
  import('@/lib/s3.js')
    .then(({ s3Client }) => {
      const originalSend = s3Client.send.bind(s3Client)
      s3Client.send = async function (command) {
        throw new Error(
          `Unexpected S3 call: ${command.constructor.name}. ` +
            `This call was not mocked. Use jest.spyOn(s3Client, 'send').mockResolvedValue(...) to mock it. ` +
            `If this is an integration test, set ALLOW_EXTERNAL_IO=true.`
        )
      }
      // Store original for potential future use
      s3Client._originalSend = originalSend
    })
    .catch(() => {
      // Ignore import errors in setup - tests will fail if S3 is actually needed
    })
}
