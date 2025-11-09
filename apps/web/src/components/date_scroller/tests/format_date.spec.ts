import { formatScrollerLabel, getWeekDates } from '../helpers';

describe('date_scroller helpers', () => {
  const referenceDate = '2025-05-09T12:00:00.000Z';

  it('generates a monday-starting week for the reference date', () => {
    const dates = getWeekDates(referenceDate);

    expect(dates).toHaveLength(7);
    expect(dates[0].getUTCDay()).toBe(1);
    expect(dates[6].getUTCDay()).toBe(0);
  });

  it('formats scroller labels with short weekday and day of month', () => {
    const label = formatScrollerLabel(new Date(referenceDate));

    expect(label).toBe('Fri 9');
  });
});
