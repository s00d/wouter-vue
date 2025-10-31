/**
 * SSR-specific utilities for wouter-vue
 * 
 * This module provides server-side routing functionality using memory-location
 * instead of browser-specific location hooks. It exports only SSR-relevant code
 * to avoid bundling browser-only dependencies in SSR builds.
 */

import { pathToRegexp } from 'path-to-regexp'
import type { Path } from '../types/location-hook.d.js'
import type { Parser, RouterObject, HrefsFormatter } from '../types/router.d.js'
import { memoryLocation } from './memory-location'

/**
 * Adapter function that converts path-to-regexp API to match the Parser interface.
 * Supports parameter constraints syntax :param(pattern) and converts wildcard '*' to '/*splat' format.
 * 
 * @param route - Route pattern string
 * @param loose - If true, matches don't need to reach the end (for nested routes)
 * @returns Object with RegExp pattern and array of parameter names
 */
const parsePattern: Parser = (route: Path, loose?: boolean) => {
  // Handle parameter constraints syntax :param(pattern)
  // Extract constraints and parameter names
  const constraintMatches = [...route.matchAll(/:(\w+)\(([^)]+)\)/g)]
  const constraints = new Map<string, string>()
  for (const match of constraintMatches) {
    constraints.set(match[1], match[2])
  }

  // If we have constraints, build regex manually
  if (constraints.size > 0) {
    let regexStr = '^'
    const keyNames: string[] = []
    let lastIndex = 0
    
    // Process the route and build regex with constraints
    for (const match of constraintMatches) {
      const fullMatch = match[0]
      const paramName = match[1]
      const pattern = match[2]
      const matchIndex = route.indexOf(fullMatch, lastIndex)
      
      // Add literal text before the parameter
      if (matchIndex > lastIndex) {
        const literal = route.substring(lastIndex, matchIndex)
        regexStr += literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      }
      
      // Add constrained parameter group
      regexStr += `(${pattern})`
      keyNames.push(paramName)
      
      lastIndex = matchIndex + fullMatch.length
    }
    
    // Add remaining literal text
    if (lastIndex < route.length) {
      const literal = route.substring(lastIndex)
      regexStr += literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    
    // Add end anchor or lookahead
    if (!loose) {
      // Strict match - must match exactly
      regexStr += '$'
    } else {
      // Loose match (for nested routes) - can have more path after
      // Use lookahead to ensure delimiter or end, but allow continuation
      regexStr += '(?=/|$)'
    }
    
    const regex = new RegExp(regexStr, 'i')
    return {
      pattern: regex,
      keys: keyNames,
    }
  }

  // Handle wildcard '*' - convert to '/*splat' format
  // path-to-regexp requires wildcard parameters to have a name
  let processedRoute = route
  if (route === '*' || route === '/*') {
    processedRoute = '/*splat'
  } else if (route.endsWith('/*')) {
    // Replace trailing /* with /*splat (wildcard needs a name in path-to-regexp)
    processedRoute = route.slice(0, -2) + '/*splat'
  }

  // Use pathToRegexp with end option: if loose is true, end is false
  const { regexp, keys } = pathToRegexp(processedRoute, {
    end: !loose,
    sensitive: false,
  })

  // Extract parameter names from keys array
  // path-to-regexp returns keys as objects with 'name' property
  const keyNames: string[] = keys.map((key: { name: string | number }) => {
    // Handle both string names and object keys
    if (typeof key.name === 'string') {
      return key.name
    }
    // Fallback if key structure is different
    return String(key.name ?? '')
  })

  return {
    pattern: regexp,
    keys: keyNames,
  }
}

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

