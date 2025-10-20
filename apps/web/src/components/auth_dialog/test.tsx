import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthDialog } from './index'

// Mock the auth client
jest.mock('@/lib/auth_client', () => ({
  signIn: {
    email: jest.fn()
  },
  signUp: {
    email: jest.fn()
  }
}))

describe('AuthDialog', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign in form by default', () => {
    render(<AuthDialog open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('switches between sign in and sign up tabs', () => {
    render(<AuthDialog open={true} onOpenChange={mockOnOpenChange} />)

    const signUpTab = screen.getByText('Sign Up')
    fireEvent.click(signUpTab)

    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<AuthDialog open={true} onOpenChange={mockOnOpenChange} />)

    const submitButton = screen.getByText('Sign In')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<AuthDialog open={true} onOpenChange={mockOnOpenChange} />)

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const passwordInput = screen.getByLabelText('Password')
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Sign In')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
    })
  })

  it('validates password confirmation', async () => {
    render(<AuthDialog open={true} onOpenChange={mockOnOpenChange} />)

    const signUpTab = screen.getByText('Sign Up')
    fireEvent.click(signUpTab)

    const passwordInput = screen.getByLabelText('Password')
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'different123' }
    })

    const submitButton = screen.getByText('Sign Up')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
    })
  })
})
