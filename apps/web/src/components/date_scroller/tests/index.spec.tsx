import { render, screen } from '@testing-library/react';
import { DateScroller } from '../index';

describe('DateScroller', () => {
  const referenceDate = '2025-05-09T00:00:00.000Z';

  it('renders seven days for the current week', () => {
    render(<DateScroller referenceDate={referenceDate} />);

    const dayButtons = screen.getAllByRole('button');

    expect(dayButtons).toHaveLength(7);
    expect(screen.getByRole('button', { name: /mon 5/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sun 11/i })).toBeInTheDocument();
  });

  it('highlights the selected day', () => {
    render(<DateScroller referenceDate={referenceDate} />);

    const selectedButton = screen.getByRole('button', { name: /fri 9/i });
    expect(selectedButton).toHaveAttribute('aria-current', 'date');
    expect(selectedButton).toHaveAttribute('data-selected', 'true');
  });
});
