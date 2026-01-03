export type FileDetails = {
  url: string
  filename: string
  fileType: 'image' | 'pdf' | 'word' | 'text' | 'other'
}

// Backend allowed content types:
// 'application/pdf'
// 'image/jpeg', 'image/png', 'image/gif', 'image/webp'
// 'application/msword' (.doc)
// 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' (.docx)
// 'text/plain'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
const PDF_EXTENSIONS = ['pdf']
const WORD_EXTENSIONS = ['doc', 'docx']
const TEXT_EXTENSIONS = ['txt']

export function getFileDetails(url: string): FileDetails {
  const urlObj = new URL(url)
  const pathname = urlObj.pathname
  const filename = pathname.split('/').pop() || 'attachment'

  const extension = filename.split('.').pop()?.toLowerCase() || ''

  let fileType: 'image' | 'pdf' | 'word' | 'text' | 'other' = 'other'

  if (IMAGE_EXTENSIONS.includes(extension)) {
    fileType = 'image'
  } else if (PDF_EXTENSIONS.includes(extension)) {
    fileType = 'pdf'
  } else if (WORD_EXTENSIONS.includes(extension)) {
    fileType = 'word'
  } else if (TEXT_EXTENSIONS.includes(extension)) {
    fileType = 'text'
  }

  return {
    url,
    filename,
    fileType
  }
}

