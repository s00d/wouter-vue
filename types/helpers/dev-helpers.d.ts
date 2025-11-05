/**
 * Development-related helper utilities for wouter-vue
 */
/**
 * Helper to check if we're in development mode.
 *
 * @returns `true` if running in development mode, `false` otherwise
 */
export declare function isDev(): boolean;
/**
 * Log development warning with component name prefix.
 *
 * @param componentName - Name of the component
 * @param message - Warning message
 */
export declare function devWarn(componentName: string, message: string): void;
