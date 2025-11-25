export function extractFilename(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    return pathname.split('/').pop() || 'attachment'
  } catch {
    // Fallback for invalid URLs
    return url.split('/').pop() || 'attachment'
  }
}


