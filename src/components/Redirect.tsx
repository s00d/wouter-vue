/**
 * Redirect component for wouter-vue
 * 
 * Navigates to a new location when rendered.
 */

import { onMounted } from 'vue'
import type { Path } from '../../types/location-hook.d.js'
import type { RouterObject, SsrContext } from '../../types/router.d.js'
import { useLocationFromRouter, useRouter } from '../index'
import { getRouterValue, resolveTargetPath, validateTargetPathProps, devWarn } from '../helpers'
import { PropsResolver } from '../helpers'

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
    // Dev mode validation
    validateTargetPathProps('Redirect', props, true)

    // Resolve target path from props (to takes precedence over href)
    const targetPath = resolveTargetPath(props, true)

    const router = useRouter()
    const [, navigate] = useLocationFromRouter(router)
    const navigateFn = navigate as (
      path: string,
      options?: { replace?: boolean; state?: unknown }
    ) => void

    // Get ssrContext from router computed value synchronously
    // The router is a computed ref, so we need to access its .value
    // Directly access router.value to get the current computed value
    const routerValueObj = getRouterValue(router) as RouterObject & { ssrContext?: SsrContext }
    
    // Use PropsResolver to cleanly access ssrContext from router object
    const routerResolver = new PropsResolver(
      {},
      routerValueObj as unknown as Record<string, unknown>
    )
    const ssrCtx = routerResolver.get<SsrContext>('ssrContext')
    if (ssrCtx) {
      ssrCtx.redirectTo = targetPath
    }

    // Client-side navigation should happen after mount to avoid side effects during render
    // SSR context is set synchronously above for server-side redirects
    onMounted(() => {
      try {
        navigateFn(targetPath, { replace: props.replace, state: props.state })
      } catch (error) {
        devWarn('Redirect', `Error during redirect navigation: ${error instanceof Error ? error.message : String(error)}`)
        throw error
      }
    })

    return () => null
  },
}

