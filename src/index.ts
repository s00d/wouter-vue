import { parse as parsePattern } from 'regexparam'
import type { ComputedRef } from 'vue'
import type { Path } from '../types/location-hook.d.js'
import type { HrefsFormatter, Parser, RouterObject, SsrContext } from '../types/router.d.js'

// Re-export types for use in tests
export type { RouterObject, SsrContext, Parser, HrefsFormatter }

// Type definitions for better DX in generated .d.ts files
export type RouteParams = Record<string, string>
export type MatchResult = [true, RouteParams, string?] | [false, null]
export type NavigateFn = (path: Path, options?: { replace?: boolean; state?: unknown }) => void
export type SetSearchParamsFn = (
  nextInit: URLSearchParams | Record<string, string> | ((params: URLSearchParams) => URLSearchParams),
  options?: { replace?: boolean; state?: unknown }
) => void

import { relativePath, sanitizeSearch } from './paths.js'
import { useBrowserLocation, useSearch as useBrowserSearch } from './use-browser-location.js'
import {
  computed,
  defineAsyncComponent,
  Fragment,
  h,
  inject as injectVue,
  onMounted,
  provide as provideVue,
  type Ref,
  ref,
  unref,
} from 'vue'

type RouterRef =
  | RouterObject
  | Ref<RouterObject>
  | ComputedRef<RouterObject>
  | ((...args: unknown[]) => RouterObject)

/**
 * Type guard to check if a value is a Ref-like object.
 */
const isRefLike = (value: unknown): value is Ref<RouterObject> | ComputedRef<RouterObject> => {
  return value !== null
    && typeof value === 'object'
    && 'value' in value
}

/**
 * Type guard to check if a value is a function that returns RouterObject.
 */
const isRouterFunction = (value: unknown): value is () => RouterObject => {
  return typeof value === 'function'
}

/**
 * Normalizes RouterRef to RouterObject by unwrapping refs and calling functions.
 * 
 * @param router - The router reference (can be object, ref, computed ref, or function)
 * @returns The unwrapped RouterObject
 */
const normalizeRouterRef = (router: RouterRef): RouterObject => {
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
const normalizeBooleanProp = (value: unknown): boolean => {
  return value === '' || value === true
}

/*
 * Router and router context. Router is a lightweight object that represents the current
 * routing options: how location is managed, base path etc.
 *
 * There is a default router present for most of the use cases, however it can be overridden
 * via the <Router /> component.
 */

const defaultRouter: RouterObject = {
  hook: useBrowserLocation as unknown as RouterObject['hook'],
  searchHook: useBrowserSearch as unknown as RouterObject['searchHook'],
  parser: parsePattern,
  base: '',
  ownBase: '',
  // this option is used to override the current location during SSR
  ssrPath: undefined,
  ssrSearch: undefined,
  // optional context to track render state during SSR
  // ssrContext: undefined, // not in RouterObject type, but used in runtime
  // customizes how `href` props are transformed for <Link />
  hrefs: ((x: string) => x) as HrefsFormatter,
}

const RouterKey = Symbol('router')
const ParamsKey = Symbol('params')

// gets the closest parent router from the context
export const useRouter = () => injectVue(RouterKey, defaultRouter)

/**
 * Parameters context. Used by `useParams()` to get the
 * matched params from the innermost `Route` component.
 */
const Params0 = {}

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
  const params = injectVue(ParamsKey, Params0)
  // If params is a ref, return it; otherwise wrap it in a ref
  if (params && typeof params === 'object' && 'value' in params) {
    return params as Ref<RouteParams>
  }
  return ref(params) as Ref<RouteParams>
}

/*
 * Part 1, Composables: useRoute and useLocation
 */

/**
 * Internal version of useLocation to avoid redundant useRouter calls.
 * Optimized to use type guards for better performance.
 */
