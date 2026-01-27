import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TracksError from '../error'

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('Error', () => {
  const mockReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders error message', () => {
    const error = new Error('Test error message')
    render(<TracksError error={error} reset={mockReset} />)

    expect(screen.getByText("Couldn't load your tracks")).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders default message when error.message is empty', () => {
    const error = new Error('')
    render(<TracksError error={error} reset={mockReset} />)

    expect(screen.getByText("Couldn't load your tracks")).toBeInTheDocument()
    expect(screen.getByText('An error occurred while loading your tracks')).toBeInTheDocument()
  })

  it('calls reset function on button click', async () => {
    const error = new Error('Test error')
    const user = userEvent.setup()
    render(<TracksError error={error} reset={mockReset} />)

    const resetButton = screen.getByRole('button', { name: /try again/i })
    await user.click(resetButton)

    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('logs error to console on mount', () => {
    const error = new Error('Test error message')
    render(<TracksError error={error} reset={mockReset} />)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Tracks page error:', error)
  })
})
