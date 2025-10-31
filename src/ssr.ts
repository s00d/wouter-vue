/**
 * SSR-specific utilities for wouter-vue
 * 
 * This module provides server-side routing functionality using memory-location
 * instead of browser-specific location hooks. It exports only SSR-relevant code
 * to avoid bundling browser-only dependencies in SSR builds.
 */

import { parse as parsePattern } from 'regexparam'
import type { RouterObject, HrefsFormatter } from '../types/router.d.js'
import { memoryLocation } from './memory-location'

/**
 * Creates a default router configuration for SSR environments.
 * Uses memory-location instead of browser location hooks.
 * 
 * @param ssrPath - Initial path for SSR (default: '/')
 * @param ssrSearch - Initial search string for SSR (default: '')
 * @returns RouterObject configured for SSR
 * 
 * @example
 * ```typescript
 * import { createSSRRouter } from 'wouter-vue/ssr'
 * 
 * const router = createSSRRouter('/about', 'page=2')
 * ```
 */
export function createSSRRouter(
  ssrPath: string = '/',
  ssrSearch: string = ''
): RouterObject {
  const { hook, searchHook } = memoryLocation({ 
    path: ssrPath,
    searchPath: ssrSearch 
  })

  return {
    hook: hook as RouterObject['hook'],
    searchHook: searchHook as RouterObject['searchHook'],
    parser: parsePattern,
    base: '',
    ownBase: '',
    ssrPath,
    ssrSearch,
    hrefs: ((x: string) => x) as HrefsFormatter,
  }
}

