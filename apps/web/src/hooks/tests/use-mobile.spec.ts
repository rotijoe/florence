import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation((query) => {
      const matches = query === '(max-width: 767px)'
      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }
    })
  })

  afterEach(() => {
    window.innerWidth = originalInnerWidth
    window.matchMedia = originalMatchMedia
  })

  it('returns false for desktop width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('returns true for mobile width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('updates when window is resized', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    let changeHandler: ((event: MediaQueryListEvent) => void) | null = null
    window.matchMedia = jest.fn().mockImplementation((query) => {
      const matches = query === '(max-width: 767px)'
      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            changeHandler = handler
          }
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Simulate resize to mobile by updating innerWidth and triggering onChange
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    })

    // Trigger the onChange handler that was registered
    if (changeHandler) {
      act(() => {
        changeHandler!({ matches: true } as MediaQueryListEvent)
      })
    }

    // The hook should now return true for mobile width
    expect(result.current).toBe(true)
  })

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = jest.fn()
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: removeEventListenerSpy
    })

    const { unmount } = renderHook(() => useIsMobile())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalled()
  })
})

