import { getSeverityStyles } from '../helpers'

describe('getSeverityStyles', () => {
  it('returns yellow-500 for severity 2', () => {
    const styles = getSeverityStyles(2)

    expect(styles.bgColor).toBe('bg-yellow-500')
    expect(styles.textColor).toBe('text-white')
  })

  it('returns red-500 for severity 4', () => {
    const styles = getSeverityStyles(4)

    expect(styles.bgColor).toBe('bg-red-500')
    expect(styles.textColor).toBe('text-white')
  })

  it('returns default emerald-500 for unknown severity values', () => {
    const stylesZero = getSeverityStyles(0)
    const stylesSix = getSeverityStyles(6)
    const stylesNinetyNine = getSeverityStyles(99)

    expect(stylesZero.bgColor).toBe('bg-emerald-500')
    expect(stylesZero.textColor).toBe('text-white')

    expect(stylesSix.bgColor).toBe('bg-emerald-500')
    expect(stylesSix.textColor).toBe('text-white')

    expect(stylesNinetyNine.bgColor).toBe('bg-emerald-500')
    expect(stylesNinetyNine.textColor).toBe('text-white')
  })
})

