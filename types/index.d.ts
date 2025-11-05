import { ComputedRef, Ref } from 'vue';
import { Path } from '../types/location-hook';
import { HrefsFormatter, Parser, RouterObject, SsrContext } from '../types';
export type { RouterObject, SsrContext, Parser, HrefsFormatter };
export type RouteParams = Record<string, string>;
export type RouteData = {
    [key: string]: RouteDataValue;
};
export type RouteDataValue = string | number | boolean | null | undefined | RouteDataValue[] | {
    [key: string]: RouteDataValue;
};
export type RouteDataInput = RouteData | Ref<RouteData> | ComputedRef<RouteData>;
export type MatchResult = [true, RouteParams, string?] | [false, null];
export type NavigateFn = (path: Path, options?: {
    replace?: boolean;
    state?: unknown;
}) => void;
export type SetSearchParamsFn = (nextInit: URLSearchParams | Record<string, string> | ((params: URLSearchParams) => URLSearchParams), options?: {
    replace?: boolean;
    state?: unknown;
}) => void;
export type RouterRef = RouterObject | Ref<RouterObject> | ComputedRef<RouterObject> | ((...args: unknown[]) => RouterObject);
/**
 * Type guard to check if a value is a Ref-like object.
 */
export declare const isRefLike: (value: unknown) => value is Ref<RouterObject> | ComputedRef<RouterObject>;
/**
 * Type guard to check if a value is a function that returns RouterObject.
 */
export declare const isRouterFunction: (value: unknown) => value is () => RouterObject;
/**
 * Normalizes RouterRef to RouterObject by unwrapping refs and calling functions.
 *
 * @param router - The router reference (can be object, ref, computed ref, or function)
 * @returns The unwrapped RouterObject
 */
export declare const normalizeRouterRef: (router: RouterRef) => RouterObject;
/**
 * Normalizes Vue boolean props (boolean shorthand support).
 *
 * Returns `true` if value is empty string (`''`) or `true`, `false` otherwise.
 * This handles Vue's boolean prop shorthand: `<Component prop />` results in `prop=""` on vnode.
 *
 * @param value - The prop value to normalize (can be `''`, `true`, `false`, or `undefined`)
 * @returns `true` if the prop should be considered enabled, `false` otherwise
 *
 * @example
 * ```typescript
 * normalizeBooleanProp('')  // true
 * normalizeBooleanProp(true) // true
 * normalizeBooleanProp(false) // false
 * normalizeBooleanProp(undefined) // false
 * ```
 */
export declare const normalizeBooleanProp: (value: unknown) => boolean;
export declare const defaultRouter: RouterObject;
export declare const RouterKey: unique symbol;
export declare const ParamsKey: unique symbol;
export declare const RouteDataKey: unique symbol;
export declare const useRouter: () => RouterObject;
/**
 * Hook to access route parameters from the current matched route.
 *
 * Works inside `<Route>` components and returns parameters from the innermost matched route.
 * Automatically merges parameters from parent nested routes.
 *
 * @returns `Ref<RouteParams>` - Object with route parameter keys mapped to string values
 *
 * @example
 * ```typescript
 * // For route path="/users/:userId/posts/:postId"
 * const params = useParams()
 * console.log(params.value.userId)  // '123'
 * console.log(params.value.postId)  // '456'
 * ```
 */
export declare const useParams: () => Ref<RouteParams>;
/**
 * Hook to access route data from the current matched route.
 *
 * Works inside `<Route>` components and returns data from the innermost matched route.
 * Automatically merges data from parent routes.
 *
 * @returns `Ref<RouteData>` - Reactive reference to route data object
 *
 * @example
 * ```typescript
 * const routeData = useRouteData()
 * console.log(routeData.value.theme)  // 'dark'
 * console.log(routeData.value.layout)  // 'sidebar'
 * ```
 */
export declare const useRouteData: () => Ref<RouteData>;
/**
 * Internal version of useLocation to avoid redundant useRouter calls.
 * Optimized to use type guards for better performance.
 */
