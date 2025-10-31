import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

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
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'use-browser-location': 'src/use-browser-location.ts',
        'use-hash-location': 'src/use-hash-location.ts',
        'memory-location': 'src/memory-location.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['vue', 'regexparam', 'mitt', 'fs', 'path'],
      output: {
        dir: 'dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
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
