import { getLastEventPlaceholder } from '../helpers'

describe('getLastEventPlaceholder', () => {
  it('returns a stable placeholder shape', () => {
    const placeholder = getLastEventPlaceholder()
    expect(placeholder).toEqual({
      label: 'Last event',
      detail: '—',
      hint: 'Event summaries are coming soon.'
    })
  })
})


