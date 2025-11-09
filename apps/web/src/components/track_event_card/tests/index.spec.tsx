import { render, screen } from '@testing-library/react';
import { TrackEventCard } from '../index';
import { EventType, type EventResponse } from '@packages/types';

describe('TrackEventCard', () => {
  const mockEvent: EventResponse = {
    id: '1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    title: 'Test Event',
    description: 'Test description',
    type: EventType.NOTE,
    fileUrl: null,
    createdAt: '2025-10-21T14:30:00.000Z',
    updatedAt: '2025-10-21T14:30:00.000Z',
  };

  it('renders event title', () => {
    render(<TrackEventCard event={mockEvent} isActive={false} />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders event description when present', () => {
    render(<TrackEventCard event={mockEvent} isActive={false} />);

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('does not render description when absent', () => {
    const eventWithoutDescription = { ...mockEvent, description: null };
    render(<TrackEventCard event={eventWithoutDescription} isActive={false} />);

    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('displays formatted event time', () => {
    render(<TrackEventCard event={mockEvent} isActive={false} />);

    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('displays event type', () => {
    render(<TrackEventCard event={mockEvent} isActive={false} />);

    expect(screen.getByText('NOTE')).toBeInTheDocument();
  });

  it('applies active styles when isActive is true', () => {
    render(<TrackEventCard event={mockEvent} isActive={true} />);

    const card = screen.getByTestId('track-event-card');
    expect(card).toHaveAttribute('data-active', 'true');
  });

  it('applies inactive styles when isActive is false', () => {
    render(<TrackEventCard event={mockEvent} isActive={false} />);

    const card = screen.getByTestId('track-event-card');
    expect(card).toHaveAttribute('data-active', 'false');
  });

  it('renders different event types correctly', () => {
    const appointmentEvent = { ...mockEvent, type: EventType.APPOINTMENT };
    render(<TrackEventCard event={appointmentEvent} isActive={false} />);

    expect(screen.getByText('APPOINTMENT')).toBeInTheDocument();
  });
});

