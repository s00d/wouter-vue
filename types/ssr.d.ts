import { RouterObject } from '../types';
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
export declare function createSSRRouter(ssrPath?: string, ssrSearch?: string): RouterObject;
