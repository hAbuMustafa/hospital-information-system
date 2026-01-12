import adapter from '@sveltejs/adapter-auto';
import type { Config } from '@sveltejs/kit';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config: Config = {
  preprocess: vitePreprocess(),
  vitePlugin: { inspector: { toggleKeyCombo: 'control-alt-shift-x' } },

  kit: {
    adapter: adapter(),
    alias: {
      $server: './src/lib/server',
    },
  },
};

export default config;
