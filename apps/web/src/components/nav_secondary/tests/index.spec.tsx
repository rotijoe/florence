import { render, screen } from '@testing-library/react'
import { NavSecondary } from '../index'
import type { NavSecondaryItem } from '../index'
import type { LucideIcon } from 'lucide-react'
import React from 'react'

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="sidebar-group" {...props}>
      {children}
    </div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    if (asChild) {
      return <>{children}</>
    }
    return <button>{children}</button>
  },
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  )
}))

// Mock LucideIcon components
const SettingsIcon = React.forwardRef<SVGSVGElement>((props, ref) => (
  <svg ref={ref} data-testid="settings-icon" {...props}><text>⚙️</text></svg>
)) as LucideIcon
SettingsIcon.displayName = 'SettingsIcon'

const HelpIcon = React.forwardRef<SVGSVGElement>((props, ref) => (
  <svg ref={ref} data-testid="help-icon" {...props}><text>❓</text></svg>
)) as LucideIcon
HelpIcon.displayName = 'HelpIcon'

describe('NavSecondary', () => {
  const mockItems: NavSecondaryItem[] = [
    {
      title: 'Settings',
      url: '/settings',
      icon: SettingsIcon
    },
    {
      title: 'Help',
      url: '/help',
      icon: HelpIcon
    }
  ]

  it('renders navigation items', () => {
    render(<NavSecondary items={mockItems} />)

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /help/i })).toBeInTheDocument()
  })

  it('renders icons for all items', () => {
    render(<NavSecondary items={mockItems} />)

    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    expect(screen.getByTestId('help-icon')).toBeInTheDocument()
  })

  it('sets correct href attributes', () => {
    render(<NavSecondary items={mockItems} />)

    const settingsLink = screen.getByRole('link', { name: /settings/i })
    const helpLink = screen.getByRole('link', { name: /help/i })

    expect(settingsLink).toHaveAttribute('href', '/settings')
    expect(helpLink).toHaveAttribute('href', '/help')
  })

  it('passes additional props to SidebarGroup', () => {
    render(<NavSecondary items={mockItems} className="custom-class" />)

    const sidebarGroup = screen.getByTestId('sidebar-group')
    expect(sidebarGroup).toHaveClass('custom-class')
  })
})
