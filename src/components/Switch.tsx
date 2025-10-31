/**
 * Switch component for wouter-vue
 * 
 * Renders the first matching Route child component.
 */

import type { ComputedRef } from 'vue'
import { Fragment, h, unref } from 'vue'
import type { Path } from '../../types/location-hook.d.js'
import { useLocationFromRouter, useRouter, defaultRouter, normalizeBooleanProp, matchRoute } from '../index'
import type { ComponentSetupContext } from './types'
import { useRouterValue, devWarn, resolveSlot } from '../helpers'

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
  setup(props: SwitchProps, { slots }: ComponentSetupContext): () => unknown {
    // Dev mode validation
    if (!slots.default) {
      devWarn('Switch', 'no default slot provided. Switch will not render anything.')
    }

    const router = useRouter()
    // Optimized: use type guard helper
    const routerValue = useRouterValue(router)
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

      const slotResult = resolveSlot(slots.default)
      
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

