import { Ref } from 'vue';
type Path = string;
type SearchString = string;
interface MemoryLocationOptions {
    path?: Path;
    searchPath?: SearchString;
    static?: boolean;
    record?: boolean;
}
type NavigateFn = (path: Path, options?: {
    replace?: boolean;
}) => void;
/**
 * In-memory location that supports navigation
 */
export declare const memoryLocation: ({ path, searchPath, static: staticLocation, record, }?: MemoryLocationOptions) => {
    hook: () => [Ref<Path>, NavigateFn];
    searchHook: () => Ref<SearchString>;
    navigate: NavigateFn;
    history: string[] | undefined;
    reset: (() => void) | undefined;
};
export {};
