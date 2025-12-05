import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ButtonDropdown } from '../index'
import type { ButtonDropdownProps } from '../types'

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dropdown-menu'>{children}</div>
  ),
  DropdownMenuTrigger: ({
    asChild,
    children
  }: {
    asChild?: boolean
    children: React.ReactNode
  }) => {
    if (asChild) {
      return <>{children}</>
    }
    return <button>{children}</button>
  },
  DropdownMenuContent: ({
    children,
    align,
    className
  }: {
    children: React.ReactNode
    align?: string
    className?: string
  }) => (
    <div data-testid='dropdown-content' data-align={align} className={className}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect
  }: {
    children: React.ReactNode
    onSelect?: () => void
  }) => (
    <button onClick={onSelect} data-testid='dropdown-menu-item'>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  )
}))

jest.mock('lucide-react', () => ({
  MoreVertical: () => <span data-testid='more-vertical-icon'>MoreVertical</span>
}))

describe('ButtonDropdown', () => {
  const mockDropdownItems: ButtonDropdownProps['dropdownItems'] = [
    { label: 'Option 1', onSelect: jest.fn() },
    { label: 'Option 2', onSelect: jest.fn() },
    { label: 'Option 3', onSelect: jest.fn() }
  ]

  const defaultProps: ButtonDropdownProps = {
    text: 'Test Button',
    dropdownItems: mockDropdownItems
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders button with text', () => {
    render(<ButtonDropdown {...defaultProps} />)

    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('renders MoreVertical icon', () => {
    render(<ButtonDropdown {...defaultProps} />)

    expect(screen.getByTestId('more-vertical-icon')).toBeInTheDocument()
  })

  it('renders dropdown menu', () => {
    render(<ButtonDropdown {...defaultProps} />)

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
  })

  it('renders dropdown content with max-w-md class', () => {
    render(<ButtonDropdown {...defaultProps} />)

    const content = screen.getByTestId('dropdown-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('max-w-md')
  })

  it('renders dropdown content aligned to start', () => {
    render(<ButtonDropdown {...defaultProps} />)

    const content = screen.getByTestId('dropdown-content')
    expect(content).toHaveAttribute('data-align', 'start')
  })

  it('renders all dropdown items', () => {
    render(<ButtonDropdown {...defaultProps} />)

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('calls onSelect when dropdown item is clicked', async () => {
    const user = userEvent.setup()
    const onSelect1 = jest.fn()
    const onSelect2 = jest.fn()
    const items = [
      { label: 'Item 1', onSelect: onSelect1 },
      { label: 'Item 2', onSelect: onSelect2 }
    ]

    render(<ButtonDropdown text='Test' dropdownItems={items} />)

    const item1 = screen.getByText('Item 1')
    await user.click(item1)

    expect(onSelect1).toHaveBeenCalledTimes(1)
    expect(onSelect2).not.toHaveBeenCalled()
  })

  it('renders button with correct variant and classes', () => {
    render(<ButtonDropdown {...defaultProps} />)

    const button = screen.getByText('Test Button').closest('button')
    expect(button).toHaveClass('justify-between', 'rounded-full', 'px-5')
  })

  it('handles empty dropdown items array', () => {
    render(<ButtonDropdown text='Test' dropdownItems={[]} />)

    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    expect(screen.queryAllByTestId('dropdown-menu-item')).toHaveLength(0)
  })
})

