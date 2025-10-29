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
  unref,
  isRef,
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
  unref,
  isRef,
}

export type { Ref }

// Note: React-like abstractions (useEvent, useMemo, useRef, useSyncExternalStore, etc.)
// are removed as they're not used and Vue already provides better alternatives:
// - useMemo: use computed() directly
// - useRef: use ref() directly
// - useEvent: functions in setup() are already stable in Vue
// - useContext/createContext: use provide/inject directly
