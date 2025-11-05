/**
 * Router component for wouter-vue
 *
 * Provides routing context to child components.
 */

import { computed, inject as injectVue, provide as provideVue } from 'vue'
import type { Path } from '../../types/location-hook'
import type { HrefsFormatter, Parser, RouterObject, SsrContext } from '../../types'
import { RouterKey, defaultRouter } from '../index'
import type { ComponentSetupContext } from './types'
import { parseSsrPath } from '../helpers/ssr-helpers'
import { resolveSlot } from '../helpers/vue-helpers'
import { getRouterValue } from '../helpers/router-helpers'
import { PropsResolver } from '../helpers/vue-helpers'

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

export const Router = {
  name: 'Router',
  props: ['hook', 'searchHook', 'base', 'parser', 'ssrPath', 'ssrSearch', 'ssrContext', 'hrefs'],
  setup(props: RouterProps, { slots }: ComponentSetupContext) {
    const parent = injectVue(RouterKey, defaultRouter)

    // when `ssrPath` contains a `?` character, we can extract the search from it
    const { path: finalSsrPath, search: parsedSearch } = parseSsrPath(props.ssrPath)
    const finalSsrSearch = props.ssrSearch ?? parsedSearch

    // construct the new router object without mutations
    const router = computed(() => {
      // Get parent value (it might be a computed ref)
      const parentValue: RouterObject = getRouterValue(parent)

      // Create new object without readonly constraints
      // Note: ssrContext is not part of RouterObject type but is used at runtime
      // Use PropsResolver for clean prop access with fallback to parent
      const resolver = new PropsResolver(
        props as Record<string, unknown>,
        parentValue as unknown as Record<string, unknown>
      )

      // Pass ssrContext through if provided (runtime property, not in type)
      const ssrContextValue = resolver.get<SsrContext>('ssrContext')
      // Resolve props with fallback to parent or defaults
      const base = resolver.get<Path>('base')
      const parser = resolver.get<Parser>('parser', parentValue.parser)
      const searchHook = resolver.get<RouterObject['searchHook']>(
        'searchHook',
        parentValue.searchHook
      )
      const hook = resolver.get<RouterObject['hook']>('hook', parentValue.hook)

      // Special handling for base (concatenate if provided)
      const resolvedBase = base !== undefined ? parentValue.base + (base || '') : parentValue.base
      const resolvedOwnBase = base !== undefined ? base : parentValue.ownBase

      // Special handling for hrefs (check hook object first, then props, then parent, then default)
      let resolvedHrefs: HrefsFormatter
      if (props.hrefs !== undefined) {
        resolvedHrefs = props.hrefs
      } else if (typeof props.hook === 'object' && props.hook && 'hrefs' in props.hook) {
        resolvedHrefs = (props.hook as { hrefs?: HrefsFormatter }).hrefs ?? defaultRouter.hrefs
      } else {
        resolvedHrefs =
          resolver.get<HrefsFormatter>('hrefs') ?? parentValue.hrefs ?? defaultRouter.hrefs
      }

      const result = {
        base: resolvedBase,
        ownBase: resolvedOwnBase,
        ssrPath: finalSsrPath ?? parentValue.ssrPath,
        ssrSearch: finalSsrSearch ?? parentValue.ssrSearch,
        parser,
        searchHook,
        hook,
        hrefs: resolvedHrefs,
        ...(ssrContextValue !== undefined ? { ssrContext: ssrContextValue } : {}),
      } as RouterObject & { ssrContext?: SsrContext }
      return result
    })

    // provide the router context to children
    provideVue(RouterKey, router)

    return () => {
      const defaultSlot = slots.default
      if (!defaultSlot) return null
      // Router default slot doesn't take parameters
      return resolveSlot(defaultSlot)
    }
  },
}
