import { ComputedRef, Ref } from 'vue';
import { Path } from '../types/location-hook.d.js';
import { HrefsFormatter, Parser, RouterObject, SsrContext } from '../types/router.d.js';
export type { RouterObject, SsrContext, Parser, HrefsFormatter };
export type RouteParams = Record<string, string>;
export type MatchResult = [true, RouteParams, string?] | [false, null];
export type NavigateFn = (path: Path, options?: {
    replace?: boolean;
    state?: unknown;
}) => void;
export type SetSearchParamsFn = (nextInit: URLSearchParams | Record<string, string> | ((params: URLSearchParams) => URLSearchParams), options?: {
    replace?: boolean;
    state?: unknown;
}) => void;
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
 * @param parser - The route parser function (from regexparam or custom)
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
type RouterProps = {
    hook?: RouterObject['hook'];
    searchHook?: RouterObject['searchHook'];
    base?: Path;
    parser?: Parser;
    ssrPath?: Path;
    ssrSearch?: Path;
    ssrContext?: SsrContext;
    hrefs?: HrefsFormatter;
};
type SetupContext = {
    slots: {
        default?: (() => unknown) | ((params: unknown) => unknown);
    };
};
export declare const Router: {
    name: string;
    props: string[];
    setup(props: RouterProps, { slots }: SetupContext): () => unknown;
};
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
type RouteProps = {
    path?: string | RegExp;
    component?: unknown;
    nest?: unknown;
    match?: MatchResult;
};
export declare const Route: {
    name: string;
    props: string[];
    setup(props: RouteProps, { slots }: SetupContext): () => unknown;
};
type LinkProps = {
    href?: string;
    to?: string;
    onClick?: (event: MouseEvent) => void;
    asChild?: boolean;
    classFn?: (isActive: boolean) => string;
    className?: string;
    replace?: boolean;
};
export declare const Link: {
    name: string;
    props: {
        href: StringConstructor;
        to: StringConstructor;
        onClick: FunctionConstructor;
        asChild: BooleanConstructor;
        classFn: FunctionConstructor;
        className: StringConstructor;
        replace: BooleanConstructor;
    };
    inheritAttrs: boolean;
    setup(props: LinkProps, { slots, attrs }: SetupContext & {
        attrs?: Record<string, unknown>;
    }): () => import('vue').VNode<import('vue').RendererNode, import('vue').RendererElement, {
        [key: string]: any;
    }>;
};
type SwitchProps = {
    location?: Path;
};
export declare const Switch: {
    name: string;
    props: string[];
    setup(props: SwitchProps, { slots }: SetupContext): () => unknown;
};
type RedirectProps = {
    to?: Path;
    href?: Path;
    replace?: boolean;
    state?: unknown;
};
export declare const Redirect: {
    name: string;
    props: string[];
    setup(props: RedirectProps): () => null;
};
