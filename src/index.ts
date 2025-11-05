import type { ComputedRef, Ref } from 'vue'
import type { Path } from '../types/location-hook'
import type { HrefsFormatter, Parser, RouterObject, SsrContext } from '../types'

// Re-export types for use in tests
export type { RouterObject, SsrContext, Parser, HrefsFormatter }

// Type definitions for better DX in generated .d.ts files
export type RouteParams = Record<string, string>
// RouteData represents JSON-serializable data that can be passed to routes
// Supports nested objects and arrays for complex data structures
export type RouteData = {
  [key: string]: RouteDataValue
}
export type RouteDataValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined 
  | RouteDataValue[]
  | { [key: string]: RouteDataValue }
// RouteData can be passed as plain object, ref, or computed ref
export type RouteDataInput = RouteData | Ref<RouteData> | ComputedRef<RouteData>
export type MatchResult = [true, RouteParams, string?] | [false, null]
export type NavigateFn = (path: Path, options?: { replace?: boolean; state?: unknown }) => void
export type SetSearchParamsFn = (
  nextInit:
    | URLSearchParams
    | Record<string, string>
    | ((params: URLSearchParams) => URLSearchParams),
  options?: { replace?: boolean; state?: unknown }
) => void

import { relativePath, sanitizeSearch } from './paths'
import { memoryLocation } from './memory-location'
import { isDev } from './helpers/dev-helpers'
import { isSSR } from './helpers/ssr-helpers'
import { useBrowserLocation, useSearch as useBrowserSearch } from './use-browser-location'
import { computed, inject as injectVue, ref, unref } from 'vue'
import { parsePattern } from './pattern-parser'

export type RouterRef =
  | RouterObject
  | Ref<RouterObject>
  | ComputedRef<RouterObject>
  | ((...args: unknown[]) => RouterObject)

/**
 * Type guard to check if a value is a Ref-like object.
 */
export const isRefLike = (
  value: unknown
): value is Ref<RouterObject> | ComputedRef<RouterObject> => {
  return value !== null && typeof value === 'object' && 'value' in value
}

/**
 * Type guard to check if a value is a function that returns RouterObject.
 */
export const isRouterFunction = (value: unknown): value is () => RouterObject => {
  return typeof value === 'function'
}

/**
 * Normalizes RouterRef to RouterObject by unwrapping refs and calling functions.
 *
 * @param router - The router reference (can be object, ref, computed ref, or function)
 * @returns The unwrapped RouterObject
 */
export const normalizeRouterRef = (router: RouterRef): RouterObject => {
  if (isRouterFunction(router)) {
    return router()
  }
  if (isRefLike(router)) {
    return unref(router) as RouterObject
  }
  return router as RouterObject
}

/**
 * Normalizes Vue boolean props (boolean shorthand support).
 *
 * Returns `true` if value is empty string (`''`) or `true`, `false` otherwise.
 * This handles Vue's boolean prop shorthand: `<Component prop />` results in `prop=""` on vnode.
 *
 * @param value - The prop value to normalize (can be `''`, `true`, `false`, or `undefined`)
 * @returns `true` if the prop should be considered enabled, `false` otherwise
 *
 * @example
 * ```typescript
 * normalizeBooleanProp('')  // true
 * normalizeBooleanProp(true) // true
 * normalizeBooleanProp(false) // false
 * normalizeBooleanProp(undefined) // false
 * ```
 */
export const normalizeBooleanProp = (value: unknown): boolean => {
  return value === '' || value === true
}

/*
 * Router and router context. Router is a lightweight object that represents the current
 * routing options: how location is managed, base path etc.
 *
 * There is a default router present for most of the use cases, however it can be overridden
 * via the <Router /> component.
 *
 * Browser-only code (useBrowserLocation, useBrowserSearch) is imported directly.
 * In SSR builds, the bundler should tree-shake it, and memory-location is used instead.
 */

/**
 * Gets browser location hooks.
 * In browser, uses browser hooks; in SSR, uses memory location.
 */
