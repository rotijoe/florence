import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth_server'
import UserLayout from '../layout'

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

jest.mock('@/lib/auth_server', () => ({
  getServerSession: jest.fn()
}))

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('UserLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  function createParams(userId: string): Promise<{ userId: string }> {
    return Promise.resolve({ userId })
  }

  describe('authentication', () => {
    it('should redirect to home when session is null', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)

      await UserLayout({
        children: <div>Content</div>,
        params: createParams('user-1')
      })

      expect(mockRedirect).toHaveBeenCalledWith('/')
    })

    it('should redirect to home when session has no user', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: null,
        session: null
      })

      await UserLayout({
        children: <div>Content</div>,
        params: createParams('user-1')
      })

      expect(mockRedirect).toHaveBeenCalledWith('/')
    })

    it('should redirect to home when user has no id', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: '', name: 'Test', email: 'test@test.com' },
        session: {}
      })

      await UserLayout({
        children: <div>Content</div>,
        params: createParams('user-1')
      })

      expect(mockRedirect).toHaveBeenCalledWith('/')
    })
  })

  describe('authorization', () => {
    it('should redirect to home when userId does not match session user', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'user-2', name: 'Test User', email: 'test@test.com' },
        session: {}
      })

      await UserLayout({
        children: <div>Content</div>,
        params: createParams('user-1')
      })

      expect(mockRedirect).toHaveBeenCalledWith('/')
    })

    it('should not redirect when userId matches session user', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
        session: {}
      })

      await UserLayout({
        children: <div>Content</div>,
        params: createParams('user-1')
      })

      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('rendering', () => {
    it('should render children when authorized', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
        session: {}
      })

      const result = await UserLayout({
        children: <div>Test Content</div>,
        params: createParams('user-1')
      })

      expect(result).toBeTruthy()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })
})
