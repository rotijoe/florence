export function validateFileSelection(selectedFile: File | null): string | null {
  if (!selectedFile) {
    return 'Please select a file'
  }
  return null
}
