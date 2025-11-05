/**
 * Path-related helper utilities for wouter-vue
 */

import { devWarn } from './dev-helpers'

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




