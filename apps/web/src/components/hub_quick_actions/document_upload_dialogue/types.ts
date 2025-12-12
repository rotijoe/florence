export interface DocumentUploadDialogueProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTrackTitle: string
  selectedTrackSlug: string
  onSuccess?: () => void
}
