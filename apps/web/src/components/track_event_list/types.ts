import type { EventResponse } from '@packages/types';

export type TrackEventListProps = {
  events: EventResponse[];
  trackSlug: string;
  activeEventId?: string | null;
};

export type EventDateGroup = {
  date: string;
  events: EventResponse[];
};

export type DateGroupProps = {
  group: { date: string; events: TrackEventListProps['events'] };
  groupIndex: number;
  totalGroups: number;
  trackSlug: string;
  activeEventId?: string | null;
};

export type TimelineRowProps = {
  event: EventResponse;
  trackSlug: string;
  isActive: boolean;
};

export type EventsGroupProps = {
  events: TrackEventListProps['events'];
  trackSlug: string;
  activeEventId?: string | null;
};
