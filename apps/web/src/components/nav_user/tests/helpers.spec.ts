import { handleSignOut } from '../helpers'
import { signOut } from '@/lib/auth_client'

jest.mock('@/lib/auth_client', () => ({
  signOut: jest.fn()
}))

const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

describe('handleSignOut', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success when sign out succeeds', async () => {
    mockSignOut.mockResolvedValueOnce(undefined)

    const result = await handleSignOut()

    expect(result).toEqual({ success: true })
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('returns error when sign out fails', async () => {
    const error = new Error('Sign out failed')
    mockSignOut.mockRejectedValueOnce(error)

    const result = await handleSignOut()

    expect(result).toEqual({
      success: false,
      error: 'Sign out failed'
    })
  })

  it('handles non-Error exceptions', async () => {
    mockSignOut.mockRejectedValueOnce('String error')

    const result = await handleSignOut()

    expect(result).toEqual({
      success: false,
      error: 'Failed to sign out'
    })
  })
})

