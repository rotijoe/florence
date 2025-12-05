import { render, screen } from '@testing-library/react'
import { HubRecentActivity } from '../index'
import type { RecentActivityItem } from '@/app/[userId]/types'

describe('HubRecentActivity', () => {
  it('renders empty state when no items', () => {
    render(<HubRecentActivity items={[]} />)

    expect(screen.getByText('Recent activity')).toBeInTheDocument()
    expect(screen.getByText(/Recent updates will appear here/)).toBeInTheDocument()
  })

  it('renders activity items when present', () => {
    const items: RecentActivityItem[] = [
      {
        id: '1',
        label: 'Logged symptom: Pain',
        timestampLabel: '2 hours ago'
      }
    ]

    render(<HubRecentActivity items={items} />)

    expect(screen.getByText('Logged symptom: Pain')).toBeInTheDocument()
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
  })
})

