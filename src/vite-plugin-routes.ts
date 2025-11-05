/**
 * Vite plugin to generate static routes at build time
 * This avoids dynamic imports and keeps the main bundle small
 */

import { readdirSync, writeFileSync } from 'fs'
import { dirname, relative, resolve } from 'path'
import type { Plugin, ResolvedConfig } from 'vite'

/**
 * Options for the vite-plugin-routes plugin
 */
export interface RoutePluginOptions {
  /**
   * Unique name for the router (used for aliases and chunks)
   * @default 'routes'
   */
  name?: string
  /**
   * Directory containing route files
   * @default 'src/pages/routes'
   */
  dir?: string
  /**
   * Regex pattern to match files
   * @default /Route(\d+)\.vue$/
   */
  pattern?: RegExp
  /**
   * Path to generated output file
   * @default 'src/generated-routes.js'
   */
  outputFile?: string
  /**
   * Function to generate route path from regex matches
   * @default (match) => `/route${match[1]}`
   */
  pathTemplate?: (match: RegExpMatchArray) => string
  /**
   * Name for manualChunks
   * @default same as name
   */
  chunkName?: string
  /**
   * Whether to minify output (remove line breaks)
   * @default true
   */
  minify?: boolean
  /**
   * Project root directory (auto-detected)
   */
  rootDir?: string
  /**
   * Whether to compress routes using templates (reduces file size)
   * @default true
   */
  compress?: boolean
}

interface RouteData {
  match: RegExpMatchArray
  path: string
  file: string
}

interface RouteWithPath extends RouteData {
  relPath: string
}

interface RoutesConfig {
  outputFile: string
  count: number
  chunkName: string
  routesDir: string
}

interface ManualChunksInfo {
  routesDir: string
  outputFile: string
  chunkName: string
}

/**
 * Extract template for route paths
 */
function extractPathTemplate(paths: string[]): string {
  if (!paths.length) return ''

  // Check if all paths follow a pattern like /route1, /route2, etc.
  const first = paths[0]
  const match = first.match(/^(.*?)\d+$/)

  if (match && paths.every((p) => /^\D+\d+$/.test(p))) {
    return `${match[1]}\${n}`
  }

  return paths[0]
}

/**
 * Vite plugin to generate static routes at build time
 * This avoids dynamic imports and keeps the main bundle small
 *
 * @param options - Plugin configuration options
 * @returns Vite plugin object
 */
