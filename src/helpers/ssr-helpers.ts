/**
 * SSR-related helper utilities for wouter-vue
 */

/**
 * Parse SSR path to extract path and search string.
 *
 * @param ssrPath - SSR path string (may contain ? for search params)
 * @returns Object with path and search separated
 */
export function parseSsrPath(ssrPath?: string): { path?: string; search?: string } {
  if (!ssrPath) {
    return {}
  }
  if (ssrPath.includes('?')) {
    const parts = ssrPath.split('?')
    return {
      path: parts[0],
      search: parts[1],
    }
  }
  return { path: ssrPath }
}

/**
 * Check if running in SSR environment.
 *
 * @returns `true` if running on server, `false` if in browser
 */
export function isSSR(): boolean {
  return typeof window === 'undefined'
}

/**
 * Check if running in browser environment.
 *
 * @returns `true` if running in browser, `false` if in SSR
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}




