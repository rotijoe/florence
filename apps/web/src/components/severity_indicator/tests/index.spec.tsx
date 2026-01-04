import { render, screen } from '@testing-library/react'
import { SeverityIndicator } from '../index'

describe('SeverityIndicator', () => {
  it('renders 5 severity dots', () => {
    render(<SeverityIndicator severity={3} />)

    const container = screen.getByLabelText('Severity 3 out of 5')
    expect(container).toBeInTheDocument()
    expect(container.children).toHaveLength(5)
  })

  it('fills correct number of dots based on severity', () => {
    render(<SeverityIndicator severity={3} />)

    const container = screen.getByLabelText('Severity 3 out of 5')
    const dots = Array.from(container.children)

    expect(dots[0]).toHaveClass('bg-current')
    expect(dots[1]).toHaveClass('bg-current')
    expect(dots[2]).toHaveClass('bg-current')
    expect(dots[3]).toHaveClass('bg-transparent')
    expect(dots[4]).toHaveClass('bg-transparent')
  })

  it('defaults to severity 1 when severity is null', () => {
    render(<SeverityIndicator severity={null} />)

    const container = screen.getByLabelText('Severity 1 out of 5')
    expect(container).toBeInTheDocument()
  })

  it('defaults to severity 1 when severity is undefined', () => {
    render(<SeverityIndicator severity={undefined} />)

    const container = screen.getByLabelText('Severity 1 out of 5')
    expect(container).toBeInTheDocument()
  })

  it('renders all dots filled for severity 5', () => {
    render(<SeverityIndicator severity={5} />)

    const container = screen.getByLabelText('Severity 5 out of 5')
    const dots = Array.from(container.children)

    dots.forEach((dot) => {
      expect(dot).toHaveClass('bg-current')
    })
  })

  it('renders no dots filled for severity 0', () => {
    render(<SeverityIndicator severity={0} />)

    const container = screen.getByLabelText('Severity 0 out of 5')
    const dots = Array.from(container.children)

    dots.forEach((dot) => {
      expect(dot).toHaveClass('bg-transparent')
    })
  })
})

