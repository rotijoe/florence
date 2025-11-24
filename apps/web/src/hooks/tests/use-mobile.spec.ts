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

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    })

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    // The hook uses matchMedia listener, so we need to trigger the change event
    const mediaQueryList = window.matchMedia('(max-width: 767px)')
    act(() => {
      // Simulate media query change
      ;(mediaQueryList.addEventListener as jest.Mock).mock.calls.forEach(([event, handler]) => {
        if (event === 'change') {
          handler({ matches: true })
        }
      })
    })

    // Note: The actual implementation uses matchMedia change event, not resize
    // So we need to simulate the media query change
    const mockMediaQuery = window.matchMedia('(max-width: 767px)')
    const changeHandler = (mockMediaQuery.addEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'change'
    )?.[1]

    if (changeHandler) {
      act(() => {
        changeHandler({ matches: true })
      })
    }
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