function getBrowserHooks(): { hook: RouterObject['hook']; searchHook: RouterObject['searchHook'] } {
  if (isSSR()) {
    // SSR: return memory location hooks that use router.ssrPath
    // We need to create a hook function that reads ssrPath from the router object
    return {
      hook: ((router: RouterObject) => {
        // Create memory location with the router's ssrPath or default to '/'
        const { hook } = memoryLocation({
          path: router.ssrPath || '/',
          searchPath: router.ssrSearch || '',
          static: true, // Static in SSR - no navigation allowed
        })
        return hook() as [Ref<Path>, NavigateFn]
      }) as RouterObject['hook'],
      searchHook: ((router: RouterObject) => {
        const { searchHook } = memoryLocation({
          path: router.ssrPath || '/',
          searchPath: router.ssrSearch || '',
          static: true,
        })
        return searchHook() as Ref<string>
      }) as RouterObject['searchHook'],
    }
  }

  // Browser: use browser hooks directly
  return {
    hook: ((router: RouterObject) =>
      useBrowserLocation({ ssrPath: router.ssrPath })) as RouterObject['hook'],
    searchHook: ((router: RouterObject) =>
      useBrowserSearch({ ssrSearch: router.ssrSearch })) as RouterObject['searchHook'],
  }
}

// Get hooks based on environment (browser or SSR)
const browserHooks = getBrowserHooks()

// Create default router with appropriate hooks for environment
export const defaultRouter: RouterObject = {
  hook: browserHooks.hook,
  searchHook: browserHooks.searchHook,
  parser: parsePattern,
  base: '',
  ownBase: '',
  ssrPath: undefined,
  ssrSearch: undefined,
  hrefs: ((x: string) => x) as HrefsFormatter,
}

export const RouterKey = Symbol('router')
export const ParamsKey = Symbol('params')
export const RouteDataKey = Symbol('route-data')

// gets the closest parent router from the context
export const useRouter = () => injectVue(RouterKey, defaultRouter)

/**
 * Hook to access route parameters from the current matched route.
 *
 * Works inside `<Route>` components and returns parameters from the innermost matched route.
 * Automatically merges parameters from parent nested routes.
 *
 * @returns `Ref<RouteParams>` - Object with route parameter keys mapped to string values
 *
 * @example
 * ```typescript
 * // For route path="/users/:userId/posts/:postId"
 * const params = useParams()
 * console.log(params.value.userId)  // '123'
 * console.log(params.value.postId)  // '456'
 * ```
 */
export const useParams = (): Ref<RouteParams> => {
  const params = injectVue(ParamsKey, ref({}))
  // If params is a ref, return it; otherwise wrap it in a ref
  if (params && typeof params === 'object' && 'value' in params) {
    return params as Ref<RouteParams>
  }
  return ref(params) as Ref<RouteParams>
}

/**
 * Hook to access route data from the current matched route.
 *
 * Works inside `<Route>` components and returns data from the innermost matched route.
 * Automatically merges data from parent routes.
 *
 * @returns `Ref<RouteData>` - Reactive reference to route data object
 *
 * @example
 * ```typescript
 * const routeData = useRouteData()
 * console.log(routeData.value.theme)  // 'dark'
 * console.log(routeData.value.layout)  // 'sidebar'
 * ```
 */
export const useRouteData = (): Ref<RouteData> => {
  const data = injectVue(RouteDataKey, ref({}))
  // If data is already a ref/computed, return it; otherwise wrap in ref
  if (data && typeof data === 'object' && 'value' in data) {
    return data as Ref<RouteData>
  }
  return ref(data) as Ref<RouteData>
}

/*
 * Part 1, Composables: useRoute and useLocation
 */

/**
 * Internal version of useLocation to avoid redundant useRouter calls.
 * Optimized to use type guards for better performance.
 */
export const useLocationFromRouter = (router: RouterRef): [ComputedRef<Path>, NavigateFn] => {
  const routerValue = computed(() => normalizeRouterRef(router))

  const hookResult = computed(() => {
    const result = routerValue.value.hook(routerValue.value)
    return result as [Ref<Path> | Path, (path: Path, ...args: unknown[]) => unknown]
  })

  const navigateFn = hookResult.value[1] as NavigateFn

  // Compute final location reactively, unwrapping refs with unref
  const finalLocation = computed(() => {
    const base = routerValue.value.base
    const loc = hookResult.value[0]
    const locValue = unref(loc)
    const rel = relativePath(base, locValue)
    return rel
  })

  return [finalLocation, navigateFn]
}

