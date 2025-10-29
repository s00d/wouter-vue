import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig([
  {
    input: ['src/vue-deps.ts'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
      }),
    ],
    output: {
      dir: 'esm',
      format: 'esm',
    },
    external: ['vue'],
  },
  {
    input: [
      'src/index.ts',
      'src/use-browser-location.ts',
      'src/use-hash-location.ts',
      'src/memory-location.ts',
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
      }),
    ],
    external: [/vue-deps/, 'regexparam', 'mitt'],
    output: {
      dir: 'esm',
      format: 'esm',
    },
  },
]);
