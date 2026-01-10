export interface TrackCreateDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  onLoadingChange?: (loading: boolean) => void
}

export interface CreateTrackPayload {
  title: string
  description?: string | null
}

export interface CreateTrackResponse {
  id: string
  title: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}
