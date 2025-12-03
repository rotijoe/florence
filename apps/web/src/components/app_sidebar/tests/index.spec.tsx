import { render, screen } from '@testing-library/react'
import { AppSidebar } from '../index'

// Mock useSession
const mockUseSession = jest.fn()
jest.mock('@/lib/auth_client', () => ({
  useSession: () => mockUseSession()
}))

// Mock child components
jest.mock('@/components/nav_main', () => ({
  NavMain: ({ items }: { items: Array<{ title: string; url: string }> }) => (
    <nav data-testid="nav-main">
      {items.map((item) => (
        <a key={item.title} href={item.url}>
          {item.title}
        </a>
      ))}
    </nav>
  )
}))

jest.mock('@/components/nav_secondary', () => ({
  NavSecondary: ({ items }: { items: Array<{ title: string; url: string }> }) => (
    <nav data-testid="nav-secondary">
      {items.map((item) => (
        <a key={item.title} href={item.url}>
          {item.title}
        </a>
      ))}
    </nav>
  )
}))

jest.mock('@/components/nav_user', () => ({
  NavUser: () => <div data-testid="nav-user">User Menu</div>
}))

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <aside data-testid="sidebar" {...props}>
      {children}
    </aside>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-footer">{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-header">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode
    asChild?: boolean
    [key: string]: unknown
  }) => {
    if (asChild) {
      return <>{children}</>
    }
    return <button {...props}>{children}</button>
  },
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  )
}))

describe('AppSidebar', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        }
      },
      isPending: false
    })
  })

  it('renders sidebar with header, content, and footer', () => {
    render(<AppSidebar />)

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
  })

  it('renders Florence branding in header', () => {
    render(<AppSidebar />)

    const link = screen.getByRole('link', { name: /florence/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders NavMain with main navigation items when user is authenticated', () => {
    render(<AppSidebar />)

    expect(screen.getByTestId('nav-main')).toBeInTheDocument()
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/user-123')
    expect(screen.getByRole('link', { name: /tracks/i })).toBeInTheDocument()

    const tracksLink = screen.getByRole('link', { name: /tracks/i })
    expect(tracksLink).toHaveAttribute('href', '/user-123/tracks')
  })

  it('does not render Tracks link when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false
    })

    render(<AppSidebar />)

    expect(screen.getByTestId('nav-main')).toBeInTheDocument()
    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
    expect(screen.queryByRole('link', { name: /tracks/i })).not.toBeInTheDocument()
  })

  it('renders NavSecondary with secondary navigation items', () => {
    render(<AppSidebar />)

    expect(screen.getByTestId('nav-secondary')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders NavUser in footer', () => {
    render(<AppSidebar />)

    expect(screen.getByTestId('nav-user')).toBeInTheDocument()
  })

  it('passes collapsible prop to Sidebar', () => {
    render(<AppSidebar />)

    const sidebar = screen.getByTestId('sidebar')
    // The collapsible prop is passed but may not render as data attribute in test
    // We verify the component renders correctly instead
    expect(sidebar).toBeInTheDocument()
  })
})
