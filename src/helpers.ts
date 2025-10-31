/**
 * Helper utilities for wouter-vue
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, unref } from 'vue'
import type { RouterObject } from '../types/router.d.js'
import type { RouterRef } from './index'
import { normalizeRouterRef } from './index'

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
 * Normalize path for comparison by removing query params and hash.
 * Used for link active state detection.
 *
 * @param path - The path to normalize
 * @returns Normalized path string
 */
export function normalizePath(path: string): string {
  if (!path) return '/'
  // Remove query params (everything after ?)
  let normalized = path.split('?')[0]
  // Remove hash (everything after #)
  normalized = normalized.split('#')[0]
  // Ensure consistent trailing slash handling
  // Both "/" and "" should match "/"
  if (normalized === '') return '/'
  // Normalize trailing slash: remove it except for root
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

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
    return slot(params)
  }
  return slot
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

/**
 * Resolve target path from href or to props.
 *
 * @param props - Object with href and/or to properties
 * @param preferTo - If true, prefer `to` over `href`; otherwise prefer `href` over `to`
 * @returns Resolved target path string
 */
export function resolveTargetPath(
  props: { href?: string; to?: string },
  preferTo: boolean = false
): string {
  if (preferTo) {
    return props.to || props.href || ''
  }
  return props.href || props.to || ''
}

/**
 * Validate target path props and log warnings in dev mode.
 *
 * @param componentName - Name of the component for error messages
 * @param props - Object with href and/or to properties
 * @param preferTo - If true, prefer `to` over `href`; otherwise prefer `href` over `to`
 */
export function validateTargetPathProps(
  componentName: string,
  props: { href?: string; to?: string },
  preferTo: boolean = false
): void {
  const targetPath = resolveTargetPath(props, preferTo)

  if (!targetPath) {
    const propNames = preferTo ? '`to` or `href`' : '`href` or `to`'
    devWarn(componentName, `neither ${propNames} prop provided. Will navigate to empty path.`)
  }

  if (props.href && props.to) {
    const primary = preferTo ? 'to' : 'href'
    devWarn(componentName, `both \`href\` and \`to\` props provided. \`${primary}\` will be used.`)
  }
}

/**
 * Check if navigation click should be ignored (modifier keys or right click).
 *
 * @param event - Mouse event to check
 * @returns `true` if navigation should be ignored, `false` otherwise
 */
export function shouldIgnoreNavigationClick(event: MouseEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button !== 0
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
