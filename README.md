# svelte-inline-compile-vite

Create svelte components on-the-fly using a vite-plugin and async imports under
the hood. Useful for writing unit tests using [Vitest](https://vitest.dev/).
Relies on your existing Vite configuration to apply any Svelte transforms.
Inspired by
[svelte-inline-compile](https://github.com/DockYard/svelte-inline-compile).

## Setup

Install using your package manager:

```sh
npm install svelte-inline-compile-vite
```

Add it to your vitest.config.js along with [vitest-svelte-kit](https://github.com/nickbreaton/vitest-svelte-kit)

```js
// file: vitest.config.js
import { defineConfig } from 'vitest/config';
import { extractFromSvelteConfig } from 'vitest-svelte-kit';
import { SvelteInlineCompile } from 'svelte-inline-compile-vite';

export default defineConfig(async () => {
  const config = await extractFromSvelteConfig();
  return {
    ...config,
    plugins: [
      ...config.plugins,
      SvelteInlineCompile()
    ],
    test: {
      environment: 'jsdom'
    }
  };
})
```

## Usage

Import the `svelte` function and pass it your svelte component template as a
string or tagged template literal. It returns a promise, representing the pending
dynamic import, which you need to await.

Check it out in a test:

```js
import { it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { svelte } from 'svelte-inline-compile-vite';

it('renders a svelte component', async () => {
  render(await svelte`
    <div>hello world</div>
  `);
  screen.getByText('hello world');
})
```

## With SvelteKit

This doesn't seem to work with SvelteKit for a couple reasons:

1. Rollup has a hard time [code-splitting dynamic imports](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations)
2. Browsers can't use any node.js APIs
