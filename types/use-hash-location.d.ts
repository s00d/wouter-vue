import { Ref } from './vue-deps.js';
type Path = string;
export declare const navigate: <S = unknown>(to: Path, { state, replace }?: {
    state?: S | null;
    replace?: boolean;
}) => void;
export declare const useHashLocation: ({ ssrPath, }?: {
    ssrPath?: Path;
}) => [Ref<Path>, typeof navigate];
export {};
