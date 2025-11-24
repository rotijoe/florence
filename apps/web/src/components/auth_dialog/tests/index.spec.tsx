import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthDialog } from '../index'

jest.mock('../helpers', () => ({
  handleSignIn: jest.fn(),
  handleSignUp: jest.fn()
}))

import { handleSignIn, handleSignUp } from '../helpers'

const mockHandleSignIn = handleSignIn as jest.MockedFunction<typeof handleSignIn>
const _mockHandleSignUp = handleSignUp as jest.MockedFunction<typeof handleSignUp>

describe('AuthDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders accessible dialog with sign in form', () => {
    render(<AuthDialog {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('switches to sign up form when tab is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    await user.click(screen.getByRole('tab', { name: /sign up/i }))

    // Wait for the signup form content to be rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows error for invalid email format', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'invalid')
    await user.type(passwordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('calls handleSignIn with form data on successful submission', async () => {
    const user = userEvent.setup()
    mockHandleSignIn.mockResolvedValueOnce({ success: true, error: null })

    render(<AuthDialog {...defaultProps} />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockHandleSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows error message when sign in fails', async () => {
    const user = userEvent.setup()
    mockHandleSignIn.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials'
    })

    render(<AuthDialog {...defaultProps} />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockHandleSignIn.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, error: null }), 100))
    )

    render(<AuthDialog {...defaultProps} />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })

  it('calls handleSignUp with form data on successful sign up', async () => {
    const mockHandleSignUp = handleSignUp as jest.MockedFunction<typeof handleSignUp>
    mockHandleSignUp.mockResolvedValueOnce({ success: true, error: null })

    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    await user.click(screen.getByRole('tab', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInputs = screen.getAllByLabelText(/password/i)
    const passwordInput = passwordInputs[0]
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockHandleSignUp).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows error message when sign up fails', async () => {
    const mockHandleSignUp = handleSignUp as jest.MockedFunction<typeof handleSignUp>
    mockHandleSignUp.mockResolvedValueOnce({
      success: false,
      error: 'Email already exists'
    })

    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    await user.click(screen.getByRole('tab', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const passwordInputs = screen.getAllByLabelText(/password/i)
    const passwordInput = passwordInputs[0]
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('resets forms and clears error when dialog is closed', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<AuthDialog {...defaultProps} />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await user.type(emailInput, 'test@example')
    // await user.click(screen.getByRole('button', { name: /sign in/i }))

    // await waitFor(() => {
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    // })

    rerender(<AuthDialog {...defaultProps} open={false} />)

    rerender(<AuthDialog {...defaultProps} open={true} />)

    expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('')
  })
})
