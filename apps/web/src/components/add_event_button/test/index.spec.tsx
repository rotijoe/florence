import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddEventButton } from '../index'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('AddEventButton', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders button with correct text', () => {
    render(<AddEventButton userId='user-123' trackSlug='test-track' />)

    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument()
  })

  it('renders Plus icon', () => {
    const { container } = render(<AddEventButton userId='user-123' trackSlug='test-track' />)

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('navigates to new event page when clicked', async () => {
    const user = userEvent.setup()
    render(<AddEventButton userId='user-123' trackSlug='test-track' />)

    const button = screen.getByRole('button', { name: /add event/i })
    await user.click(button)

    const expectedPath = '/user-123/tracks/test-track/new?returnTo=%2Fuser-123%2Ftracks%2Ftest-track'
    expect(mockPush).toHaveBeenCalledWith(expectedPath)
  })

  it('encodes returnTo parameter correctly', async () => {
    const user = userEvent.setup()
    render(<AddEventButton userId='user-456' trackSlug='my-track' />)

    const button = screen.getByRole('button', { name: /add event/i })
    await user.click(button)

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('returnTo=%2Fuser-456%2Ftracks%2Fmy-track')
    )
  })

  it('has correct styling classes', () => {
    const { container } = render(<AddEventButton userId='user-123' trackSlug='test-track' />)

    const button = screen.getByRole('button', { name: /add event/i })
    expect(button).toHaveClass('w-full')
  })
})
