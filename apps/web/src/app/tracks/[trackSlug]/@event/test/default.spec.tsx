import { render } from '@testing-library/react'
import Default from '../default'

describe('@event/default', () => {
  it('returns null', () => {
    const result = render(<Default />)
    expect(result.container.firstChild).toBeNull()
  })
})

