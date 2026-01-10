export interface DocumentUploadDialogueProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTrackTitle: string
  selectedTrackSlug: string
  userId: string
  onSuccess?: (params: { eventId: string; trackSlug: string }) => void
  onLoadingChange?: (loading: boolean) => void
}
