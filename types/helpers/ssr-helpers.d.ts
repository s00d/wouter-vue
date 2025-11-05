/**
 * SSR-related helper utilities for wouter-vue
 */
/**
 * Parse SSR path to extract path and search string.
 *
 * @param ssrPath - SSR path string (may contain ? for search params)
 * @returns Object with path and search separated
 */
export declare function parseSsrPath(ssrPath?: string): {
    path?: string;
    search?: string;
};
/**
 * Check if running in SSR environment.
 *
 * @returns `true` if running on server, `false` if in browser
 */
export declare function isSSR(): boolean;
/**
 * Check if running in browser environment.
 *
 * @returns `true` if running in browser, `false` if in SSR
 */
export declare function isBrowser(): boolean;
