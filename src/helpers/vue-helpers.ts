/**
 * Vue-specific helper utilities for wouter-vue
 */

import type { ComputedRef, Ref } from 'vue'
import { unref } from 'vue'

/**
 * Resolve slot value (function or direct value).
 *
 * @param slot - Slot value (can be function or any value)
 * @returns Resolved slot value
 */
export function resolveSlot(slot: unknown): unknown {
  if (!slot) return null
  if (typeof slot === 'function') {
    return slot()
  }
  return slot
}

/**
 * Resolve slot with params for scoped slots.
 *
 * @param slot - Slot value (can be function or any value)
 * @param params - Parameters to pass to scoped slot function
 * @returns Resolved slot value
 */
export function resolveSlotWithParams(slot: unknown, params?: unknown): unknown {
  if (!slot) return null
  if (typeof slot === 'function') {
    try {
      // In SSR, slots might be wrapped differently, so we try to call with params
      // Always ensure params is an object (even if empty) for scoped slots
      const paramsObj = params !== undefined && params !== null ? params : {}
      const result = slot(paramsObj)
      
      // If result is undefined/null and params were provided, try without params (regular slot)
      if ((result === undefined || result === null) && params !== undefined) {
        try {
          return slot()
        } catch {
          // Return the original result even if undefined
          return result
        }
      }
      return result
    } catch (error) {
      // If calling with params fails (e.g., destructuring error), try without params
      if (params !== undefined) {
        try {
          return slot()
        } catch {
          // If both fail, return null
          return null
        }
      }
      throw error
    }
  }
  return slot
}

/**
 * Universal helper to unwrap values (function, ref, computed ref, or direct value).
 *
 * @param value - Value that may be wrapped in various forms
 * @returns Unwrapped value
 */
export function unwrapValue<T>(value: T | (() => T) | Ref<T> | ComputedRef<T>): T {
  if (typeof value === 'function') {
    return (value as () => T)()
  }
  if (value && typeof value === 'object' && 'value' in value) {
    return unref(value) as T
  }
  return value as T
}

/**
 * Props resolver class for accessing props with fallback to parent or default values.
 * Provides a clean API similar to `props.get('name', 'default')`.
 */
export class PropsResolver {
  private props: Record<string, unknown>
  private parent?: Record<string, unknown>

  constructor(props: Record<string, unknown>, parent?: Record<string, unknown>) {
    this.props = props
    this.parent = parent
  }

  /**
   * Get prop value with fallback to parent value or default value.
   *
   * @param key - Property key to look up
   * @param defaultValue - Default value if neither prop nor parent has value
   * @returns The resolved value
   *
   * @example
   * ```typescript
   * const resolver = new PropsResolver(props, parentValue)
   * const parser = resolver.get('parser', defaultParser)
   * const hook = resolver.get('hook')
   * ```
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    // First try props
    if (key in this.props) {
      const propValue = this.props[key]
      if (propValue !== undefined) {
        return propValue as T
      }
    }

    // Then try parent
    if (this.parent && key in this.parent) {
      const parentValue = this.parent[key]
      if (parentValue !== undefined) {
        return parentValue as T
      }
    }

    // Finally return default
    return defaultValue
  }

  /**
   * Check if prop value is defined (not undefined).
   *
   * @param key - Property key to check
   * @returns `true` if prop value is defined (not undefined), `false` otherwise
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }
}

