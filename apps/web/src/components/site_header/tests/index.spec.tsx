import { render, screen } from '@testing-library/react'
import { SiteHeader } from '../index'
import { generateBreadcrumbs } from '../helpers'

jest.mock('../helpers', () => ({
  generateBreadcrumbs: jest.fn()
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/tracks/test-track')
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button data-testid='sidebar-trigger' className={className}>
      Menu
    </button>
  )
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation, className }: { orientation?: string; className?: string }) => (
    <hr data-testid='separator' data-orientation={orientation} className={className} />
  )
}))

jest.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => (
    <nav data-testid='breadcrumb'>{children}</nav>
  ),
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => (
    <ol data-testid='breadcrumb-list'>{children}</ol>
  ),
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => (
    <li data-testid='breadcrumb-item'>{children}</li>
  ),
  BreadcrumbLink: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    if (asChild) {
      return <>{children}</>
    }
    return <a href='https://www.google.com'>{children}</a>
  },
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => (
    <span data-testid='breadcrumb-page'>{children}</span>
  ),
  BreadcrumbSeparator: () => <span data-testid='breadcrumb-separator'>/</span>
}))

const mockGenerateBreadcrumbs = generateBreadcrumbs as jest.MockedFunction<
  typeof generateBreadcrumbs
>

describe('SiteHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sidebar trigger', () => {
    mockGenerateBreadcrumbs.mockReturnValue([])

    render(<SiteHeader />)

    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
  })

  it('renders separator', () => {
    mockGenerateBreadcrumbs.mockReturnValue([])

    render(<SiteHeader />)

    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })

  it('renders "Home" when no breadcrumbs', () => {
    mockGenerateBreadcrumbs.mockReturnValue([])

    render(<SiteHeader />)

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders single breadcrumb as heading', () => {
    mockGenerateBreadcrumbs.mockReturnValue([{ label: 'Tracks', href: '/tracks' }])

    render(<SiteHeader />)

    expect(screen.getByText('Tracks')).toBeInTheDocument()
  })

  it('renders breadcrumb navigation when multiple breadcrumbs', () => {
    mockGenerateBreadcrumbs.mockReturnValue([
      { label: 'home', href: '/' },
      { label: 'tracks', href: '/tracks' },
      { label: 'test-track', href: '/tracks/test-track' }
    ])

    render(<SiteHeader />)

    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tracks/i })).toBeInTheDocument()
    expect(screen.getByTestId('breadcrumb-page')).toHaveTextContent('test-track')
  })

  it('applies custom className', () => {
    mockGenerateBreadcrumbs.mockReturnValue([])

    render(<SiteHeader className='custom-class' />)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('custom-class')
  })
})
