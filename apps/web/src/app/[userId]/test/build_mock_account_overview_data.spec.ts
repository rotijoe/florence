import { buildMockAccountOverviewData } from '../helpers'
import type { AccountOverviewData } from '../types'

describe('buildMockAccountOverviewData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return user data with provided name', () => {
    const result = buildMockAccountOverviewData('John Doe')

    expect(result.user.name).toBe('John Doe')
    expect(result.user.id).toBe('mock-user')
  })

  it('should return user data with "there" when name is null', () => {
    const result = buildMockAccountOverviewData(null)

    expect(result.user.name).toBe('there')
  })

  it('should return user data with "there" when name is undefined', () => {
    const result = buildMockAccountOverviewData(undefined)

    expect(result.user.name).toBe('there')
  })

  it('should return user data with "there" when name is empty string', () => {
    const result = buildMockAccountOverviewData('')

    expect(result.user.name).toBe('there')
  })

  it('should return user data with "there" when name is whitespace only', () => {
    const result = buildMockAccountOverviewData('   ')

    expect(result.user.name).toBe('there')
  })

  it('should return notifications array with expected items', () => {
    const result = buildMockAccountOverviewData('Test User')

    expect(result.notifications).toHaveLength(2)
    expect(result.notifications[0].type).toBe('appointmentDetails')
    expect(result.notifications[1].type).toBe('symptomReminder')
  })

  it('should return notification with appointment details reminder', () => {
    const result = buildMockAccountOverviewData('Test User')
    const appointmentNotification = result.notifications.find(
      (n) => n.type === 'appointmentDetails'
    )

    expect(appointmentNotification).toBeDefined()
    expect(appointmentNotification?.id).toBe('appointment-details-reminder')
    expect(appointmentNotification?.title).toBe('Add details from your recent appointment')
    expect(appointmentNotification?.ctaLabel).toBe('Add details')
  })

  it('should return notification with symptom reminder', () => {
    const result = buildMockAccountOverviewData('Test User')
    const symptomNotification = result.notifications.find((n) => n.type === 'symptomReminder')

    expect(symptomNotification).toBeDefined()
    expect(symptomNotification?.id).toBe('symptom-reminder')
    expect(symptomNotification?.title).toBe('Log how you are feeling today')
    expect(symptomNotification?.ctaLabel).toBe('Log symptom')
  })

  it('should return health tracks array with expected items', () => {
    const result = buildMockAccountOverviewData('Test User')

    expect(result.healthTracks).toHaveLength(2)
    expect(result.healthTracks[0].title).toBe('Sleep')
    expect(result.healthTracks[0].slug).toBe('sleep')
    expect(result.healthTracks[1].title).toBe('Pain')
    expect(result.healthTracks[1].slug).toBe('pain')
  })

  it('should return health tracks with valid Date objects for lastUpdatedAt', () => {
    const result = buildMockAccountOverviewData('Test User')

    expect(result.healthTracks[0].lastUpdatedAt).toBeInstanceOf(Date)
    expect(result.healthTracks[1].lastUpdatedAt).toBeInstanceOf(Date)
  })

  it('should return appointments array with expected items', () => {
    const result = buildMockAccountOverviewData('Test User')

    expect(result.appointments).toHaveLength(2)
    expect(result.appointments[0].title).toBe('GP follow‑up')
    expect(result.appointments[0].location).toBe('City Health Centre')
    expect(result.appointments[1].title).toBe('Physio session')
    expect(result.appointments[1].location).toBe('Riverside Clinic')
  })

  it('should return empty recent activity array', () => {
    const result = buildMockAccountOverviewData('Test User')

    expect(result.recentActivity).toEqual([])
  })

  it('should return data conforming to AccountOverviewData type', () => {
    const result: AccountOverviewData = buildMockAccountOverviewData('Test User')

    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('notifications')
    expect(result).toHaveProperty('healthTracks')
    expect(result).toHaveProperty('appointments')
    expect(result).toHaveProperty('recentActivity')
  })
})
