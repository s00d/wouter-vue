import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// Плагин для удаления всех комментариев из собранных файлов
const removeComments = () => ({
  name: 'remove-comments',
  generateBundle(_options, bundle) {
    for (const file in bundle) {
      const chunk = bundle[file]
      if (chunk.type === 'chunk') {
        // Удаляем все однострочные комментарии
        chunk.code = chunk.code.replace(/\/\/.*$/gm, '')
        // Удаляем многострочные комментарии
        chunk.code = chunk.code.replace(/\/\*[\s\S]*?\*\//g, '')
        // Удаляем JSDoc комментарии
        chunk.code = chunk.code.replace(/\/\*\*[\s\S]*?\*\//g, '')
        // Удаляем лишние пустые строки
        chunk.code = chunk.code.replace(/\n\s*\n\s*\n/g, '\n')
      }
    }
  },
})

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      rollupTypes: false,
      outDir: 'types',
    }),
  ],
  esbuild: {
    legalComments: 'none',
    drop: ['console', 'debugger'],
  },
  build: {
    minify: 'esbuild',
    lib: {
      entry: {
        index: 'src/index.ts',
        'use-browser-location': 'src/use-browser-location.ts',
        'use-hash-location': 'src/use-hash-location.ts',
        'memory-location': 'src/memory-location.ts',
        ssr: 'src/ssr.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['vue', 'path-to-regexp', 'mitt', 'fs', 'path'],
      plugins: [removeComments()],
      output: {
        dir: 'dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
        compact: true,
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
