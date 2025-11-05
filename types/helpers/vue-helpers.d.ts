import { ComputedRef, Ref } from 'vue';
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
