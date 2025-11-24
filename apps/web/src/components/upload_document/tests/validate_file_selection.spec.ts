import { validateFileSelection } from '../helpers'

describe('validateFileSelection', () => {
  it('returns error message when file is null', () => {
    const result = validateFileSelection(null)
    expect(result).toBe('Please select a file')
  })

  it('returns null when file is provided', () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const result = validateFileSelection(file)
    expect(result).toBeNull()
  })
})