export declare const useLocationFromRouter: (router: RouterRef) => [ComputedRef<Path>, NavigateFn];
/**
 * Reactive location hook that returns the current path and a navigate function.
 *
 * The location ref automatically updates when the URL changes (through navigation or browser back/forward).
 *
 * @returns A tuple of `[location, navigate]` where:
 *   - `location`: `ComputedRef<Path>` - Current pathname (relative to router base if nested)
 *   - `navigate`: `NavigateFn` - Function to programmatically navigate
 *
 * @example
 * ```typescript
 * const [location, navigate] = useLocation()
 *
 * // Access current path
 * console.log(location.value) // '/current/path'
 *
 * // Navigate programmatically
 * navigate('/about')
 * navigate('/users/123', { replace: true })
 * ```
 */
export declare const useLocation: () => [ComputedRef<Path>, NavigateFn];
/**
 * Reactive search string hook (query string).
 *
 * Returns the current search string (query string) from the URL.
 * Automatically updates when URL search parameters change.
 *
 * @returns `ComputedRef<string>` - Raw query string (e.g., `'foo=bar&page=2'`)
 *
 * @example
 * ```typescript
 * const search = useSearch()
 * console.log(search.value) // 'foo=bar&page=2'
 * ```
 */
export declare const useSearch: () => ComputedRef<string>;
/**
 * Matches a route pattern against a path and extracts parameters.
 *
 * @param parser - The route parser function (from path-to-regexp adapter or custom)
 * @param route - The route pattern to match (string or RegExp)
 * @param path - The current path to match against
 * @param loose - If `true`, enables loose matching mode for nested routes (extracts base path)
 * @returns A tuple: `[true, RouteParams, base?]` on match, `[false, null]` on no match
 *
 * @example
 * ```typescript
 * const [matched, params, base] = matchRoute(parsePattern, '/users/:id', '/users/123')
 * // matched: true, params: { id: '123' }, base: undefined
 *
 * const [matched, params, base] = matchRoute(parsePattern, '/users/:id', '/users/123/posts', true)
 * // matched: true, params: { id: '123' }, base: '/users/123'
 * ```
 */
export declare const matchRoute: (parser: Parser, route: string | RegExp, path: Path, loose?: boolean) => MatchResult;
/**
 * Reactive route matching hook.
 *
 * Returns computed refs that automatically update when the location changes.
 * The first ref indicates if the route matches, the second contains the extracted parameters.
 *
 * @param pattern - Route pattern to match (string like `/users/:id` or RegExp)
 * @returns A tuple of `[matches, params]` where:
 *   - `matches`: `ComputedRef<boolean>` - `true` if location matches the pattern
 *   - `params`: `ComputedRef<RouteParams | null>` - Extracted route parameters or `null` if no match
 *
 * @example
 * ```typescript
 * const [matches, params] = useRoute('/users/:id')
 *
 * if (matches.value) {
 *   console.log('User ID:', params.value?.id) // '123'
 * }
 * ```
 */
export declare const useRoute: (pattern: string | RegExp) => [ComputedRef<boolean>, ComputedRef<RouteParams | null>];
export { Router, Route, Link, Switch, AnimatedSwitch, Redirect, } from './components/index';
export { normalizePath } from './helpers/path-helpers';
/**
 * Hook to access and manipulate URL search parameters reactively.
 *
 * Returns a reactive `URLSearchParams` object and a setter function.
 * The searchParams ref automatically updates when URL search parameters change.
 *
 * @returns A tuple of `[searchParams, setSearchParams]` where:
 *   - `searchParams`: `ComputedRef<URLSearchParams>` - Reactive URLSearchParams object
 *   - `setSearchParams`: `SetSearchParamsFn` - Function to update search params
 *
 * @example
 * ```typescript
 * const [searchParams, setSearchParams] = useSearchParams()
 *
 * // Read params
 * const page = searchParams.value.get('page') // '2'
 *
 * // Update params
 * setSearchParams({ page: '3', sort: 'asc' })
 *
 * // Functional update
 * setSearchParams(prev => {
 *   prev.set('page', '5')
 *   return prev
 * }, { replace: true })
 * ```
 */
export declare function useSearchParams(): [ComputedRef<URLSearchParams>, SetSearchParamsFn];
