import type { TrackOption } from '../types'

export type { TrackOption }

export interface SymptomDialogueProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tracks: TrackOption[]
  userId: string
  onSuccess?: () => void
}
