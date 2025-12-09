export interface TrackOption {
  slug: string
  title: string
  lastUpdatedAt: Date | string
}

export interface SymptomDialogueProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tracks: TrackOption[]
  userId: string
  onSuccess?: () => void
}

