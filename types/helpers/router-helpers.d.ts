import { ComputedRef } from 'vue';
import { RouterObject } from '../../types';
import { RouterRef } from '../index';
/**
 * Get router value as computed ref for reactive access.
 *
 * @param router - Router reference (can be object, ref, computed ref, or function)
 * @returns ComputedRef of RouterObject
 */
export declare function useRouterValue(router: RouterRef): ComputedRef<RouterObject>;
/**
 * Get router value synchronously (for SSR context access).
 * Handles function, ref, and direct object cases.
 *
 * @param router - Router reference (can be object, ref, computed ref, or function)
 * @returns RouterObject value
 */
export declare function getRouterValue(router: RouterRef): RouterObject;
