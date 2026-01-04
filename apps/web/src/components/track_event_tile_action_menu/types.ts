export type TrackEventTileActionMenuProps = {
  href: string
  eventTitle: string
  onDeleteClick: () => void
  variant?: 'default' | 'symptom'
  symptomStyles?: { bgColor: string; textColor: string }
}

