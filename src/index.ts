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
  watch,
} from 'vue'

type RouterRef =
  | RouterObject
  | Ref<RouterObject>
  | ComputedRef<RouterObject>
  | ((...args: unknown[]) => RouterObject)

/**
 * Normalizes Vue boolean props (boolean shorthand support).
 * Returns true if value is empty string ('') or true, false otherwise.
 * This handles Vue's boolean prop shorthand: <Component prop /> results in prop="" on vnode.
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

// Internal version of useLocation to avoid redundant useRouter calls
const useLocationFromRouter = (router: RouterRef): [ComputedRef<Path>, NavigateFn] => {
  const routerValue = computed(() => {
    // router may be a function, ref, or plain object
    const r: RouterObject | Ref<RouterObject> | ComputedRef<RouterObject> =
      typeof router === 'function' ? (router as () => RouterObject)() : router
    return unref(r) as RouterObject
  })

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

export const useLocation = (): [ComputedRef<Path>, NavigateFn] => {
  const router = useRouter()
  const result = useLocationFromRouter(router)
  return result
}

export const useSearch = () => {
  const router = useRouter()
  const routerValue = computed(() => {
    const r: RouterObject | Ref<RouterObject> | ComputedRef<RouterObject> =
      typeof router === 'function' ? (router as () => RouterObject)() : router
    return unref(r) as RouterObject
  })
  const searchResult = computed(() => {
    const searchHookFn = routerValue.value.searchHook
    if (!searchHookFn) return ''
    try {
      const searchHookResult = searchHookFn(routerValue.value)
      if (!searchHookResult) return ''
      const searchValue = unref(searchHookResult)
      return sanitizeSearch(searchValue)
    } catch {
      return ''
    }
  })
  return searchResult
}

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
      if (keys !== false) {
        return Object.fromEntries(
          (keys as string[]).map((key: string, i: number) => [key, matches[i]])
        ) as RouteParams
      }

      // Priority 2: If we have named capture groups from RegExp, use them
      const groups = (result as RegExpExecArray).groups
      if (groups) {
        return { ...groups } as RouteParams
      }

      // Priority 3: Fallback to numeric indices only if no named keys/groups exist
      const paramsFromMatches: RouteParams = {}
      matches.forEach((match, i) => {
        paramsFromMatches[String(i)] = match
      })
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

export const useRoute = (
  pattern: string | RegExp
): [ComputedRef<boolean>, ComputedRef<RouteParams | null>] => {
  const [location] = useLocation()
  const router = useRouter()

  const result = computed(() => {
    const routerObj =
      typeof router === 'function'
        ? (router as () => RouterObject)()
        : (unref(router) as RouterObject)

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
    default?: () => unknown
  }
}

export const Router = {
  name: 'Router',
  props: ['hook', 'searchHook', 'base', 'parser', 'ssrPath', 'ssrSearch', 'ssrContext', 'hrefs'],
  setup(props: RouterProps, { slots }: SetupContext) {
    const parent = injectVue(RouterKey, defaultRouter)

    // when `ssrPath` contains a `?` character, we can extract the search from it
    let _ssrPath = props.ssrPath
    let _ssrSearch = props.ssrSearch
    if (props.ssrPath?.includes('?')) {
      ;[_ssrPath, _ssrSearch] = props.ssrPath.split('?')
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
        ssrPath: props.ssrPath !== undefined ? props.ssrPath : parentValue.ssrPath,
        ssrSearch: props.ssrSearch !== undefined ? props.ssrSearch : parentValue.ssrSearch,
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

    return () => slots.default?.()
  },
}

const _h_route = (
  { slots, component }: { slots?: { default?: (params: unknown) => unknown }; component?: unknown },
  params: unknown
) => {
  // component style
  if (component) return h(component as Parameters<typeof h>[0], { params })

  // support default slot or scoped slot
  return slots?.default ? slots.default(params) : null
}

// Cache params object between renders if values are shallow equal
const _useCachedParams = (value: unknown) => {
  const cached = ref(value)
  watch(
    () => value,
    (newValue: unknown) => {
      const curr = cached.value as Record<string, unknown>
      const newVal = newValue as Record<string, unknown>
      if (
        Object.keys(newVal).length !== Object.keys(curr).length ||
        Object.entries(newVal).some(([k, v]) => v !== curr[k])
      ) {
        cached.value = newValue
      }
    }
  )
  return cached
}

// Normalize path for comparison by removing query params and hash
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

export const Route = {
  name: 'Route',
  props: ['path', 'component', 'nest', 'match'],
  setup(props, { slots }) {
    const router = useRouter()

    const [location] = useLocationFromRouter(router)

    const result = computed(() => {
      const r: RouterObject | Ref<RouterObject> | ComputedRef<RouterObject> =
        typeof router === 'function' ? (router as () => RouterObject)() : router
      const routerObj: RouterObject = unref(r) as RouterObject
      const parserFn =
        (typeof routerObj.parser === 'function' ? routerObj.parser : null) ?? defaultRouter.parser
      const locationValue = (location as ComputedRef<Path>).value
      const match = props.match ?? matchRoute(parserFn, props.path, locationValue, normalizeBooleanProp(props.nest))
      return match
    })
    const matches = computed(() => result.value[0])
    const routeParams = computed(() => result.value[1])

    // Get parent params - might be a ref
    const injectedParams = injectVue(ParamsKey, Params0)
    const parentParams = computed(() => {
      const val = typeof injectedParams === 'function' ? injectedParams() : injectedParams
      return unref(val)
    })

    // Merge params reactively
    const params = computed(() => ({ ...parentParams.value, ...routeParams.value }))

    // provide params context for children
    provideVue(ParamsKey, params)

    // Handle async components: if component is a function, wrap it in defineAsyncComponent
    // Use computed to memoize the resolved component
    const resolvedComponent = computed(() => {
      if (!props.component) return null
      // If component is a function (async loader), wrap it in defineAsyncComponent
      if (typeof props.component === 'function') {
        // Check if it's already an async component or a regular component
        // If component.toString().includes('defineAsyncComponent'), it's already wrapped
        return defineAsyncComponent(props.component)
      }
      // Otherwise use component directly
      return props.component
    })

    return () => {
      if (!matches.value) return null

      const component = resolvedComponent.value
      const routeContent = component
        ? h(component, { params: params.value })
        : slots.default?.(params.value)

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
    const router = useRouter()
    const routerValue = computed(() => {
      const r: RouterObject | Ref<RouterObject> | ComputedRef<RouterObject> =
        typeof router === 'function' ? (router as () => RouterObject)() : router
      return (
        r && typeof r === 'object' && 'value' in r
          ? (r as unknown as Ref<RouterObject> | ComputedRef<RouterObject>).value
          : r
      ) as RouterObject
    })
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

      const content = slots.default?.()

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
  setup(props: SwitchProps, { slots }: SetupContext) {
    const router = useRouter()
    const routerValue = computed(() => {
      const r: RouterObject | Ref<RouterObject> | ComputedRef<RouterObject> =
        typeof router === 'function' ? (router as () => RouterObject)() : router
      return (
        r && typeof r === 'object' && 'value' in r
          ? (r as unknown as Ref<RouterObject> | ComputedRef<RouterObject>).value
          : r
      ) as RouterObject
    })
    const [originalLocation] = useLocationFromRouter(router)

    return () => {
      const routerObj = routerValue.value
      const parser = routerObj.parser ?? defaultRouter.parser

      const originalLocationValue = (originalLocation as ComputedRef<Path>).value
      const useLocation = props.location || originalLocationValue

      const children = flattenChildren(slots.default?.())
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
          
          return elementTyped.children
            ? h(
                elementTyped.type as Parameters<typeof h>[0],
                { ...elementTyped.props, match } as Record<string, unknown>,
                elementTyped.children as Parameters<typeof h>[2]
              )
            : h(
                elementTyped.type as Parameters<typeof h>[0],
                { ...elementTyped.props, match } as Record<string, unknown>
              )
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
      navigateFn(targetPath, { replace: props.replace, state: props.state })
    })

    return () => null
  },
}