/**
 * Reactive location hook that returns the current path and a navigate function.
 *
 * The location ref automatically updates when the URL changes (through navigation or browser back/forward).
 *
 * @returns A tuple of `[location, navigate]` where:
 *   - `location`: `ComputedRef<Path>` - Current pathname (relative to router base if nested)
 *   - `navigate`: `NavigateFn` - Function to programmatically navigate
 *
 * @example
 * ```typescript
 * const [location, navigate] = useLocation()
 *
 * // Access current path
 * console.log(location.value) // '/current/path'
 *
 * // Navigate programmatically
 * navigate('/about')
 * navigate('/users/123', { replace: true })
 * ```
 */
export const useLocation = (): [ComputedRef<Path>, NavigateFn] => {
  const router = useRouter()
  const result = useLocationFromRouter(router)
  return result
}

/**
 * Reactive search string hook (query string).
 *
 * Returns the current search string (query string) from the URL.
 * Automatically updates when URL search parameters change.
 *
 * @returns `ComputedRef<string>` - Raw query string (e.g., `'foo=bar&page=2'`)
 *
 * @example
 * ```typescript
 * const search = useSearch()
 * console.log(search.value) // 'foo=bar&page=2'
 * ```
 */
export const useSearch = () => {
  const router = useRouter()
  // Optimized: use type guard helper
  const routerValue = computed(() => normalizeRouterRef(router as RouterRef))
  const searchResult = computed(() => {
    const searchHookFn = routerValue.value.searchHook
    if (!searchHookFn) return ''
    try {
      const searchHookResult = searchHookFn(routerValue.value)
      if (!searchHookResult) return ''
      const searchValue = unref(searchHookResult)
      return sanitizeSearch(searchValue)
    } catch (error) {
      // Log error in development for debugging
      if (isDev()) {
        console.warn('[wouter-vue] Error reading search params:', error)
      }
      return ''
    }
  })
  return searchResult
}

/**
 * Matches a route pattern against a path and extracts parameters.
 *
 * @param parser - The route parser function (from path-to-regexp adapter or custom)
 * @param route - The route pattern to match (string or RegExp)
 * @param path - The current path to match against
 * @param loose - If `true`, enables loose matching mode for nested routes (extracts base path)
 * @returns A tuple: `[true, RouteParams, base?]` on match, `[false, null]` on no match
 *
 * @example
 * ```typescript
 * const [matched, params, base] = matchRoute(parsePattern, '/users/:id', '/users/123')
 * // matched: true, params: { id: '123' }, base: undefined
 *
 * const [matched, params, base] = matchRoute(parsePattern, '/users/:id', '/users/123/posts', true)
 * // matched: true, params: { id: '123' }, base: '/users/123'
 * ```
 */
export const matchRoute = (
  parser: Parser,
  route: string | RegExp,
  path: Path,
  loose?: boolean
): MatchResult => {
  // if the input is a regexp, skip parsing
  const { pattern, keys } =
    route instanceof RegExp ? { keys: false, pattern: route } : parser(route || '*', loose)

  // array destructuring loses keys, so this is done in two steps
  const result = pattern.exec(path) || []

  // when parser is in "loose" mode, `$base` is equal to the
  // first part of the route that matches the pattern
  // (e.g. for pattern `/a/:b` and path `/a/1/2/3` the `$base` is `a/1`)
  // we use this for route nesting
  const [$base, ...matches] = result

  if ($base !== undefined) {
    const params: RouteParams = (() => {
      // Priority 1: If we have named keys from parser, use only them
      // Optimized: direct object construction instead of Object.fromEntries for better performance
      if (keys !== false) {
        const keysArray = keys as string[]
        const paramsObj: RouteParams = {}
        for (let i = 0; i < keysArray.length; i++) {
          paramsObj[keysArray[i]] = matches[i]
        }
        return paramsObj
      }

      // Priority 2: If we have named capture groups from RegExp, use them
      const groups = (result as RegExpExecArray).groups
      if (groups) {
        return { ...groups } as RouteParams
      }

      // Priority 3: Fallback to numeric indices only if no named keys/groups exist
      const paramsFromMatches: RouteParams = {}
      for (let i = 0; i < matches.length; i++) {
        paramsFromMatches[String(i)] = matches[i]
      }
      return paramsFromMatches
    })()

    // the third value is only present when parser is in "loose" mode,
    // so that we can extract the base path for nested routes
    if (loose) {
      const out = [true, params, $base] as MatchResult
      return out
    }
    const out = [true, params] as MatchResult
    return out
  }

  return [false, null] as MatchResult
}

