import { buildAddEventHref } from '../helpers'

describe('buildAddEventHref', () => {
  it('builds add event href with returnTo pointing to tracks page', () => {
    const href = buildAddEventHref('user-1', 'sleep-track')
    expect(href).toBe('/user-1/tracks/sleep-track/new?returnTo=%2Fuser-1%2Ftracks')
  })
})


