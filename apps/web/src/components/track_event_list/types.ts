import type { EventResponse } from '@packages/types';

export type TrackEventListProps = {
  events: EventResponse[];
  trackSlug: string;
  activeEventId?: string | null;
};