const useLocationFromRouter = (router: RouterRef): [ComputedRef<Path>, NavigateFn] => {
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
 * @param parser - The route parser function (from regexparam or custom)
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
 * Part 2, Router API: Router, Route, Link, Switch
 */

type RouterProps = {
  hook?: RouterObject['hook']
  searchHook?: RouterObject['searchHook']
  base?: Path
  parser?: Parser
  ssrPath?: Path
  ssrSearch?: Path
  ssrContext?: SsrContext
  hrefs?: HrefsFormatter
}

type SetupContext = {
  slots: {
    default?: (() => unknown) | ((params: unknown) => unknown)
  }
}

export const Router = {
  name: 'Router',
  props: ['hook', 'searchHook', 'base', 'parser', 'ssrPath', 'ssrSearch', 'ssrContext', 'hrefs'],
  setup(props: RouterProps, { slots }: SetupContext) {
    const parent = injectVue(RouterKey, defaultRouter)

    // when `ssrPath` contains a `?` character, we can extract the search from it
    let finalSsrPath = props.ssrPath
    let finalSsrSearch = props.ssrSearch
    if (props.ssrPath?.includes('?')) {
      const parts = props.ssrPath.split('?')
      finalSsrPath = parts[0]
      finalSsrSearch = parts[1]
    }

    // construct the new router object without mutations
    const router = computed(() => {
      // Get parent value (it might be a computed ref)
      const parentValue: RouterObject =
        typeof parent === 'function' ? (parent as () => RouterObject)() : unref(parent)

      // Create new object without readonly constraints
      // Note: ssrContext is not part of RouterObject type but is used at runtime
      // Pass ssrContext through if provided (runtime property, not in type)
      const ssrContextValue =
        props.ssrContext !== undefined
          ? props.ssrContext
          : (parentValue as unknown as { ssrContext?: SsrContext }).ssrContext !== undefined
            ? (parentValue as unknown as { ssrContext?: SsrContext }).ssrContext
            : undefined
      const result = {
        base: props.base !== undefined ? parentValue.base + (props.base || '') : parentValue.base,
        ownBase: props.base !== undefined ? props.base : parentValue.ownBase,
        ssrPath: finalSsrPath !== undefined ? finalSsrPath : parentValue.ssrPath,
        ssrSearch: finalSsrSearch !== undefined ? finalSsrSearch : parentValue.ssrSearch,
        parser: props.parser ?? parentValue.parser,
        searchHook:
          props.searchHook !== undefined
            ? (props.searchHook as RouterObject['searchHook'])
            : parentValue.searchHook,
        hook: props.hook !== undefined ? (props.hook as RouterObject['hook']) : parentValue.hook,
        hrefs:
          props.hrefs !== undefined
            ? props.hrefs
            : typeof props.hook === 'object' && props.hook && 'hrefs' in props.hook
              ? ((props.hook as { hrefs?: HrefsFormatter }).hrefs ?? defaultRouter.hrefs)
              : parentValue.hrefs || defaultRouter.hrefs,
        ...(ssrContextValue !== undefined ? { ssrContext: ssrContextValue } : {}),
      } as RouterObject & { ssrContext?: SsrContext }
      return result
    })

    // provide the router context to children
    provideVue(RouterKey, router)

    return () => {
      const defaultSlot = slots.default
      if (!defaultSlot) return null
      if (typeof defaultSlot === 'function') {
        // Router default slot doesn't take parameters
        return (defaultSlot as () => unknown)()
      }
      return defaultSlot
    }
  },
}

/**
 * Normalize path for comparison by removing query params and hash.
 * Used for link active state detection.
 */
const normalizePath = (path: string): string => {
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

  const setSearchParams: SetSearchParamsFn = (
    nextInit,
    options
  ) => {
    const newParams = new URLSearchParams(
      typeof nextInit === 'function' ? nextInit(searchParams.value) : nextInit
    )
    const locationValue = location.value
    navigateFn(`${locationValue}?${newParams}`, options)
  }

  return [searchParams, setSearchParams]
}

// Helper to check if we're in development mode
const isDev = (): boolean => {
  try {
    // Check Vite dev mode
    if (typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
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

type RouteProps = {
  path?: string | RegExp
  component?: unknown
  nest?: unknown
  match?: MatchResult
}

export const Route = {
  name: 'Route',
  props: ['path', 'component', 'nest', 'match'],
  setup(props: RouteProps, { slots }: SetupContext) {
    // Dev mode validation (only warn, don't prevent rendering)
    if (isDev()) {
      if (props.path === undefined && props.match === undefined) {
        // This is valid for catch-all routes, so we only log in dev mode
        // but don't prevent rendering
      }
      if (props.component === undefined && !slots.default) {
        console.warn('[wouter-vue] Route component: neither `component` prop nor default slot provided. Route will not render anything.')
      }
    }

    const router = useRouter()

    const [location] = useLocationFromRouter(router)

    // Optimized: combine router unwrapping and matching in single computed
    const result = computed(() => {
      // If match is pre-computed, use it; otherwise compute it
      if (props.match) {
        return props.match
      }
      // If no path provided, this is a catch-all route that always matches
      if (props.path === undefined) {
        return [true, {}] as MatchResult
      }
      const routerObj = normalizeRouterRef(router as RouterRef)
      const parserFn =
        (typeof routerObj.parser === 'function' ? routerObj.parser : null) ?? defaultRouter.parser
      const locationValue = (location as ComputedRef<Path>).value
      return matchRoute(parserFn, props.path, locationValue, normalizeBooleanProp(props.nest))
    })
    const matches = computed(() => Boolean(result.value[0]))
    // Use shallowRef for routeParams as they are primitive values (strings)
    // This avoids deep reactivity when params object structure doesn't change
    const routeParams = computed(() => result.value[1])

    // Get parent params - might be a ref
    const injectedParams = injectVue(ParamsKey, Params0)
    // Use shallowRef-like approach: parentParams don't need deep reactivity
    // They're typically static or change infrequently
    const parentParams = computed(() => {
      const val = typeof injectedParams === 'function' ? injectedParams() : injectedParams
      return unref(val)
    })

    // Merge params reactively - use computed for reactivity tracking
    // but params are shallow objects (string -> string), so no deep reactivity needed
    const params = computed(() => ({ ...parentParams.value, ...routeParams.value }))

    // provide params context for children
    provideVue(ParamsKey, params)

    // Handle async components: if component is a function, wrap it in defineAsyncComponent
    // Use computed to memoize the resolved component
    const resolvedComponent = computed(() => {
      if (!props.component) return null
      // If component is a function (async loader), wrap it in defineAsyncComponent
      if (typeof props.component === 'function') {
        // Type assertion needed because defineAsyncComponent expects specific function signature
        // but we accept any function that returns a component
        return defineAsyncComponent(props.component as Parameters<typeof defineAsyncComponent>[0])
      }
      // Otherwise use component directly
      return props.component
    })

    return () => {
      if (!matches.value) return null

      const component = resolvedComponent.value
      // slots.default can be a function that receives params as argument (scoped slot) or no-arg function
      const defaultSlot = slots.default
      const routeContent = component
        ? h(component, { params: params.value })
        : defaultSlot && typeof defaultSlot === 'function'
          ? (defaultSlot as (params?: unknown) => unknown)(params.value)
          : defaultSlot || null

      const nestEnabled = normalizeBooleanProp(props.nest)
      if (nestEnabled && result.value[2]) {
        // For nested routes, create a Router with the correct base
        // We need to re-provide params in the render function
        const Wrapper = {
          setup() {
            // Provide the reactive params ref
            provideVue(ParamsKey, params)
            return () => routeContent
          },
        }
        return h(Router, { base: result.value[2] }, () => h(Wrapper))
      }

      return routeContent
    }
  },
}

type LinkProps = {
  href?: string
  to?: string
  onClick?: (event: MouseEvent) => void
  asChild?: boolean
  classFn?: (isActive: boolean) => string
  className?: string
  replace?: boolean
}

export const Link = {
  name: 'Link',
  props: {
    href: String,
    to: String,
    onClick: Function,
    asChild: Boolean,
    classFn: Function,
    className: String,
    replace: Boolean,
  },
  inheritAttrs: false,
  setup(props: LinkProps, { slots, attrs }: SetupContext & { attrs?: Record<string, unknown> }) {
    // Dev mode validation
    if (isDev()) {
      if (!props.href && !props.to) {
        console.warn('[wouter-vue] Link component: neither `href` nor `to` prop provided. Link will navigate to empty path.')
      }
      if (props.href && props.to) {
        console.warn('[wouter-vue] Link component: both `href` and `to` props provided. `href` will be used.')
      }
    }

    const router = useRouter()
    // Optimized: use type guard helper
    const routerValue = computed(() => normalizeRouterRef(router as RouterRef))
    const [currentPath, navigate] = useLocationFromRouter(router)

    const targetPath = props.href || props.to || ''

    const onClick = (event: MouseEvent) => {
      // ignores the navigation when clicked using right mouse button or
      // by holding a special modifier key: ctrl, command, win, alt, shift
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button !== 0) {
        return
      }

      props.onClick?.(event)
      if (!event.defaultPrevented) {
        event.preventDefault()
        const options = { replace: normalizeBooleanProp(props.replace) }
        const navigateFn = navigate as (
          path: string,
          options?: { replace?: boolean; state?: unknown }
        ) => void
        navigateFn(targetPath, options)
      }
    }

    // handle nested routers and absolute paths
    const href = computed(() => {
      const r = routerValue.value
      const base = r?.base || ''
      const finalPath = targetPath[0] === '~' ? targetPath.slice(1) : base + targetPath
      const hrefsFn = r?.hrefs || defaultRouter.hrefs
      const result = hrefsFn(finalPath, r)
      return result
    })

    return () => {
      const currentPathValue = (currentPath as ComputedRef<Path>).value
      const normalizedCurrent = normalizePath(currentPathValue)
      // targetPath is already relative, just normalize it
      const normalizedTarget = normalizePath(targetPath)
      const isActive = normalizedCurrent === normalizedTarget

      // Handle classFn prop for active link styling
      // Check both props and attrs for classFn (template syntax may pass via attrs)
      const classFnValue = props.classFn ?? (attrs as Record<string, unknown>)?.classFn
      let className: string | undefined = undefined

      if (typeof classFnValue === 'function') {
        className = classFnValue(isActive)
      }

      // Merge static classes from className prop or attrs.class
      const staticClass =
        props.className || (typeof attrs?.class === 'string' ? attrs.class : undefined)

      // Combine active class with static class
      if (className && staticClass) {
        className = `${staticClass} ${className}`.trim()
      } else if (staticClass) {
        className = staticClass
      }

      const slotFn = slots.default
      const content = slotFn ? (typeof slotFn === 'function' ? (slotFn as () => unknown)() : slotFn) : undefined

      return h(
        'a',
        {
          onClick,
          href: href.value,
          class: className || undefined,
          // Merge attrs (including data-testid) to root element
          ...(attrs as Record<string, unknown>),
        },
        content as Parameters<typeof h>[2]
      )
    }
  },
}

type VNodeChild = unknown

type VNodeElement = {
  type?: unknown
  props?: { path?: string; nest?: boolean; [key: string]: unknown }
  children?: VNodeChild[]
}

const flattenChildren = (children: VNodeChild): VNodeChild[] => {
  if (Array.isArray(children)) {
    return children.flatMap((c: VNodeChild) => {
      if (c && typeof c === 'object' && 'type' in c && (c as VNodeElement).type === Fragment) {
        const element = c as VNodeElement
        const fragmentChildren = element.props?.children ?? element.children
        return flattenChildren(fragmentChildren ?? [])
      }
      return c
    })
  } else {
    return [children]
  }
}

type SwitchProps = {
  location?: Path
}

export const Switch = {
  name: 'Switch',
  props: ['location'],
  setup(props: SwitchProps, { slots }: SetupContext): () => unknown {
    // Dev mode validation
    if (isDev() && !slots.default) {
      console.warn('[wouter-vue] Switch component: no default slot provided. Switch will not render anything.')
    }

    const router = useRouter()
    // Optimized: use type guard helper
    const routerValue = computed(() => normalizeRouterRef(router as RouterRef))
    const [originalLocation] = useLocationFromRouter(router)

    // Memoize flattened children to avoid re-flattening on each render
    // Note: children are reactive through slots, so we compute in render function
    // but cache the result when slots.default hasn't changed
    let lastSlotResult: unknown = undefined
    let lastFlattenedChildren: VNodeChild[] | null = null

    return () => {
      const routerObj = routerValue.value
      const parser = routerObj.parser ?? defaultRouter.parser

      const originalLocationValue = (originalLocation as ComputedRef<Path>).value
      const useLocation = props.location || originalLocationValue

      const defaultSlot = slots.default
      let slotResult: unknown = undefined
      if (defaultSlot) {
        if (typeof defaultSlot === 'function') {
          slotResult = (defaultSlot as () => unknown)()
        } else {
          slotResult = defaultSlot
        }
      }
      
      // Memoize: only re-flatten if slot result changed
      if (slotResult !== lastSlotResult) {
        lastSlotResult = slotResult
        lastFlattenedChildren = flattenChildren(slotResult)
      }
      const children = lastFlattenedChildren ?? []
      if (!children || children.length === 0) return null

      for (const element of children) {
        if (!element || typeof element !== 'object') continue

        const elementTyped = element as VNodeElement
        const path = elementTyped.props?.path

        // Handle catch-all routes (no path prop)
        if (!path) {
          if (elementTyped.type && elementTyped.type !== Fragment) {
            return elementTyped.children
              ? h(
                  elementTyped.type as Parameters<typeof h>[0],
                  { ...elementTyped.props, match: [true, null] } as Record<string, unknown>,
                  elementTyped.children as Parameters<typeof h>[2]
                )
              : h(
                  elementTyped.type as Parameters<typeof h>[0],
                  { ...elementTyped.props, match: [true, null] } as Record<string, unknown>
                )
          }
          continue
        }

        let match: ReturnType<typeof matchRoute> | null = null

        if (elementTyped.type && elementTyped.type !== Fragment) {
          const locationForMatch = unref(useLocation)
          const isNest = normalizeBooleanProp((elementTyped.props as Record<string, unknown> | undefined)?.nest)
          match = matchRoute(parser, path, locationForMatch, isNest)
        }

        if (match?.[0]) {
          // Early return on first match for better performance
          const elementType = elementTyped.type as Parameters<typeof h>[0]
          const elementProps = { ...elementTyped.props, match } as Record<string, unknown>
          return elementTyped.children
            ? h(elementType, elementProps, elementTyped.children as Parameters<typeof h>[2])
            : h(elementType, elementProps)
        }
      }

      return null
    }
  },
}

type RedirectProps = {
  to?: Path
  href?: Path
  replace?: boolean
  state?: unknown
}

export const Redirect = {
  name: 'Redirect',
  props: ['to', 'href', 'replace', 'state'],
  setup(props: RedirectProps) {
    const { to, href } = props
    const targetPath = to || href || ''

    // Dev mode validation
    if (isDev()) {
      if (!targetPath) {
        console.warn('[wouter-vue] Redirect component: neither `to` nor `href` prop provided. Redirect will navigate to empty path.')
      }
      if (to && href) {
        console.warn('[wouter-vue] Redirect component: both `to` and `href` props provided. `to` will be used.')
      }
    }

    const router = useRouter()
    const [, navigate] = useLocationFromRouter(router)
    const navigateFn = navigate as (
      path: string,
      options?: { replace?: boolean; state?: unknown }
    ) => void

    // Get ssrContext from router computed value synchronously
    // The router is a computed ref, so we need to access its .value
    // Directly access router.value to get the current computed value
    let routerValueObj: RouterObject & { ssrContext?: SsrContext }
    if (typeof router === 'function') {
      routerValueObj = (router as () => RouterObject)() as RouterObject & {
        ssrContext?: SsrContext
      }
    } else if (router && typeof router === 'object' && 'value' in router) {
      routerValueObj = (router as unknown as ComputedRef<RouterObject> | Ref<RouterObject>)
        .value as RouterObject & { ssrContext?: SsrContext }
    } else {
      routerValueObj = router as RouterObject & { ssrContext?: SsrContext }
    }
    // Set SSR context synchronously if available (before mount)
    // Read ssrContext using bracket notation to avoid type issues
    const ssrCtx =
      'ssrContext' in routerValueObj
        ? ((routerValueObj as unknown as Record<string, unknown>).ssrContext as
            | SsrContext
            | undefined)
        : undefined
    if (ssrCtx) {
      ssrCtx.redirectTo = targetPath
    }

    // Client-side navigation should happen after mount to avoid side effects during render
    // SSR context is set synchronously above for server-side redirects
    onMounted(() => {
      try {
        navigateFn(targetPath, { replace: props.replace, state: props.state })
      } catch (error) {
        if (isDev()) {
          console.error('[wouter-vue] Error during redirect navigation:', error)
        }
        throw error
      }
    })

    return () => null
  },
}