/**
 * Reactive route matching hook.
 *
 * Returns computed refs that automatically update when the location changes.
 * The first ref indicates if the route matches, the second contains the extracted parameters.
 *
 * @param pattern - Route pattern to match (string like `/users/:id` or RegExp)
 * @returns A tuple of `[matches, params]` where:
 *   - `matches`: `ComputedRef<boolean>` - `true` if location matches the pattern
 *   - `params`: `ComputedRef<RouteParams | null>` - Extracted route parameters or `null` if no match
 *
 * @example
 * ```typescript
 * const [matches, params] = useRoute('/users/:id')
 *
 * if (matches.value) {
 *   console.log('User ID:', params.value?.id) // '123'
 * }
 * ```
 */
export const useRoute = (
  pattern: string | RegExp
): [ComputedRef<boolean>, ComputedRef<RouteParams | null>] => {
  const [location] = useLocation()
  const router = useRouter()

  // Optimized: combine router unwrapping and matching in single computed
  const result = computed(() => {
    const routerObj = normalizeRouterRef(router as RouterRef)
    // location is already computed, its value will be tracked automatically
    const locationValue = (location as ComputedRef<Path>).value
    return matchRoute(routerObj.parser, pattern, locationValue)
  })

  const matches = computed(() => Boolean(result.value[0]))
  const params = computed(() => {
    const matchResult = result.value
    return matchResult[0] ? (matchResult[1] as RouteParams) : null
  })

  return [matches, params]
}

/*
 * Part 2: Export components from components/index.ts
 */

// Export components from components/index.ts (single import point)
export {
  Router,
  Route,
  Link,
  Switch,
  AnimatedSwitch,
  Redirect,
} from './components/index'

// Export normalizePath function (used by components but may be needed by users)
export { normalizePath } from './helpers/path-helpers'

/**
 * Hook to access and manipulate URL search parameters reactively.
 *
 * Returns a reactive `URLSearchParams` object and a setter function.
 * The searchParams ref automatically updates when URL search parameters change.
 *
 * @returns A tuple of `[searchParams, setSearchParams]` where:
 *   - `searchParams`: `ComputedRef<URLSearchParams>` - Reactive URLSearchParams object
 *   - `setSearchParams`: `SetSearchParamsFn` - Function to update search params
 *
 * @example
 * ```typescript
 * const [searchParams, setSearchParams] = useSearchParams()
 *
 * // Read params
 * const page = searchParams.value.get('page') // '2'
 *
 * // Update params
 * setSearchParams({ page: '3', sort: 'asc' })
 *
 * // Functional update
 * setSearchParams(prev => {
 *   prev.set('page', '5')
 *   return prev
 * }, { replace: true })
 * ```
 */
export function useSearchParams(): [ComputedRef<URLSearchParams>, SetSearchParamsFn] {
  const [location, navigate] = useLocation()
  const search = useSearch()

  const searchParams = computed(() => new URLSearchParams(search.value))
  const navigateFn = navigate as NavigateFn

  const setSearchParams: SetSearchParamsFn = (nextInit, options) => {
    const newParams = new URLSearchParams(
      typeof nextInit === 'function' ? nextInit(searchParams.value) : nextInit
    )
    const locationValue = location.value
    navigateFn(`${locationValue}?${newParams}`, options)
  }

  return [searchParams, setSearchParams]
}
