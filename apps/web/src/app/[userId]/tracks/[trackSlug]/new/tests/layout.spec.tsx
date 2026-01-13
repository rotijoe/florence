import { render, screen } from '@testing-library/react'
import NewEventLayout from '../layout'

describe('NewEventLayout', () => {
  it('renders children correctly', () => {
    render(
      <NewEventLayout>
        <div>Test Content</div>
      </NewEventLayout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const { container } = render(
      <NewEventLayout>
        <div>Test Content</div>
      </NewEventLayout>
    )

    const section = container.querySelector('section')
    expect(section).toHaveClass(
      'mx-auto',
      'flex',
      'w-full',
      'max-w-7xl',
      'flex-col',
      'gap-6',
      'px-4',
      'lg:min-h-[calc(100vh-8rem)]'
    )

    const innerDiv = container.querySelector('section > div')
    expect(innerDiv).toHaveClass('p-4', 'lg:h-full')
  })
})
