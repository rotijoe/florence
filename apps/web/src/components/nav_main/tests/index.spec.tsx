import { render, screen } from '@testing-library/react'
import { NavMain } from '../index'
import type { NavMainItem } from '../index'
import type { LucideIcon } from 'lucide-react'
import React from 'react'

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    asChild,
    tooltip
  }: {
    children: React.ReactNode
    asChild?: boolean
    tooltip?: string
  }) => {
    if (asChild) {
      return <>{children}</>
    }
    return <button title={tooltip}>{children}</button>
  },
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  )
}))

// Mock LucideIcon components
const HomeIcon = React.forwardRef<SVGSVGElement>((props, ref) => (
  <svg ref={ref} data-testid="home-icon" {...props}>
    <text>🏠</text>
  </svg>
)) as LucideIcon
HomeIcon.displayName = 'HomeIcon'

const TracksIcon = React.forwardRef<SVGSVGElement>((props, ref) => (
  <svg ref={ref} data-testid="tracks-icon" {...props}>
    <text>📊</text>
  </svg>
)) as LucideIcon
TracksIcon.displayName = 'TracksIcon'

describe('NavMain', () => {
  const mockItems: NavMainItem[] = [
    {
      title: 'Home',
      url: '/',
      icon: HomeIcon
    },
    {
      title: 'Tracks',
      url: '/user-123/tracks',
      icon: TracksIcon
    }
  ]

  it('renders navigation items', () => {
    render(<NavMain items={mockItems} />)

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tracks/i })).toBeInTheDocument()
  })

  it('renders icons when provided', () => {
    render(<NavMain items={mockItems} />)

    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    expect(screen.getByTestId('tracks-icon')).toBeInTheDocument()
  })

  it('renders items without icons', () => {
    const itemsWithoutIcons: NavMainItem[] = [
      { title: 'Home', url: '/' },
      { title: 'About', url: '/about' }
    ]

    render(<NavMain items={itemsWithoutIcons} />)

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
  })

  it('sets correct href attributes', () => {
    render(<NavMain items={mockItems} />)

    const homeLink = screen.getByRole('link', { name: /home/i })
    const tracksLink = screen.getByRole('link', { name: /tracks/i })

    expect(homeLink).toHaveAttribute('href', '/')
    expect(tracksLink).toHaveAttribute('href', '/user-123/tracks')
  })
})
