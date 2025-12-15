import { getStatusText } from '../helpers'
import { UploadStatus } from '@/hooks/use_event_upload/constants'

describe('getStatusText', () => {
  it('returns "Creating event..." when isCreatingEvent is true', () => {
    expect(getStatusText(true, 'idle')).toBe('Creating event...')
    expect(getStatusText(true, 'uploading')).toBe('Creating event...')
  })

  it('returns "Preparing upload..." for getting-url status', () => {
    expect(getStatusText(false, 'getting-url')).toBe('Preparing upload...')
  })

  it('returns "Uploading file..." for uploading status', () => {
    expect(getStatusText(false, 'uploading')).toBe('Uploading file...')
  })

  it('returns "Saving..." for confirming status', () => {
    expect(getStatusText(false, 'confirming')).toBe('Saving...')
  })

  it('returns "Upload complete!" for success status', () => {
    expect(getStatusText(false, 'success')).toBe('Upload complete!')
  })

  it('returns "Upload failed" for error status', () => {
    expect(getStatusText(false, 'error')).toBe('Upload failed')
  })

  it('returns default message for idle status', () => {
    expect(getStatusText(false, 'idle')).toBe('Select a file to upload')
  })
})


