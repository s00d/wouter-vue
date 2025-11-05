/**
 * Link component for wouter-vue
 *
 * Creates a navigation link that updates the URL without a full page reload.
 */

import type { ComputedRef } from 'vue'
import { computed, h } from 'vue'
import type { Path } from '../../types/location-hook'
import { useLocationFromRouter, useRouter, defaultRouter, normalizeBooleanProp } from '../index'
import type { ComponentSetupContext } from './types'
import { normalizePath, resolveTargetPath, validateTargetPathProps, shouldIgnoreNavigationClick } from '../helpers/path-helpers'
import { useRouterValue } from '../helpers/router-helpers'
import { resolveSlot, resolveSlotWithParams, PropsResolver } from '../helpers/vue-helpers'

type LinkProps = {
  href?: string
  to?: string
  onClick?: (event: MouseEvent) => void
  asChild?: boolean
  replace?: boolean
}

export const Link = {
  name: 'Link',
  props: {
    href: String,
    to: String,
    onClick: Function,
    asChild: Boolean,
    replace: Boolean,
  },
  inheritAttrs: false,
  setup(props: LinkProps, { slots, attrs }: ComponentSetupContext) {
    // Dev mode validation
    validateTargetPathProps('Link', props, false)

    const router = useRouter()
    // Optimized: use type guard helper
    const routerValue = useRouterValue(router)
    const [currentPath, navigate] = useLocationFromRouter(router)

    // Resolve target path from props (href takes precedence over to)
    const targetPath = resolveTargetPath(props, false)

    // Create resolver for props with attrs as fallback (attrs may contain props passed via template)
    const attrsResolver = new PropsResolver(
      props as Record<string, unknown>,
      attrs as Record<string, unknown>
    )

    const onClick = (event: MouseEvent) => {
      // ignores the navigation when clicked using right mouse button or
      // by holding a special modifier key: ctrl, command, win, alt, shift
      if (shouldIgnoreNavigationClick(event)) {
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

      // Check if default slot is a scoped slot (function that accepts params)
      // In Vue 3, scoped slots are functions that accept an object with slot props
      // We try to resolve with params first (for scoped slots), then fall back to regular slot
      const defaultSlot = slots.default
      let content: unknown = null

      if (defaultSlot) {
        // For scoped slots, we need to detect if slot accepts parameters
        // In SSR, function.length might not be reliable, so we use resolveSlotWithParams
        // which handles both cases safely
        if (typeof defaultSlot === 'function') {
          // Try scoped slot with params first
          // resolveSlotWithParams will fall back to regular slot if params aren't accepted
          content = resolveSlotWithParams(defaultSlot, { isActive })
        } else {
          // Regular slot (not a function)
          content = resolveSlot(defaultSlot)
        }
      } else {
        content = null
      }

      // Get class from attrs (standard Vue class attribute)
      const classNameFromAttrs = attrsResolver.get<string>('class')

      return h(
        'a',
        {
          onClick,
          href: href.value,
          class: typeof classNameFromAttrs === 'string' ? classNameFromAttrs : undefined,
          // Merge attrs (including data-testid) to root element
          ...(attrs as Record<string, unknown>),
        },
        content as Parameters<typeof h>[2]
      )
    }
  },
}
