import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../page'

jest.mock('@/components/auth_dialog', () => ({
  AuthDialog: jest.fn(({ open, onOpenChange, defaultTab }) => (
    <div data-testid="auth-dialog" data-open={open} data-default-tab={defaultTab}>
      <button onClick={() => onOpenChange(false)}>Close Dialog</button>
    </div>
  ))
}))

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Florence logo and subtitle', () => {
    render(<HomePage />)

    expect(screen.getByText('Florence')).toBeInTheDocument()
    expect(screen.getByText('Health Tracking')).toBeInTheDocument()
  })

  it('renders Sign In and Sign Up buttons', () => {
    render(<HomePage />)

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('opens auth dialog with signin tab when Sign In button is clicked', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    await waitFor(() => {
      const authDialog = screen.getByTestId('auth-dialog')
      expect(authDialog).toHaveAttribute('data-open', 'true')
      expect(authDialog).toHaveAttribute('data-default-tab', 'signin')
    })
  })

  it('opens auth dialog with signup tab when Sign Up button is clicked', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(signUpButton)

    await waitFor(() => {
      const authDialog = screen.getByTestId('auth-dialog')
      expect(authDialog).toHaveAttribute('data-open', 'true')
      expect(authDialog).toHaveAttribute('data-default-tab', 'signup')
    })
  })

  it('closes auth dialog when onOpenChange is called', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    await waitFor(() => {
      expect(screen.getByTestId('auth-dialog')).toHaveAttribute('data-open', 'true')
    })

    const closeButton = screen.getByText('Close Dialog')
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.getByTestId('auth-dialog')).toHaveAttribute('data-open', 'false')
    })
  })

  it('centers content vertically and horizontally', () => {
    const { container } = render(<HomePage />)

    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center')
  })

  it('renders logo with correct styling', () => {
    render(<HomePage />)

    const logo = screen.getByText('Florence')
    expect(logo).toHaveClass('text-6xl', 'font-bold', 'tracking-tight')
  })

  it('renders subtitle with muted foreground color', () => {
    render(<HomePage />)

    const subtitle = screen.getByText('Health Tracking')
    expect(subtitle).toHaveClass('text-muted-foreground', 'text-lg')
  })
})

