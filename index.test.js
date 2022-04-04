import { it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { svelte } from './index.js';

it('renders a svelte component', async () => {
  render(await svelte`
    <div>hello world</div>
  `)
  screen.getByText('hello world');
});
