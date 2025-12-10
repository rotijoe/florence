import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import UserLayout from '../layout'
import { getServerSession } from '@/lib/auth_server'

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
  SidebarInset: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid='sidebar-inset' className={className}>
      {children}
    </div>
  )
}))

jest.mock('@/components/app_sidebar', () => ({
  AppSidebar: ({ variant }: { variant?: string }) => (
    <nav data-testid='app-sidebar' data-variant={variant}>
      Sidebar
    </nav>
  )
}))

jest.mock('@/components/site_header', () => ({
  SiteHeader: ({ className }: { className?: string }) => (
    <header data-testid='site-header' className={className}>
      Header
    </header>
  )
}))

describe('UserLayout', () => {
  const mockRedirect = redirect as unknown as jest.Mock
  const mockGetServerSession = getServerSession as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to home when user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const params = Promise.resolve({ userId: 'user-123' })
    await UserLayout({ children: <div>Content</div>, params })

    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('should redirect to home when session has no user', async () => {
    mockGetServerSession.mockResolvedValue({ user: null })

    const params = Promise.resolve({ userId: 'user-123' })
    await UserLayout({ children: <div>Content</div>, params })

    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('should redirect to home when session user has no id', async () => {
    mockGetServerSession.mockResolvedValue({ user: { name: 'John' } })

    const params = Promise.resolve({ userId: 'user-123' })
    await UserLayout({ children: <div>Content</div>, params })

    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('should redirect to home when userId does not match session user id', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'different-user', name: 'John' }
    })

    const params = Promise.resolve({ userId: 'user-123' })
    await UserLayout({ children: <div>Content</div>, params })

    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('should render layout when user is authenticated and userId matches', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', name: 'John Doe' }
    })

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserLayout({
      children: <div data-testid='child-content'>Child Content</div>,
      params
    })

    render(result)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('site-header')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('should render AppSidebar with inset variant', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', name: 'John Doe' }
    })

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserLayout({
      children: <div>Content</div>,
      params
    })

    render(result)

    const sidebar = screen.getByTestId('app-sidebar')
    expect(sidebar).toHaveAttribute('data-variant', 'inset')
  })

  it('should render SiteHeader with sticky positioning class', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', name: 'John Doe' }
    })

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserLayout({
      children: <div>Content</div>,
      params
    })

    render(result)

    const header = screen.getByTestId('site-header')
    expect(header).toHaveClass('sticky', 'top-0', 'z-10')
  })

  it('should render children inside main element', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-123', name: 'John Doe' }
    })

    const params = Promise.resolve({ userId: 'user-123' })
    const result = await UserLayout({
      children: <div data-testid='test-child'>Test Content</div>,
      params
    })

    render(result)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})
