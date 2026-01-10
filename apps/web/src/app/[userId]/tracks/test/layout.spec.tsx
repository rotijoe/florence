import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth_server'
import UserLayout from '@/app/[userId]/layout'

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

jest.mock('@/lib/auth_server', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sidebar-provider'>{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sidebar-inset'>{children}</div>
  )
}))

jest.mock('@/components/app_sidebar', () => ({
  AppSidebar: () => <div data-testid='app-sidebar'>AppSidebar</div>
}))

jest.mock('@/components/site_header', () => ({
  SiteHeader: () => <div data-testid='site-header'>SiteHeader</div>
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
    it('should redirect to session user page when userId does not match session user', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'user-2', name: 'Test User', email: 'test@test.com' },
        session: {}
      })

      await UserLayout({
        children: <div>Content</div>,
        params: createParams('user-1')
      })

      expect(mockRedirect).toHaveBeenCalledWith('/user-2')
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
    it('should render sidebar components and children when authorized', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
        session: {}
      })

      const result = await UserLayout({
        children: <div data-testid='test-content'>Test Content</div>,
        params: createParams('user-1')
      })

      const { container } = render(result as React.ReactElement)

      expect(container.querySelector('[data-testid="sidebar-provider"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="app-sidebar"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="site-header"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="test-content"]')).toBeInTheDocument()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })
})
