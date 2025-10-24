// Mock database for testing
export const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn().mockResolvedValue(null), // Default to null (not found)
    delete: jest.fn(),
    deleteMany: jest.fn()
  },
  healthTrack: {
    create: jest.fn(),
    findFirst: jest.fn().mockResolvedValue(null), // Default to null (not found)
    deleteMany: jest.fn()
  },
  event: {
    createMany: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]), // Default to empty array
    deleteMany: jest.fn()
  }
}

// Mock EventType enum
export const EventType = {
  NOTE: 'NOTE',
  RESULT: 'RESULT',
  FEELING: 'FEELING'
} as const

// Mock auth
export const mockAuth = {
  api: {
    getSession: jest.fn()
  },
  handler: jest.fn()
}
