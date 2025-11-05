/**
 * Path-related helper utilities for wouter-vue
 */
/**
 * Normalize path for comparison by removing query params and hash.
 * Used for link active state detection.
 *
 * @param path - The path to normalize
 * @returns Normalized path string
 */
export declare function normalizePath(path: string): string;
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
