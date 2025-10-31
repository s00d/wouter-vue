/**
 * Link component for wouter-vue
 * 
 * Creates a navigation link that updates the URL without a full page reload.
 */

import type { ComputedRef } from 'vue'
import { computed, h } from 'vue'
import type { Path } from '../../types/location-hook.d.js'
import { useLocationFromRouter, useRouter, defaultRouter, normalizeBooleanProp } from '../index'
import type { ComponentSetupContext } from './types'
import { normalizePath, useRouterValue, resolveSlot, resolveTargetPath, validateTargetPathProps, shouldIgnoreNavigationClick } from '../helpers'
import { PropsResolver } from '../helpers'

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

      // Handle classFn prop for active link styling
      // Check both props and attrs for classFn (template syntax may pass via attrs)
      const classFnValue = attrsResolver.get<((isActive: boolean) => string)>('classFn')
      let className: string | undefined = undefined

      if (typeof classFnValue === 'function') {
        className = classFnValue(isActive)
      }

      // Merge static classes from className prop or attrs.class
      const classNameFromAttrs = attrsResolver.get<string>('class')
      const staticClass = attrsResolver.get<string>('className') || 
        (typeof classNameFromAttrs === 'string' ? classNameFromAttrs : undefined)

      // Combine active class with static class
      if (className && staticClass) {
        className = `${staticClass} ${className}`.trim()
      } else if (staticClass) {
        className = staticClass
      }

      const content = resolveSlot(slots.default)

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

