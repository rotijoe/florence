import { stopLinkNavigation } from '../stop_link_navigation'

describe('stopLinkNavigation', () => {
  it('calls preventDefault and stopPropagation on the event', () => {
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    }

    stopLinkNavigation(mockEvent)

    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
  })
})

