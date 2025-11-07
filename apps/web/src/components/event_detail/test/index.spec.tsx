import { render, screen } from '@testing-library/react';
import { EventDetail } from '../index';
import type { EventResponse } from '@packages/types';
import { EventType } from '@packages/types';

describe('EventDetail', () => {
  const mockEvent: EventResponse = {
    id: '1',
    trackId: 'track-1',
    date: '2025-10-21T14:30:00.000Z',
    title: 'Test Event',
    description: 'Test Description',
    type: EventType.NOTE,
    fileUrl: 'https://example.com/file.pdf',
    createdAt: '2025-10-21T14:30:00.000Z',
    updatedAt: '2025-10-21T14:30:00.000Z',
  };

  it('renders event title', () => {
    render(<EventDetail event={mockEvent} />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('displays formatted event date', () => {
    render(<EventDetail event={mockEvent} />);

    // There are multiple date instances, so use getAllByText
    const dates = screen.getAllByText(/21 October 2025/i);
    expect(dates.length).toBeGreaterThan(0);
  });

  it('displays event type', () => {
    render(<EventDetail event={mockEvent} />);

    expect(screen.getByText('NOTE')).toBeInTheDocument();
  });

  it('displays event description when present', () => {
    render(<EventDetail event={mockEvent} />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays file link when fileUrl is available', () => {
    render(<EventDetail event={mockEvent} />);

    const link = screen.getByText(/view attached file/i);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/file.pdf');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('displays created timestamp', () => {
    render(<EventDetail event={mockEvent} />);

    expect(screen.getByText(/Created:/i)).toBeInTheDocument();
    // There are multiple date instances, so use getAllByText
    const dates = screen.getAllByText(/21 October 2025/i);
    expect(dates.length).toBeGreaterThan(0);
  });

  it('displays updated timestamp when different from created', () => {
    const eventWithUpdate: EventResponse = {
      ...mockEvent,
      updatedAt: '2025-10-22T10:00:00.000Z',
    };

    render(<EventDetail event={eventWithUpdate} />);

    expect(screen.getByText(/Updated:/i)).toBeInTheDocument();
  });

  it('does not display updated timestamp when same as created', () => {
    render(<EventDetail event={mockEvent} />);

    expect(screen.queryByText(/Updated:/i)).not.toBeInTheDocument();
  });

  it('handles event without description', () => {
    const eventWithoutDescription: EventResponse = {
      ...mockEvent,
      description: null,
    };

    render(<EventDetail event={eventWithoutDescription} />);

    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('handles event without fileUrl', () => {
    const eventWithoutFile: EventResponse = {
      ...mockEvent,
      fileUrl: null,
    };

    render(<EventDetail event={eventWithoutFile} />);

    expect(screen.queryByText(/view attached file/i)).not.toBeInTheDocument();
  });
});
