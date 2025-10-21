import { handleSignUp } from '../helpers'
import { signUp } from '@/lib/auth_client'

// Mock the auth client
jest.mock('@/lib/auth_client', () => ({
  signUp: { email: jest.fn() }
}))

const mockSignUp = signUp.email as jest.MockedFunction<typeof signUp.email>

describe('handleSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success when sign up succeeds', async () => {
    const data = {
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    }
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: '1' } },
      error: null
    })

    const result = await handleSignUp(data)

    expect(result).toEqual({ success: true, error: null })
    expect(mockSignUp).toHaveBeenCalledWith({
      email: data.email,
      password: data.password,
      name: data.name
    })
  })

  it('returns error when sign up fails', async () => {
    const data = {
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    }
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email already exists' }
    })

    const result = await handleSignUp(data)

    expect(result).toEqual({ success: false, error: 'Email already exists' })
  })

  it('returns generic error on network failure', async () => {
    const data = {
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    }
    mockSignUp.mockRejectedValueOnce(new Error('Network error'))

    const result = await handleSignUp(data)

    expect(result).toEqual({
      success: false,
      error: 'An error occurred during sign up'
    })
  })
})
