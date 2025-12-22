// Jest setup file to configure globals
import { jest } from '@jest/globals'

// Make jest available globally
global.jest = jest

// Set up environment variables for tests
process.env.AWS_REGION = 'us-east-1'
process.env.S3_BUCKET_APP_DOCUMENTS = 'test-bucket'
process.env.AWS_ACCESS_KEY_ID = 'test-key'
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'

// Global fail-fast guards to prevent accidental real DB/S3 calls in tests
// Tests can opt out by setting ALLOW_EXTERNAL_IO=true for integration tests
if (process.env.ALLOW_EXTERNAL_IO !== 'true') {
  // Prisma guard: Install middleware that throws on any unmocked query
  // Tests that use jest.spyOn(prisma.*) will intercept calls before middleware
  // Unmocked calls will hit middleware and fail fast
  import('@packages/database')
    .then(({ prisma }) => {
      prisma.$use(async (params, next) => {
        // Extract model and action from params
        const model = params.model || 'unknown'
        const action = params.action || 'unknown'
        throw new Error(
          `Unexpected Prisma query: ${model}.${action}. ` +
            `This query was not mocked. Use jest.spyOn(prisma.${model}, '${action}') to mock it. ` +
            `If this is an integration test, set ALLOW_EXTERNAL_IO=true.`
        )
      })
    })
    .catch(() => {
      // Ignore import errors in setup - tests will fail if Prisma is actually needed
    })

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
