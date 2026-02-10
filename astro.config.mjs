// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://radekdobrovolny.github.io',
  base: process.env.NODE_ENV === 'production' ? '/hejnice' : '/',
  output: 'static',
});
