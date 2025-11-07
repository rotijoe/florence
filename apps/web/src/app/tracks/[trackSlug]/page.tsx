import { TrackPageProps } from './types';

export default async function TrackPage({ params }: TrackPageProps) {
  // This page is now handled by the layout
  // Keeping it for route structure, but content is rendered in layout
  await params;
  return null;
}
