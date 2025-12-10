import { getWelcomeSubtitle } from '../helpers'

describe('getWelcomeSubtitle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the welcome subtitle message', () => {
    const result = getWelcomeSubtitle()

    expect(result).toBe(
      'Log how you are feeling, keep your details up to date, and stay on top of upcoming care.'
    )
  })

  it('should return a non-empty string', () => {
    const result = getWelcomeSubtitle()

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('should return consistent value on multiple calls', () => {
    const result1 = getWelcomeSubtitle()
    const result2 = getWelcomeSubtitle()

    expect(result1).toBe(result2)
  })
})

