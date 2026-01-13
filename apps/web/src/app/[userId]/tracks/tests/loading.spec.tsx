import { render, screen } from '@testing-library/react'
import Loading from '../loading'

describe('Loading', () => {
  it('renders loading skeleton structure', () => {
    render(<Loading />)

    // Verify skeletons are rendered (user-visible loading state)
    const skeletons = screen.getAllByRole('generic', { hidden: true })
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders multiple skeleton elements', () => {
    render(<Loading />)

    // Verify multiple skeleton elements are present (user sees loading placeholders)
    const skeletons = screen.getAllByRole('generic', { hidden: true })
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
  })
})
