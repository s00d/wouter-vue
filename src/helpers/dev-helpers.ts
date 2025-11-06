/**
 * Development-related helper utilities for wouter-vue
 */

/**
 * Helper to check if we're in development mode.
 *
 * @returns `true` if running in development mode, `false` otherwise
 */
export function isDev(): boolean {
  try {
    // Check Vite dev mode
    if (
      typeof import.meta !== 'undefined' &&
      (import.meta as { env?: { DEV?: boolean } }).env?.DEV
    ) {
      return true
    }
    // Check Node.js dev mode
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      return true
    }
  } catch {
    // Ignore errors in SSR or other environments
  }
  return false
}

/**
 * Log development warning with component name prefix.
 *
 * @param componentName - Name of the component
 * @param message - Warning message
 */
export function devWarn(componentName: string, message: string): void {
  if (isDev()) {
    console.warn(`[wouter-vue] ${componentName} component: ${message}`)
  }
}
