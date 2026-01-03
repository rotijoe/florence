import { useState } from 'react'

export function useDeleteDialog(
  userId: string,
  trackSlug: string,
  eventId: string
): {
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  handleConfirmDelete: () => Promise<void>
} {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  async function handleConfirmDelete() {
    const { deleteEventAction } = await import(
      '@/app/[userId]/tracks/[trackSlug]/[eventId]/actions'
    )
    await deleteEventAction(userId, trackSlug, eventId)
  }

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleConfirmDelete
  }
}

