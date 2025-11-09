import { Button } from '@/components/ui/button';
import { getScrollerLabelParts, getWeekDates, toIsoDate } from './helpers';
import type { DateScrollerProps } from './types';

export function DateScroller({ referenceDate }: DateScrollerProps) {
  const weekDates = getWeekDates(referenceDate);
  const selectedIso = toIsoDate(referenceDate ? new Date(referenceDate) : new Date());

  return (
    <nav aria-label="Select day" className="overflow-x-auto py-2">
      <ul className="flex min-w-max gap-3">
        {weekDates.map((date) => renderDateItem(date, selectedIso))}
      </ul>
    </nav>
  );
}

function renderDateItem(date: Date, selectedIso: string) {
  const { label, weekday, day } = getScrollerLabelParts(date);
  const isoDate = toIsoDate(date);
  const isSelected = isoDate === selectedIso;

  return (
    <li key={isoDate} className="flex-shrink-0">
      <Button
        type="button"
        variant="ghost"
        data-selected={isSelected ? 'true' : 'false'}
        aria-current={isSelected ? 'date' : undefined}
        aria-label={label}
        className={`flex h-auto w-16 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
          isSelected ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
        }`}
      >
        <span aria-hidden className="text-xs uppercase tracking-wide">
          {weekday}
        </span>
        <span aria-hidden className="text-lg font-semibold">
          {day}
        </span>
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full bg-primary transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </Button>
    </li>
  );
}
