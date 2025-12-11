import { render, screen } from '@testing-library/react'
import NewEventPage from '../page'

jest.mock('@/components/event_detail', () => ({
  EventDetail: ({ mode }: { mode: 'create' | 'edit' }) => (
    <div data-testid='event-detail' data-mode={mode}>
      New Event Form
    </div>
  )
}))

describe('NewEventPage', () => {
  it('renders EventDetail in create mode', async () => {
    const params = Promise.resolve({ userId: 'user-1', trackSlug: 'test-track' })
    const result = await NewEventPage({ params })
    render(result)

    const eventDetail = screen.getByTestId('event-detail')
    expect(eventDetail).toBeInTheDocument()
    expect(eventDetail).toHaveAttribute('data-mode', 'create')
  })
})
