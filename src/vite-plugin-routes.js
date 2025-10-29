import { readdirSync, writeFileSync } from 'fs'
import { dirname, relative, resolve } from 'path'

/**
 * @typedef {Object} RoutePluginOptions
 * @property {string} [name='routes'] - Unique name for the router (used for aliases and chunks)
 * @property {string} [dir] - Directory containing route files (default: 'src/pages/routes')
 * @property {RegExp} [pattern] - Regex pattern to match files (default: /Route(\d+)\.vue$/)
 * @property {string} [outputFile] - Path to generated output file (default: 'src/generated-routes.js')
 * @property {(match: any[]) => string} [pathTemplate] - Function to generate route path from matches
 * @property {string} [chunkName] - Name for manualChunks (default: same as name)
 * @property {boolean} [minify=true] - Whether to minify output (remove line breaks)
 * @property {string} [rootDir] - Project root directory (auto-detected)
 * @property {boolean} [compress=true] - Whether to compress routes using templates (reduces file size)
 */

/**
 * Helper function to find common prefix in an array of strings
 */
function findCommonPrefix(strings) {
  if (!strings.length) return ''
  let prefix = strings[0]
  for (let i = 1; i < strings.length; i++) {
    while (strings[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1)
      if (!prefix) return ''
    }
  }
  return prefix
}

/**
 * Helper function to find path pattern
 */
function _findPathPattern(paths) {
  if (!paths.length) return ''
  // Check if all paths follow the same pattern like /route1, /route2, etc.
  const first = paths[0]
  const isNumeric = /\/route\d+$/.test(first)
  if (isNumeric && paths.every((p) => /^\/route\d+$/.test(p))) {
    return `/route${n}`
  }
  return first
}

/**
 * Extract common path pattern from file paths
 */
function _extractPathPattern(paths) {
  if (!paths.length) return { prefix: '', suffix: '', pattern: '' }

  // Find common prefix and suffix
  const prefix = findCommonPrefix(paths)
  const suffix = findCommonSuffix(paths)

  // Extract the pattern (everything between prefix and suffix)
  // Example: ./pages/routes/Route1.vue -> ./pages/routes/Route + 1 + .vue
  const firstPath = paths[0]
  const withoutPrefix = firstPath.slice(prefix.length)
  const withoutSuffix = withoutPrefix.slice(0, -suffix.length)

  return { prefix, suffix, pattern: withoutSuffix }
}

/**
 * Find common suffix in an array of strings
 */
function findCommonSuffix(strings) {
  if (!strings.length) return ''
  if (strings.length === 1) return strings[0]

  // Reverse strings to find common suffix
  const reversed = strings.map((s) => s.split('').reverse().join(''))
  const commonPrefixReverse = findCommonPrefix(reversed)

  return commonPrefixReverse.split('').reverse().join('')
}

/**
 * Extract template for route paths
 */
function extractPathTemplate(paths) {
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
 * @param {RoutePluginOptions} options - Plugin configuration options
 * @returns {Object} Vite plugin object
 */
export function vitePluginRoutes(options = {}) {
  // Get root directory (nearest package.json)
  const rootDir = options.rootDir || __dirname
  const pluginName = options.name || 'routes'

  // Resolve paths relative to rootDir
  const routesDir = resolve(rootDir, options.dir || 'src/pages/routes')
  const outputFile = resolve(rootDir, options.outputFile || 'src/generated-routes.js')
  const pattern = options.pattern || /Route(\d+)\.vue$/
  const pathTemplate = options.pathTemplate || ((match) => `/route${match[1]}`)
  const chunkName = options.chunkName || pluginName
  const minify = options.minify !== undefined ? options.minify : true
  const compress = options.compress !== undefined ? options.compress : true

  let routesConfig = null

  // Store these for use in resolveId
  const pluginInstance = {
    name: `vite-plugin-routes:${pluginName}`,

    buildStart() {
      // Generate routes during build start
      const files = readdirSync(routesDir).filter((f) => pattern.test(f))

      // Extract route data from files using the pattern
      const routesData = files
        .map((file) => {
          const match = file.match(pattern)
          if (match) {
            const path = pathTemplate(match)
            return { match, path, file }
          }
          return null
        })
        .filter(Boolean)
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
      const routesWithPaths = routesData.map(({ path, file, match }) => {
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
      let content

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
            .map((n) => `{path:'${routePathPattern}'.replace(/\${n}/g,n),component:r${n}}`)
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

    resolveId(source) {
      // Handle alias imports like #routes/generated-routes.js
      if (source.startsWith(`#${pluginName}/`)) {
        // Extract the file path after the alias
        const filePath = source.replace(`#${pluginName}/`, '')
        // Get the directory of outputFile and resolve the file
        const outputDir = dirname(outputFile)
        const resolvedPath = resolve(outputDir, filePath)
        return resolvedPath
      }
    },

    config(config, { command: _command }) {
      // Register manualChunks if not already configured
      if (!config.build) config.build = {}
      if (!config.build.rollupOptions) config.build.rollupOptions = {}
      if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {}

      const existingManualChunks = config.build.rollupOptions.output.manualChunks
      if (!existingManualChunks || typeof existingManualChunks !== 'function') {
        // Store our chunker logic for later use
        config.build.rollupOptions.output.manualChunksInfo = {
          routesDir,
          outputFile,
          chunkName,
        }
      }
    },

    configResolved(config) {
      if (routesConfig) {
        console.log(
          `[vite-plugin-routes:${pluginName}] Generated ${routesConfig.count} routes in ${routesConfig.outputFile}`
        )
      }

      // Setup manualChunks if we stored info in config
      if (config.build?.rollupOptions?.output?.manualChunksInfo) {
        const info = config.build.rollupOptions.output.manualChunksInfo

        // If there's no manualChunks function yet, create one
        if (!config.build.rollupOptions.output.manualChunks) {
          config.build.rollupOptions.output.manualChunks = (id) => {
            // Group generated routes file into its own chunk
            const outputFileName = info.outputFile.replace(/\\/g, '/').split('/').pop()
            if (id.includes(outputFileName)) {
              return `${info.chunkName}-config`
            }

            // Group all route components together into named chunk
            const routesDirNormalized = info.routesDir.replace(/\\/g, '/')
            if (id.replace(/\\/g, '/').includes(routesDirNormalized)) {
              return info.chunkName
            }
          }
        }

        // Clean up temporary info
        delete config.build.rollupOptions.output.manualChunksInfo
      }
    },

    // Export helper function for manualChunks
    createManualChunks() {
      return (id) => {
        if (!routesConfig) return

        // Group generated routes file into its own chunk
        const outputFileName = routesConfig.outputFile.replace(/\\/g, '/').split('/').pop()
        if (id.includes(outputFileName)) {
          return `${routesConfig.chunkName}-config`
        }

        // Group all route components together into named chunk
        const routesDirNormalized = routesConfig.routesDir.replace(/\\/g, '/')
        if (id.replace(/\\/g, '/').includes(routesDirNormalized)) {
          return routesConfig.chunkName
        }
      }
    },
  }

  return pluginInstance
}

/**
 * Helper function to create manualChunks configuration for multiple route plugins
 * @param {...Object} plugins - Route plugin instances
 * @returns {Function} manualChunks function
 */
export function createManualChunks(...plugins) {
  const chunkers = plugins.map((p) => p.createManualChunks?.()).filter(Boolean)

  return (id) => {
    for (const chunker of chunkers) {
      const result = chunker(id)
      if (result) return result
    }
  }
}
