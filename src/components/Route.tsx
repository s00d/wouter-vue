/**
 * Route component for wouter-vue
 *
 * Renders content when the current location matches the route pattern.
 */

import type { ComputedRef } from 'vue'
import { computed, defineAsyncComponent, inject as injectVue, provide as provideVue, h, ref } from 'vue'
import type { Path } from '../../types/location-hook'
import type { MatchResult } from '../index.js'
import {
  useLocationFromRouter,
  useRouter,
  ParamsKey,
  RouteDataKey,
  normalizeRouterRef,
  normalizeBooleanProp,
  matchRoute,
  type RouteDataInput,
} from '../index'
import type { RouterRef } from '../index'
import { Router } from './Router'
import type { ComponentSetupContext } from './types'
import { devWarn } from '../helpers/dev-helpers'
import { resolveSlotWithParams, unwrapValue } from '../helpers/vue-helpers'

type RouteProps = {
  path?: string | RegExp
  component?: unknown
  nest?: unknown
  match?: MatchResult
  data?: RouteDataInput
}

export const Route = {
  name: 'Route',
  props: ['path', 'component', 'nest', 'match', 'data'],
  setup(props: RouteProps, { slots }: ComponentSetupContext) {
    // Dev mode validation (only warn, don't prevent rendering)
    if (props.path === undefined && props.match === undefined) {
      // This is valid for catch-all routes, so we only log in dev mode
      // but don't prevent rendering
    }
    if (props.component === undefined && !slots.default) {
      devWarn(
        'Route',
        'neither `component` prop nor default slot provided. Route will not render anything.'
      )
    }

    const router = useRouter()
    const [location] = useLocationFromRouter(router)

    // Get parent route data - might be a ref/computed
    const parentData = injectVue(RouteDataKey, ref({}))

    // Merge route data reactively - child overrides parent
    const mergedData = computed(() => ({
      ...unwrapValue(parentData), // Unwrap reactive parent data
      ...(props.data ? unwrapValue(props.data) : {}), // Unwrap if reactive, child overrides parent
    }))

    // Provide merged data context for children
    provideVue(RouteDataKey, mergedData)

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
      const locationValue = (location as ComputedRef<Path>).value
      return matchRoute(
        routerObj.parser,
        props.path,
        locationValue,
        normalizeBooleanProp(props.nest)
      )
    })
    const matches = computed(() => Boolean(result.value[0]))
    // Use shallowRef for routeParams as they are primitive values (strings)
    // This avoids deep reactivity when params object structure doesn't change
    const routeParams = computed(() => result.value[1])

    // Get parent params - might be a ref
    const injectedParams = injectVue(ParamsKey, ref({}))
    // Use shallowRef-like approach: parentParams don't need deep reactivity
    // They're typically static or change infrequently
    const parentParams = computed(() => unwrapValue(injectedParams))

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
      const slotProps = { params: params.value, data: mergedData.value }
      const routeContent = component
        ? h(component, slotProps)
        : resolveSlotWithParams(defaultSlot, slotProps) || null

      const nestEnabled = normalizeBooleanProp(props.nest)
      if (nestEnabled && result.value[2]) {
        // For nested routes, create a Router with the correct base
        // We need to re-provide params and data in the render function
        const Wrapper = {
          setup() {
            // Provide the reactive params and data refs
            provideVue(ParamsKey, params)
            provideVue(RouteDataKey, mergedData)
            return () => routeContent
          },
        }
        return h(Router, { base: result.value[2] }, () => h(Wrapper))
      }

      return routeContent
    }
  },
}
