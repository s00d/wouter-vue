import { config } from '@vue/test-utils'

// Suppress Vue warnings about unknown components in render functions
// These warnings occur when using h(Link) or h(Router) in tests
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  // Filter out component resolution warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Failed to resolve component') ||
      args[0].includes('isCustomElement'))
  ) {
    return
  }
  originalWarn(...args)
}

