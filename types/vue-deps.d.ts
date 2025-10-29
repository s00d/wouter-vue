import { computed, createTextVNode, defineAsyncComponent, Fragment, h, inject, onBeforeUpdate, onMounted as onMountedVue, onUnmounted, provide, Ref, reactive, ref as refVue, watch, watchEffect } from 'vue';
export { refVue as ref, reactive, computed, watch, watchEffect, provide, inject, onMountedVue as onMounted, onUnmounted, onBeforeUpdate, createTextVNode, Fragment, h, defineAsyncComponent, };
export type { Ref };
export declare const createContext: (defaultValue: unknown) => {
    key: symbol;
    defaultValue: unknown;
};
export declare const useContext: <T = unknown>(contextKey: unknown) => T | null;
export declare const isValidElement: (vnode: unknown) => boolean;
export { cloneVNode as cloneElement } from 'vue';
export declare const useEvent: <T extends (...args: unknown[]) => unknown>(fn: T) => T;
export declare const useIsomorphicLayoutEffect: (hook: any, target?: import('vue').ComponentInternalInstance | null) => void;
export declare function useSyncExternalStore<T>(subscribe: (callback: () => void) => () => void, getSnapshot: () => T, getSSRSnapshot?: () => T): T;
export declare const useRef: <T = unknown>(initialValue: T) => Ref<T>;
export declare const useMemo: <T = unknown>(fn: () => T, _deps: unknown[]) => import('vue').ComputedRef<T>;
