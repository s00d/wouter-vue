import { ComputedRef, Ref } from 'vue';
import { RouterObject } from '../types/router.d.js';
import { RouterRef } from './index';
/**
 * Helper to check if we're in development mode.
 *
 * @returns `true` if running in development mode, `false` otherwise
 */
export declare function isDev(): boolean;
/**
 * Normalize path for comparison by removing query params and hash.
 * Used for link active state detection.
 *
 * @param path - The path to normalize
 * @returns Normalized path string
 */
export declare function normalizePath(path: string): string;
/**
 * Get router value as computed ref for reactive access.
 *
 * @param router - Router reference (can be object, ref, computed ref, or function)
 * @returns ComputedRef of RouterObject
 */
export declare function useRouterValue(router: RouterRef): ComputedRef<RouterObject>;
/**
 * Resolve slot value (function or direct value).
 *
 * @param slot - Slot value (can be function or any value)
 * @returns Resolved slot value
 */
export declare function resolveSlot(slot: unknown): unknown;
/**
 * Resolve slot with params for scoped slots.
 *
 * @param slot - Slot value (can be function or any value)
 * @param params - Parameters to pass to scoped slot function
 * @returns Resolved slot value
 */
export declare function resolveSlotWithParams(slot: unknown, params?: unknown): unknown;
/**
 * Log development warning with component name prefix.
 *
 * @param componentName - Name of the component
 * @param message - Warning message
 */
export declare function devWarn(componentName: string, message: string): void;
/**
 * Get router value synchronously (for SSR context access).
 * Handles function, ref, and direct object cases.
 *
 * @param router - Router reference (can be object, ref, computed ref, or function)
 * @returns RouterObject value
 */
export declare function getRouterValue(router: RouterRef): RouterObject;
/**
 * Parse SSR path to extract path and search string.
 *
 * @param ssrPath - SSR path string (may contain ? for search params)
 * @returns Object with path and search separated
 */
export declare function parseSsrPath(ssrPath?: string): {
    path?: string;
    search?: string;
};
/**
 * Check if running in SSR environment.
 *
 * @returns `true` if running on server, `false` if in browser
 */
export declare function isSSR(): boolean;
/**
 * Check if running in browser environment.
 *
 * @returns `true` if running in browser, `false` if in SSR
 */
export declare function isBrowser(): boolean;
/**
 * Resolve target path from href or to props.
 *
 * @param props - Object with href and/or to properties
 * @param preferTo - If true, prefer `to` over `href`; otherwise prefer `href` over `to`
 * @returns Resolved target path string
 */
export declare function resolveTargetPath(props: {
    href?: string;
    to?: string;
}, preferTo?: boolean): string;
/**
 * Validate target path props and log warnings in dev mode.
 *
 * @param componentName - Name of the component for error messages
 * @param props - Object with href and/or to properties
 * @param preferTo - If true, prefer `to` over `href`; otherwise prefer `href` over `to`
 */
export declare function validateTargetPathProps(componentName: string, props: {
    href?: string;
    to?: string;
}, preferTo?: boolean): void;
/**
 * Check if navigation click should be ignored (modifier keys or right click).
 *
 * @param event - Mouse event to check
 * @returns `true` if navigation should be ignored, `false` otherwise
 */
export declare function shouldIgnoreNavigationClick(event: MouseEvent): boolean;
/**
 * Universal helper to unwrap values (function, ref, computed ref, or direct value).
 *
 * @param value - Value that may be wrapped in various forms
 * @returns Unwrapped value
 */
export declare function unwrapValue<T>(value: T | (() => T) | Ref<T> | ComputedRef<T>): T;
/**
 * Props resolver class for accessing props with fallback to parent or default values.
 * Provides a clean API similar to `props.get('name', 'default')`.
 */
export declare class PropsResolver {
    private props;
    private parent?;
    constructor(props: Record<string, unknown>, parent?: Record<string, unknown>);
    /**
     * Get prop value with fallback to parent value or default value.
     *
     * @param key - Property key to look up
     * @param defaultValue - Default value if neither prop nor parent has value
     * @returns The resolved value
     *
     * @example
     * ```typescript
     * const resolver = new PropsResolver(props, parentValue)
     * const parser = resolver.get('parser', defaultParser)
     * const hook = resolver.get('hook')
     * ```
     */
    get<T>(key: string, defaultValue?: T): T | undefined;
    /**
     * Check if prop value is defined (not undefined).
     *
     * @param key - Property key to check
     * @returns `true` if prop value is defined (not undefined), `false` otherwise
     */
    has(key: string): boolean;
}
