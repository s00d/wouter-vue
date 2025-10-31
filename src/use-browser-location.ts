import { type Ref, ref, watchEffect } from 'vue'

type Path = string
type SearchString = string

type Primitive = string | number | bigint | boolean | null | undefined | symbol

/**
 * History API docs @see https://developer.mozilla.org/en-US/docs/Web/API/History
 */
const eventPopstate = 'popstate'
const eventPushState = 'pushState'
const eventReplaceState = 'replaceState'
const eventHashchange = 'hashchange'
const events = [eventPopstate, eventPushState, eventReplaceState, eventHashchange] as const

const subscribeToLocationUpdates = (callback: () => void): (() => void) => {
  // SSR check - don't subscribe to events on server
  if (typeof window === 'undefined' || typeof addEventListener === 'undefined') {
    return () => {} // Return no-op unsubscribe function
  }

  for (const event of events) {
    addEventListener(event, callback)
  }
  return () => {
    for (const event of events) {
      removeEventListener(event, callback)
    }
  }
}

// Vue version using ref instead of useSyncExternalStore
export function useLocationProperty<S extends Primitive>(fn: () => S, ssrFn?: () => S): Ref<S> {
  const property = ref(typeof ssrFn === 'function' ? ssrFn() : fn()) as Ref<S>

  watchEffect((onInvalidate) => {
    const callback = () => {
      property.value = fn()
    }

    const unsubscribe = subscribeToLocationUpdates(callback)

    onInvalidate(() => {
      unsubscribe()
    })
  })

  return property
}

const currentSearch = (): string => {
  if (typeof window === 'undefined' || typeof location === 'undefined') {
    return ''
  }
  return location.search
}

export const useSearch = ({
  ssrSearch = '',
}: {
  ssrSearch?: SearchString
} = {}): Ref<SearchString> =>
  useLocationProperty(currentSearch, () => ssrSearch) as Ref<SearchString>

const currentPathname = (): Path => {
  if (typeof window === 'undefined' || typeof location === 'undefined') {
    return '/' as Path
  }
  return location.pathname as Path
}

export const usePathname = ({ ssrPath }: { ssrPath?: Path } = {}): Ref<Path> =>
  useLocationProperty(currentPathname, ssrPath ? () => ssrPath : currentPathname) as Ref<Path>

const currentHistoryState = (): null => {
  if (typeof window === 'undefined' || typeof history === 'undefined') {
    return null
  }
  // history.state can be any value, but we need to return a Primitive for type safety
  // Return null as default and cast the result
  return (history.state ?? null) as null
}

export const useHistoryState = <T = unknown>(): Ref<T> =>
  useLocationProperty(currentHistoryState, () => null) as Ref<T>

export const navigate = <S = unknown>(
  to: string | URL,
  { replace = false, state = null }: { replace?: boolean; state?: S | null } = {}
): void => {
  // SSR check - don't navigate on server
  if (typeof window === 'undefined' || typeof history === 'undefined') {
    return
  }
  history[replace ? eventReplaceState : eventPushState](state as S, '', to as string)
}

// the 2nd argument of the `useBrowserLocation` return value is a function
// that allows to perform a navigation.
export const useBrowserLocation = ({
  ssrPath,
}: {
  ssrPath?: Path
} = {}): [Ref<Path>, typeof navigate] => [usePathname({ ssrPath }), navigate]

const patchKey = Symbol.for('wouter_vue')

// While History API does have `popstate` event, the only
// proper way to listen to changes via `push/replaceState`
// is to monkey-patch these methods.
//
// See https://stackoverflow.com/a/4585031
if (
  typeof window !== 'undefined' &&
  typeof history !== 'undefined' &&
  typeof (window as unknown as Record<symbol, unknown>)[patchKey] === 'undefined'
) {
  for (const type of [eventPushState, eventReplaceState]) {
    const original = history[type as keyof typeof history] as (...args: unknown[]) => unknown
    ;(history as unknown as Record<string, unknown>)[type] = function (...args: unknown[]) {
      const result = original.apply(this, args)
      // Use CustomEvent to pass arguments to listeners
      const event = new CustomEvent(type, { detail: { args } })

      if (typeof dispatchEvent !== 'undefined') {
        dispatchEvent(event)
      }
      return result
    }
  }

  // patch history object only once
  // See: https://github.com/molefrog/wouter/issues/167
  Object.defineProperty(window, patchKey, { value: true })
}
