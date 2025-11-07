import { fetchTrack, fetchTrackEvents } from './helpers';
import { TrackLayoutClient } from './layout_client';
import type { TrackLayoutProps } from './layout_types';

export default async function TrackLayout({ children, params }: TrackLayoutProps) {
  const { trackSlug } = await params;

  const [track, events] = await Promise.all([fetchTrack(trackSlug), fetchTrackEvents(trackSlug)]);

  return (
    <TrackLayoutClient trackName={track.name} events={events} trackSlug={trackSlug}>
      {children}
    </TrackLayoutClient>
  );
}
