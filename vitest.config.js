import { defineConfig } from 'vitest/config';
import { SvelteInlineCompile } from './index.js';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(() => {
  return {
    plugins: [
      svelte({
        extensions: ['.svelte'],
        compilerOptions: {
          hydratable: false,
        }
      }),
      SvelteInlineCompile(),
    ],
    test: {
      environment: 'jsdom',
    }
  }
});
