import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../page'

jest.mock('@/lib/auth_server', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/components/auth_dialog', () => ({
  AuthDialog: jest.fn(({ open, onOpenChange, defaultTab }) => (
    <div data-testid='auth-dialog' data-open={open} data-default-tab={defaultTab}>
      <button onClick={() => onOpenChange(false)}>Close Dialog</button>
    </div>
  ))
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, priority, ...props }: { src: string; alt: string; priority?: boolean }) => (
    <img src={src} alt={alt} {...props} data-testid='logo-image' />
  )
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

describe('HomePage', () => {
  const { getServerSession } = require('@/lib/auth_server')

  beforeEach(() => {
    jest.clearAllMocks()
    getServerSession.mockResolvedValue(null)
  })

  describe('when user is not authenticated', () => {
    it('renders logo image', async () => {
      render(await HomePage())

      expect(screen.getByTestId('logo-image')).toBeInTheDocument()
      expect(screen.getByTestId('logo-image')).toHaveAttribute('alt', 'Florence')
    })

    it('renders Sign In and Sign Up buttons', async () => {
      render(await HomePage())

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('opens auth dialog with signin tab when Sign In button is clicked', async () => {
      const user = userEvent.setup()
      render(await HomePage())

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
      render(await HomePage())

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
      render(await HomePage())

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
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com'
        },
        session: {}
      })
    })

    it('renders logo image', async () => {
      render(await HomePage())

      expect(screen.getByTestId('logo-image')).toBeInTheDocument()
    })

    it('renders Go to Hub button instead of auth buttons', async () => {
      render(await HomePage())

      expect(screen.getByRole('link', { name: /go to hub/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument()
    })

    it('links to user hub page', async () => {
      render(await HomePage())

      const hubLink = screen.getByRole('link', { name: /go to hub/i })
      expect(hubLink).toHaveAttribute('href', '/user-123')
    })
  })

  it('centers content vertically and horizontally', async () => {
    const { container } = render(await HomePage())

    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center')
  })
})
