import { handleSignIn } from '../helpers'
import { signIn } from '@/lib/auth_client'

jest.mock('@/lib/auth_client', () => ({
  signIn: { email: jest.fn() }
}))

const mockSignIn = signIn.email as jest.MockedFunction<typeof signIn.email>

describe('handleSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success when sign in succeeds', async () => {
    const data = { email: 'test@example.com', password: 'password123' }
    mockSignIn.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null
    })

    const result = await handleSignIn(data)

    expect(result).toEqual({ success: true, error: null, userId: 'user-123' })
    expect(mockSignIn).toHaveBeenCalledWith({
      email: data.email,
      password: data.password
    })
  })

  it('returns error when sign in fails', async () => {
    const data = { email: 'test@example.com', password: 'wrongpassword' }
    mockSignIn.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid credentials' }
    })

    const result = await handleSignIn(data)

    expect(result).toEqual({ success: false, error: 'Invalid credentials' })
  })

  it('returns generic error on network failure', async () => {
    const data = { email: 'test@example.com', password: 'password123' }
    mockSignIn.mockRejectedValueOnce(new Error('Network error'))

    const result = await handleSignIn(data)

    expect(result).toEqual({
      success: false,
      error: 'Network error'
    })
  })

  it('returns generic error when error is not an Error instance', async () => {
    const data = { email: 'test@example.com', password: 'password123' }
    mockSignIn.mockRejectedValueOnce('String error')

    const result = await handleSignIn(data)

    expect(result).toEqual({
      success: false,
      error: 'An error occurred during sign in'
    })
  })

  it('returns error when user ID is missing from response', async () => {
    const data = { email: 'test@example.com', password: 'password123' }
    mockSignIn.mockResolvedValueOnce({
      data: { user: null },
      error: null
    })

    const result = await handleSignIn(data)

    expect(result).toEqual({
      success: false,
      error: 'User ID not found in response'
    })
  })
})
