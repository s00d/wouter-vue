import { Plugin } from 'vite';
/**
 * Options for the vite-plugin-routes plugin
 */
export interface RoutePluginOptions {
    /**
     * Unique name for the router (used for aliases and chunks)
     * @default 'routes'
     */
    name?: string;
    /**
     * Directory containing route files
     * @default 'src/pages/routes'
     */
    dir?: string;
    /**
     * Regex pattern to match files
     * @default /Route(\d+)\.vue$/
     */
    pattern?: RegExp;
    /**
     * Path to generated output file
     * @default 'src/generated-routes.js'
     */
    outputFile?: string;
    /**
     * Function to generate route path from regex matches
     * @default (match) => `/route${match[1]}`
     */
    pathTemplate?: (match: RegExpMatchArray) => string;
    /**
     * Name for manualChunks
     * @default same as name
     */
    chunkName?: string;
    /**
     * Whether to minify output (remove line breaks)
     * @default true
     */
    minify?: boolean;
    /**
     * Project root directory (auto-detected)
     */
    rootDir?: string;
    /**
     * Whether to compress routes using templates (reduces file size)
     * @default true
     */
    compress?: boolean;
}
/**
 * Vite plugin to generate static routes at build time
 * This avoids dynamic imports and keeps the main bundle small
 *
 * @param options - Plugin configuration options
 * @returns Vite plugin object
 */
export declare function vitePluginRoutes(options?: RoutePluginOptions): Plugin;
/**
 * Helper function to create manualChunks configuration for multiple route plugins
 * @param plugins - Route plugin instances
 * @returns manualChunks function
 */
export declare function createManualChunks(...plugins: Plugin[]): (id: string) => string | undefined;
