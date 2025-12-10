import { getGreetingForUser } from '../helpers'

describe('getGreetingForUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return greeting with name when valid name is provided', () => {
    const result = getGreetingForUser('John')

    expect(result).toBe('Welcome back, John')
  })

  it('should return greeting with full name', () => {
    const result = getGreetingForUser('John Doe')

    expect(result).toBe('Welcome back, John Doe')
  })

  it('should return default greeting when name is null', () => {
    const result = getGreetingForUser(null)

    expect(result).toBe('Welcome back')
  })

  it('should return default greeting when name is undefined', () => {
    const result = getGreetingForUser(undefined)

    expect(result).toBe('Welcome back')
  })

  it('should return default greeting when name is empty string', () => {
    const result = getGreetingForUser('')

    expect(result).toBe('Welcome back')
  })

  it('should return default greeting when name is whitespace only', () => {
    const result = getGreetingForUser('   ')

    expect(result).toBe('Welcome back')
  })

  it('should trim whitespace from name', () => {
    const result = getGreetingForUser('  Alice  ')

    expect(result).toBe('Welcome back, Alice')
  })

  it('should handle name with leading whitespace', () => {
    const result = getGreetingForUser('  Bob')

    expect(result).toBe('Welcome back, Bob')
  })

  it('should handle name with trailing whitespace', () => {
    const result = getGreetingForUser('Charlie  ')

    expect(result).toBe('Welcome back, Charlie')
  })
})

