import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from '../index'

// Mock the auth client
const mockUseSession = jest.fn()
jest.mock('@/lib/auth_client', () => ({
  useSession: () => mockUseSession(),
  signOut: jest.fn()
}))

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign in button when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false
    })

    render(<Navbar />)

    expect(screen.getByText('Sign In / Sign Up')).toBeInTheDocument()
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
  })

  it('renders user name and sign out button when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      isPending: false
    })

    render(<Navbar />)

    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
    expect(screen.queryByText('Sign In / Sign Up')).not.toBeInTheDocument()
  })

  it('shows loading state while session is pending', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true
    })

    render(<Navbar />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('opens auth dialog when sign in button is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false
    })

    render(<Navbar />)

    const signInButton = screen.getByText('Sign In / Sign Up')

    await userEvent.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText('Welcome to Florence')).toBeInTheDocument()
    })

    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls sign out when sign out button is clicked', async () => {
    const mockSignOut = jest.fn()
    jest.doMock('@/lib/auth_client', () => ({
      useSession: () => mockUseSession(),
      signOut: mockSignOut
    }))

    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      },
      isPending: false
    })

    render(<Navbar />)

    const signOutButton = screen.getByText('Sign Out')

    await userEvent.click(signOutButton)
  })
})
