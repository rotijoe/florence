import { render, screen } from '@testing-library/react';
import { TrackEventList } from '../index';
import type { EventResponse, EventType } from '@packages/types';

describe('TrackEventList', () => {
  const mockEvents: EventResponse[] = [
    {
      id: '1',
      trackId: 'track-1',
      date: '2025-10-21T14:30:00.000Z',
      title: 'Event 1',
      description: 'First event',
      type: EventType.NOTE,
      fileUrl: null,
      createdAt: '2025-10-21T14:30:00.000Z',
      updatedAt: '2025-10-21T14:30:00.000Z',
    },
    {
      id: '2',
      trackId: 'track-1',
      date: '2025-10-20T10:00:00.000Z',
      title: 'Event 2',
      description: null,
      type: EventType.RESULT,
      fileUrl: null,
      createdAt: '2025-10-20T10:00:00.000Z',
      updatedAt: '2025-10-20T10:00:00.000Z',
    },
  ];

  it('renders all events', () => {
    render(<TrackEventList events={mockEvents} />);

    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
  });

  it('displays event description when present', () => {
    render(<TrackEventList events={mockEvents} />);

    expect(screen.getByText('First event')).toBeInTheDocument();
  });

  it('displays formatted dates', () => {
    render(<TrackEventList events={mockEvents} />);

    expect(screen.getByText(/October 21, 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/October 20, 2025/i)).toBeInTheDocument();
  });

  it('displays event type', () => {
    render(<TrackEventList events={mockEvents} />);

    expect(screen.getByText('NOTE')).toBeInTheDocument();
    expect(screen.getByText('RESULT')).toBeInTheDocument();
  });

  it('renders empty state when no events', () => {
    render(<TrackEventList events={[]} />);

    expect(screen.getByText(/no events/i)).toBeInTheDocument();
  });

  it('displays file link when fileUrl is available', () => {
    const eventsWithFile: EventResponse[] = [
      {
        ...mockEvents[0],
        fileUrl: 'https://example.com/file.pdf',
      },
    ];

    render(<TrackEventList events={eventsWithFile} />);

    const link = screen.getByText(/view attached file/i);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/file.pdf');
  });
});
