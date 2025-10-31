import { Path } from '../types/location-hook.d.js';
import { HrefsFormatter, Parser, RouterObject, SsrContext } from '../types/router.d.js';
import { MatchResult } from './index.js';
type SetupContext = {
    slots: {
        default?: (() => unknown) | ((params: unknown) => unknown);
    };
};
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
export declare const Router: {
    name: string;
    props: string[];
    setup(props: RouterProps, { slots }: SetupContext): () => unknown;
};
/**
 * Normalize path for comparison by removing query params and hash.
 * Used for link active state detection.
 */
declare function normalizePath(path: string): string;
export { normalizePath };
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
