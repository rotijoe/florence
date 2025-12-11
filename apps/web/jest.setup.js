import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder

if (typeof global.ResizeObserver === 'undefined') {
  class ResizeObserver {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    observe(_target) {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    unobserve(_target) {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() {}
  }

  // @ts-ignore
  global.ResizeObserver = ResizeObserver
}
