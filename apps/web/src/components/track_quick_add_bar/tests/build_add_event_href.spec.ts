import { EventType } from '@packages/types'
import { buildAddEventHref } from '../helpers'

describe('buildAddEventHref', () => {
  it('builds the /new href with returnTo and type', () => {
    const href = buildAddEventHref({
      userId: 'user-1',
      trackSlug: 'sleep',
      type: EventType.APPOINTMENT
    })

    expect(href).toBe(
      '/user-1/tracks/sleep/new?returnTo=%2Fuser-1%2Ftracks%2Fsleep&type=APPOINTMENT'
    )
  })
})


