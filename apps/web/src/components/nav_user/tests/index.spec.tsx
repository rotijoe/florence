import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavUser } from '../index'
import { useSession } from '@/lib/auth_client'
import { handleSignOut } from '../helpers'

jest.mock('@/lib/auth_client', () => ({
  useSession: jest.fn()
}))

jest.mock('../helpers', () => ({
  handleSignOut: jest.fn()
}))

jest.mock('@/components/auth_dialog', () => ({
  AuthDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) =>
    open ? (
      <div data-testid="auth-dialog" role="dialog">
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    disabled,
    size,
    ...props
  }: {
    children: React.ReactNode
    disabled?: boolean
    size?: string
    [key: string]: unknown
  }) => (
    <button disabled={disabled} data-size={size} {...props}>
      {children}
    </button>
  ),
  useSidebar: () => ({ isMobile: false })
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={src} alt={alt} data-testid="avatar-image" />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  )
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    asChild,
    children
  }: {
    asChild?: boolean
    children: React.ReactNode
  }) => {
    if (asChild) {
      return <>{children}</>
    }
    return <button>{children}</button>
  },
  DropdownMenuContent: ({
    children,
    side,
    align,
    sideOffset
  }: {
    children: React.ReactNode
    side?: string
    align?: string
    sideOffset?: number
  }) => (
    <div
      data-testid="dropdown-content"
      data-side={side}
      data-align={align}
      data-side-offset={sideOffset}
    >
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
    variant
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    className
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    className?: string
  }) => (
    <button onClick={onClick} data-variant={variant} className={className}>
      {children}
    </button>
  )
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockHandleSignOut = handleSignOut as jest.MockedFunction<typeof handleSignOut>

describe('NavUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when session is pending', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
      error: null
    } as unknown as ReturnType<typeof useSession>)

    render(<NavUser />)

    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument()
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renders sign in button when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: { user: null },
      isPending: false,
      error: null
    } as unknown as ReturnType<typeof useSession>)

    render(<NavUser />)

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/access your account/i)).toBeInTheDocument()
  })

  it('opens auth dialog when sign in button is clicked', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: { user: null },
      isPending: false,
      error: null
    } as unknown as ReturnType<typeof useSession>)

    render(<NavUser />)

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    expect(screen.getByTestId('auth-dialog')).toBeInTheDocument()
  })

  it('renders user menu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      isPending: false,
      error: null
    } as unknown as ReturnType<typeof useSession>)

    render(<NavUser />)

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0)
  })

  it('generates initials from full name', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      isPending: false,
      error: null
    } as unknown as ReturnType<typeof useSession>)

    render(<NavUser />)

    const initials = screen.getAllByText('JD')
    expect(initials.length).toBeGreaterThan(0)
    expect(initials[0]).toBeInTheDocument()
  })

  it('generates single initial from single name', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John',
          email: 'john@example.com'
        }
      },
      isPending: false,
      error: null
    } as unknown as ReturnType<typeof useSession>)

    render(<NavUser />)

    const initials = screen.getAllByText('J')
    expect(initials.length).toBeGreaterThan(0)
    expect(initials[0]).toBeInTheDocument()
  })

  it('uses default initial when name is missing', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: null,
          email: 'john@example.com'
        }
      },
      isPending: false,
      error: null
    } as unknown as ReturnType<typeof useSession>)

    render(<NavUser />)

    const initials = screen.getAllByText('U')
    expect(initials.length).toBeGreaterThan(0)
    expect(initials[0]).toBeInTheDocument()
  })

  it('calls handleSignOut when sign out is clicked', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      isPending: false,
      error: null
    } as unknown as ReturnType<typeof useSession>)
    mockHandleSignOut.mockResolvedValue({ success: true })

    render(<NavUser />)

    // Open dropdown menu first - use getAllByText since name appears multiple times
    const nameElements = screen.getAllByText('John Doe')
    const trigger = nameElements[0].closest('button')
    if (trigger) {
      await user.click(trigger)
    }

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    expect(mockHandleSignOut).toHaveBeenCalled()
  })

  it('shows signing out state during sign out', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      isPending: false,
      error: null
    } as unknown as ReturnType<typeof useSession>)
    mockHandleSignOut.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    )

    render(<NavUser />)

    const nameElements = screen.getAllByText('John Doe')
    const trigger = nameElements[0].closest('button')
    if (trigger) {
      await user.click(trigger)
    }

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    await waitFor(() => {
      expect(screen.getByText('Signing out...')).toBeInTheDocument()
    })
  })
})
