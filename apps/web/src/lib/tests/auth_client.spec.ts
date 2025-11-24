// Mock better-auth/react BEFORE importing
jest.mock('better-auth/react', () => {
  const mockAuthClient = {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn()
  }
  return {
    createAuthClient: jest.fn(() => mockAuthClient)
  }
})

import { authClient, signIn, signUp, signOut, useSession } from '../auth_client'
import { createAuthClient } from 'better-auth/react'

// Store the call info before beforeEach clears mocks
const createAuthClientMock = createAuthClient as jest.Mock
const createAuthClientCallArgs = createAuthClientMock.mock.calls[0]?.[0]

describe('auth_client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export authClient', () => {
    expect(authClient).toBeDefined()
  })

  it('should export signIn, signUp, signOut, and useSession', () => {
    expect(signIn).toBeDefined()
    expect(signUp).toBeDefined()
    expect(signOut).toBeDefined()
    expect(useSession).toBeDefined()
  })

  it('should create auth client with correct baseURL from env', () => {
    // createAuthClient is called during module import
    expect(createAuthClientCallArgs).toEqual({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
    })
  })
})
