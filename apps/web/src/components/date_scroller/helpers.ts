const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcStartOfDay(dateLike?: string | Date): Date {
  const date = dateLike ? new Date(dateLike) : new Date();

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getWeekDates(referenceDate?: string | Date): Date[] {
  const startOfDay = toUtcStartOfDay(referenceDate);
  const weekDay = startOfDay.getUTCDay();
  const daysFromMonday = (weekDay + 6) % 7;
  const monday = new Date(startOfDay.getTime() - daysFromMonday * MS_PER_DAY);

  return Array.from({ length: 7 }, (_, index) => new Date(monday.getTime() + index * MS_PER_DAY));
}

const scrollerFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatScrollerLabel(date: Date): string {
  const parts = scrollerFormatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';

  return `${weekday} ${day}`.trim();
}

export function getScrollerLabelParts(date: Date): { label: string; weekday: string; day: string } {
  const parts = scrollerFormatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const label = `${weekday} ${day}`.trim();

  return { label, weekday, day };
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
