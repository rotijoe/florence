// Jest setup file to configure globals
import { jest } from '@jest/globals'

// Make jest available globally
global.jest = jest

// Set up environment variables for tests
process.env.AWS_REGION = 'us-east-1'
process.env.S3_BUCKET_APP_DOCUMENTS = 'test-bucket'
process.env.AWS_ACCESS_KEY_ID = 'test-key'
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
