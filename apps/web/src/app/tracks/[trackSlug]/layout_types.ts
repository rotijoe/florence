import type { EventResponse } from '@packages/types';

export type TrackLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    trackSlug: string;
  }>;
};

export type TrackLayoutClientProps = {
  children: React.ReactNode;
  trackName: string;
  events: EventResponse[];
  trackSlug: string;
};
