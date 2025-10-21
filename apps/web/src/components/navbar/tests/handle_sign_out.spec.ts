import { handleSignOut } from '../helpers'
import { signOut } from '@/lib/auth_client'

jest.mock('@/lib/auth_client', () => ({
  signOut: jest.fn()
}))

describe('handleSignOut', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success when sign out is successful', async () => {
    const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
    mockSignOut.mockResolvedValueOnce(undefined)

    const result = await handleSignOut()

    expect(result).toEqual({ success: true, error: null })
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('returns error when sign out fails with Error instance', async () => {
    const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
    const errorMessage = 'Network error'
    mockSignOut.mockRejectedValueOnce(new Error(errorMessage))

    const result = await handleSignOut()

    expect(result).toEqual({ success: false, error: errorMessage })
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('returns generic error message when sign out fails with non-Error', async () => {
    const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
    mockSignOut.mockRejectedValueOnce('Unknown error')

    const result = await handleSignOut()

    expect(result).toEqual({
      success: false,
      error: 'An error occurred during sign out'
    })
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})
