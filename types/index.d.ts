import { ComputedRef } from 'vue';
import { Path } from '../types/location-hook.d.js';
import { HrefsFormatter, Parser, RouterObject, SsrContext } from '../types/router.d.js';
import { Ref } from 'vue';
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
export declare const useParams: () => Ref<RouteParams>;
export declare const useLocation: () => [ComputedRef<Path>, NavigateFn];
export declare const useSearch: () => ComputedRef<string>;
export declare const matchRoute: (parser: Parser, route: string | RegExp, path: Path, loose?: boolean) => MatchResult;
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
        default?: () => unknown;
    };
};
export declare const Router: {
    name: string;
    props: string[];
    setup(props: RouterProps, { slots }: SetupContext): () => unknown;
};
export declare function useSearchParams(): [ComputedRef<URLSearchParams>, SetSearchParamsFn];
export declare const Route: {
    name: string;
    props: string[];
    setup(props: any, { slots }: {
        slots: any;
    }): () => any;
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
    setup(props: SwitchProps, { slots }: SetupContext): () => import('vue').VNode<import('vue').RendererNode, import('vue').RendererElement, {
        [key: string]: any;
    }>;
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
    setup(props: RedirectProps): () => any;
};
