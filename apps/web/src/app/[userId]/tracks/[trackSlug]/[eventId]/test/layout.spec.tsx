import { render, screen } from '@testing-library/react'
import EventLayout from '../layout'

describe('EventLayout', () => {
  it('renders children correctly', () => {
    render(
      <EventLayout>
        <div>Test Content</div>
      </EventLayout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with correct semantic structure', () => {
    const { container } = render(
      <EventLayout>
        <div>Test Content</div>
      </EventLayout>
    )

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section?.tagName).toBe('SECTION')
  })

  it('applies correct CSS classes to section', () => {
    const { container } = render(
      <EventLayout>
        <div>Test Content</div>
      </EventLayout>
    )

    const section = container.querySelector('section')
    expect(section).toHaveClass('mx-auto', 'flex', 'w-full', 'max-w-7xl', 'flex-col', 'gap-6', 'px-4', 'lg:min-h-[calc(100vh-8rem)]')
  })

  it('wraps children in inner div with correct classes', () => {
    const { container } = render(
      <EventLayout>
        <div>Test Content</div>
      </EventLayout>
    )

    const innerDiv = container.querySelector('section > div')
    expect(innerDiv).toHaveClass('p-4', 'lg:h-full')
  })

  it('renders multiple children correctly', () => {
    render(
      <EventLayout>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </EventLayout>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('renders empty children without error', () => {
    const { container } = render(<EventLayout>{null}</EventLayout>)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
  })
})

