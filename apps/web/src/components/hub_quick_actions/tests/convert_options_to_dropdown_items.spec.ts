import { convertOptionsToDropdownItems } from '../helpers'
import type { HubQuickActionOption } from '../types'

describe('convertOptionsToDropdownItems', () => {
  const mockOptions: HubQuickActionOption[] = [
    { value: 'pain', label: 'Pain' },
    { value: 'mood', label: 'Mood' },
    { value: 'sleep', label: 'Sleep' }
  ]

  it('converts options to dropdown items with labels', () => {
    const result = convertOptionsToDropdownItems('logSymptom', mockOptions)

    expect(result).toHaveLength(3)
    expect(result[0].label).toBe('Pain')
    expect(result[1].label).toBe('Mood')
    expect(result[2].label).toBe('Sleep')
  })

  it('creates onSelect callbacks that execute without error when no onSelect provided', () => {
    const result = convertOptionsToDropdownItems('logSymptom', mockOptions)

    expect(() => {
      result[0].onSelect()
    }).not.toThrow()
  })

  it('creates onSelect callbacks that call provided onSelect handler', () => {
    const onSelect = jest.fn()
    const result = convertOptionsToDropdownItems('createEvent', mockOptions, onSelect)

    result[1].onSelect()

    expect(onSelect).toHaveBeenCalledWith({ kind: 'createEvent', value: 'mood' })
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('returns empty array when options is empty', () => {
    const result = convertOptionsToDropdownItems('logSymptom', [])

    expect(result).toEqual([])
  })

  it('returns empty array when options is undefined', () => {
    const result = convertOptionsToDropdownItems('logSymptom', undefined)

    expect(result).toEqual([])
  })

  it('uses correct kind and value for each option', () => {
    const onSelect = jest.fn()
    const result = convertOptionsToDropdownItems('addAppointment', mockOptions, onSelect)

    result[0].onSelect()
    expect(onSelect).toHaveBeenCalledWith({ kind: 'addAppointment', value: 'pain' })

    result[2].onSelect()
    expect(onSelect).toHaveBeenCalledWith({ kind: 'addAppointment', value: 'sleep' })
  })
})

