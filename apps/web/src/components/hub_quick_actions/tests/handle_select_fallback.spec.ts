import { handleSelectFallback } from '../helpers'

describe('handleSelectFallback', () => {
  it('is a no-op function', () => {
    expect(() => {
      handleSelectFallback({ kind: 'logSymptom', value: 'pain' })
    }).not.toThrow()
  })
})

