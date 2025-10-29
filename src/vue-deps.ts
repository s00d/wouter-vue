import {
  computed,
  createTextVNode,
  defineAsyncComponent,
  Fragment,
  h,
  inject,
  onBeforeUpdate,
  onMounted as onMountedVue,
  onUnmounted,
  provide,
  type Ref,
  reactive,
  ref as refVue,
  watch,
  watchEffect,
} from 'vue'

export {
  refVue as ref,
  reactive,
  computed,
  watch,
  watchEffect,
  provide,
  inject,
  onMountedVue as onMounted,
  onUnmounted,
  onBeforeUpdate,
  createTextVNode,
  Fragment,
  h,
  defineAsyncComponent,
}

export type { Ref }

// Equivalent to React's Context, but for Vue we use provide/inject
export const createContext = (defaultValue: unknown) => {
  const key = Symbol('context')
  return { key, defaultValue }
}

export const useContext = <T = unknown>(contextKey: unknown): T | null => {
  return inject(contextKey as string | symbol, null) as T | null
}

// Vue doesn't have isValidElement like React, but we can check for VNode
export const isValidElement = (vnode: unknown): boolean => {
  return (
    vnode != null &&
    typeof vnode === 'object' &&
    (vnode as { __v_isVNode?: boolean }).__v_isVNode === true
  )
}

// Vue's cloneVNode is analogous to React's cloneElement
export { cloneVNode as cloneElement } from 'vue'

// Use ref for stable function references (similar to useEvent)
export const useEvent = <T extends (...args: unknown[]) => unknown>(fn: T): T => {
  const refValue = refVue(fn)
  refValue.value = fn
  return ((...args: unknown[]) => refValue.value(...args)) as T
}

// Copied from:
// https://github.com/facebook/react/blob/main/packages/shared/ExecutionEnvironment.js
const canUseDOM = !!(
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
)

// Vue's equivalent of useIsomorphicLayoutEffect
export const useIsomorphicLayoutEffect = canUseDOM ? onMountedVue : () => {}

// Simplified useSyncExternalStore for Vue using ref + watch
export function useSyncExternalStore<T>(
  subscribe: (callback: () => void) => () => void,
  getSnapshot: () => T,
  getSSRSnapshot?: () => T
): T {
  const snapshot = refVue(getSSRSnapshot ? getSSRSnapshot() : getSnapshot())

  watchEffect((onInvalidate) => {
    const callback = () => {
      snapshot.value = getSnapshot()
    }

    const unsubscribe = subscribe(callback)

    onInvalidate(() => {
      unsubscribe()
    })
  })

  return snapshot.value
}

export const useRef = <T = unknown>(initialValue: T) => refVue(initialValue) as Ref<T>
export const useMemo = <T = unknown>(fn: () => T, _deps: unknown[]) => computed(() => fn())
