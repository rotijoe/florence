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
      data: { user: { id: '1' } },
      error: null
    })

    const result = await handleSignIn(data)

    expect(result).toEqual({ success: true, error: null })
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
      error: 'An error occurred during sign in'
    })
  })
})
