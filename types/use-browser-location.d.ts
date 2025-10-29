import { Ref } from './vue-deps.js';
type Path = string;
type SearchString = string;
type Primitive = string | number | bigint | boolean | null | undefined | symbol;
export declare function useLocationProperty<S extends Primitive>(fn: () => S, ssrFn?: () => S): Ref<S>;
export declare const useSearch: ({ ssrSearch, }?: {
    ssrSearch?: SearchString;
}) => Ref<SearchString>;
export declare const usePathname: ({ ssrPath }?: {
    ssrPath?: Path;
}) => Ref<Path>;
export declare const useHistoryState: <T = unknown>() => Ref<T>;
export declare const navigate: <S = unknown>(to: string | URL, { replace, state }?: {
    replace?: boolean;
    state?: S | null;
}) => void;
export declare const useBrowserLocation: ({ ssrPath, }?: {
    ssrPath?: Path;
}) => [Ref<Path>, typeof navigate];
export {};
