/**
 * Router-related helper utilities for wouter-vue
 */

import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { RouterObject } from '../../types'
import type { RouterRef } from '../index'
import { normalizeRouterRef } from '../index'

/**
 * Get router value as computed ref for reactive access.
 *
 * @param router - Router reference (can be object, ref, computed ref, or function)
 * @returns ComputedRef of RouterObject
 */
export function useRouterValue(router: RouterRef): ComputedRef<RouterObject> {
  return computed(() => normalizeRouterRef(router))
}

/**
 * Get router value synchronously (for SSR context access).
 * Handles function, ref, and direct object cases.
 *
 * @param router - Router reference (can be object, ref, computed ref, or function)
 * @returns RouterObject value
 */
export function getRouterValue(router: RouterRef): RouterObject {
  if (typeof router === 'function') {
    return router()
  }
  if (router && typeof router === 'object' && 'value' in router) {
    return (router as ComputedRef<RouterObject> | { value: RouterObject }).value
  }
  return router as RouterObject
}




