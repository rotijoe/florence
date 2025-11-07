import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthDialog } from '../index';

jest.mock('../helpers', () => ({
  handleSignIn: jest.fn(),
  handleSignUp: jest.fn(),
}));

import { handleSignIn, handleSignUp } from '../helpers';

const mockHandleSignIn = handleSignIn as jest.MockedFunction<typeof handleSignIn>;
const _mockHandleSignUp = handleSignUp as jest.MockedFunction<typeof handleSignUp>;

describe('AuthDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders accessible dialog with sign in form', () => {
    render(<AuthDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to sign up form when tab is clicked', async () => {
    const user = userEvent.setup();
    render(<AuthDialog {...defaultProps} />);

    await user.click(screen.getByRole('tab', { name: /sign up/i }));

    // Wait for the signup form content to be rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  it('shows validation errors for empty required fields', async () => {
    render(<AuthDialog {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid email format', async () => {
    render(<AuthDialog {...defaultProps} />);

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
        target: { value: 'invalid' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('calls handleSignIn with form data on successful submission', async () => {
    mockHandleSignIn.mockResolvedValueOnce({ success: true, error: null });

    render(<AuthDialog {...defaultProps} />);

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(mockHandleSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('shows error message when sign in fails', async () => {
    mockHandleSignIn.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials',
    });

    render(<AuthDialog {...defaultProps} />);

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockHandleSignIn.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, error: null }), 100))
    );

    render(<AuthDialog {...defaultProps} />);

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });
});