export function vitePluginRoutes(options: RoutePluginOptions = {}): Plugin {
  // Get root directory (nearest package.json)
  const rootDir = options.rootDir || __dirname
  const pluginName = options.name || 'routes'

  // Resolve paths relative to rootDir
  const routesDir = resolve(rootDir, options.dir || 'src/pages/routes')
  const outputFile = resolve(rootDir, options.outputFile || 'src/generated-routes.js')
  const pattern = options.pattern || /Route(\d+)\.vue$/
  const pathTemplate = options.pathTemplate || ((match: RegExpMatchArray) => `/route${match[1]}`)
  const chunkName = options.chunkName || pluginName
  const minify = options.minify !== undefined ? options.minify : true
  const compress = options.compress !== undefined ? options.compress : true

  let routesConfig: RoutesConfig | null = null

  // Store these for use in resolveId
  const pluginInstance: Plugin = {
    name: `vite-plugin-routes:${pluginName}`,

    buildStart() {
      // Generate routes during build start
      const files = readdirSync(routesDir).filter((f) => pattern.test(f))

      // Extract route data from files using the pattern
      const routesData = files
        .map((file): RouteData | null => {
          const match = file.match(pattern)
          if (match) {
            const path = pathTemplate(match)
            return { match, path, file }
          }
          return null
        })
        .filter((r): r is RouteData => r !== null)
        .sort((a, b) => {
          // Try numeric sort if possible, otherwise lexicographic
          const aNum = parseInt(a.match[1], 10)
          const bNum = parseInt(b.match[1], 10)
          if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
            return aNum - bNum
          }
          return a.file.localeCompare(b.file)
        })

      // Calculate relative paths for all routes
      const routesWithPaths: RouteWithPath[] = routesData.map(({ path, file, match }) => {
        const routeFilePath = resolve(routesDir, file)
        const outputDir = dirname(outputFile)

        let relPath = relative(outputDir, routeFilePath)
        relPath = relPath.replace(/\\/g, '/')

        if (!relPath.startsWith('.')) {
          relPath = `./${relPath}`
        }

        return { path, relPath, match, file }
      })

      // Generate routes file content with compression
      let content: string

      if (compress && routesData.length > 0) {
        // Check if we can compress (numeric routes)
        const routeNums = routesWithPaths.map((r) => {
          const num = parseInt(r.match[1], 10)
          return Number.isNaN(num) ? null : num
        })

        // Check if all paths and route names follow numeric patterns
        const allPathsNumeric = routesWithPaths.every((r) => /^\D+\d+$/.test(r.path))
        const allFilePathsPatterned = routesWithPaths.every((r) => {
          const nameMatch = r.match?.[1]
          return nameMatch && /^\d+$/.test(nameMatch)
        })

        const canCompress =
          routeNums.every((n) => n !== null) && allPathsNumeric && allFilePathsPatterned

        if (canCompress) {
          // Compressed mode: generate compact code with static imports
          // Extract path template for routes
          const routePathPattern = extractPathTemplate(routesWithPaths.map((r) => r.path))

          // Generate individual import statements for each route
          const imports = routesWithPaths.map((r) => {
            const num = parseInt(r.match[1], 10)
            return `const r${num}=()=>import('${r.relPath}')`
          })

          // Generate compressed array using the route numbers and template
          const routesArray = routeNums
            .map((n) => `{path:'${routePathPattern}'.replace(/\${n}/g,${n}),component:r${n}}`)
            .join(',')

          // Combine everything
          content = `// Auto-generated routes file - DO NOT EDIT MANUALLY
${imports.join(';')};
export default [${routesArray}];`
        } else {
          // Can't compress, use regular mode
          const routeStrings = routesWithPaths.map(
            (r) => `{ path: '${r.path}', component: () => import('${r.relPath}') }`
          )
          const joiner = minify ? ',' : ',\n  '
          const indent = minify ? '' : '  '

          content = minify
            ? `// Auto-generated routes file - DO NOT EDIT MANUALLY\nexport default [${routeStrings.join(joiner)}].map(r => ({ ...r, component: () => r.component() }));\n`
            : `// Auto-generated routes file - DO NOT EDIT MANUALLY\nexport default [\n${indent}${routeStrings.join(joiner)}\n].map(r => ({\n  ...r,\n  component: () => r.component()\n}));\n`
        }
      } else {
        // Non-compressed mode
        const routeStrings = routesWithPaths.map(
          (r) => `{ path: '${r.path}', component: () => import('${r.relPath}') }`
        )
        const joiner = minify ? ',' : ',\n  '
        const indent = minify ? '' : '  '

        content = minify
          ? `// Auto-generated routes file - DO NOT EDIT MANUALLY\nexport default [${routeStrings.join(joiner)}].map(r => ({ ...r, component: () => r.component() }));\n`
          : `// Auto-generated routes file - DO NOT EDIT MANUALLY\nexport default [\n${indent}${routeStrings.join(joiner)}\n].map(r => ({\n  ...r,\n  component: () => r.component()\n}));\n`
      }

      // Write the routes file
      writeFileSync(outputFile, content)

      routesConfig = { outputFile, count: routesData.length, chunkName, routesDir }
    },

    resolveId(source: string): string | undefined {
      // Handle alias imports like #routes/generated-routes.js
      if (source.startsWith(`#${pluginName}/`)) {
        // Extract the file path after the alias
        const filePath = source.replace(`#${pluginName}/`, '')
        // Get the directory of outputFile and resolve the file
        const outputDir = dirname(outputFile)
        const resolvedPath = resolve(outputDir, filePath)
        return resolvedPath
      }
      return undefined
    },

    config(config, { command: _command }) {
      // Register manualChunks if not already configured
      if (!config.build) config.build = {}
      if (!config.build.rollupOptions) config.build.rollupOptions = {}
      
      const output = config.build.rollupOptions.output
      if (!output || Array.isArray(output)) {
        config.build.rollupOptions.output = {}
      }
      
      const outputOptions = Array.isArray(output) ? undefined : output
      const existingManualChunks = outputOptions?.manualChunks
      
      if (!existingManualChunks || typeof existingManualChunks !== 'function') {
        // Store our chunker logic for later use
        if (outputOptions) {
          // @ts-expect-error - temporary storage for configResolved
          outputOptions.manualChunksInfo = {
            routesDir,
            outputFile,
            chunkName,
          } as ManualChunksInfo
        }
      }
    },

    configResolved(config: ResolvedConfig) {
      if (routesConfig) {
        console.log(
          `[vite-plugin-routes:${pluginName}] Generated ${routesConfig.count} routes in ${routesConfig.outputFile}`
        )
      }

      // Setup manualChunks if we stored info in config
      const outputOptions = config.build?.rollupOptions?.output
      if (!outputOptions || Array.isArray(outputOptions)) {
        return
      }

      const manualChunksInfo = (outputOptions as {
        manualChunksInfo?: ManualChunksInfo
      })?.manualChunksInfo

      if (manualChunksInfo) {
        const info = manualChunksInfo

        // If there's no manualChunks function yet, create one
        if (!outputOptions.manualChunks) {
          outputOptions.manualChunks = (id: string) => {
            // Group generated routes file into its own chunk
            const outputFileName = info.outputFile.replace(/\\/g, '/').split('/').pop()
            if (outputFileName && id.includes(outputFileName)) {
              return `${info.chunkName}-config`
            }

            // Group all route components together into named chunk
            const routesDirNormalized = info.routesDir.replace(/\\/g, '/')
            if (id.replace(/\\/g, '/').includes(routesDirNormalized)) {
              return info.chunkName
            }
            return undefined
          }
        }

        // Clean up temporary info
        delete (outputOptions as { manualChunksInfo?: ManualChunksInfo }).manualChunksInfo
      }
    },

    // Export helper function for manualChunks
    // @ts-expect-error - custom property not in Plugin type
    createManualChunks() {
      return (id: string): string | undefined => {
        if (!routesConfig) return undefined

        // Group generated routes file into its own chunk
        const outputFileName = routesConfig.outputFile.replace(/\\/g, '/').split('/').pop()
        if (outputFileName && id.includes(outputFileName)) {
          return `${routesConfig.chunkName}-config`
        }

        // Group all route components together into named chunk
        const routesDirNormalized = routesConfig.routesDir.replace(/\\/g, '/')
        if (id.replace(/\\/g, '/').includes(routesDirNormalized)) {
          return routesConfig.chunkName
        }
        return undefined
      }
    },
  }

  return pluginInstance
}

/**
 * Helper function to create manualChunks configuration for multiple route plugins
 * @param plugins - Route plugin instances
 * @returns manualChunks function
 */
export function createManualChunks(...plugins: Plugin[]): (id: string) => string | undefined {
  const chunkers = plugins
    .map((p) => (p as { createManualChunks?: () => (id: string) => string | undefined }).createManualChunks?.())
    .filter((chunker): chunker is (id: string) => string | undefined => Boolean(chunker))

  return (id: string): string | undefined => {
    for (const chunker of chunkers) {
      const result = chunker(id)
      if (result) return result
    }
    return undefined
  }
}

