import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  dts: true,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  onSuccess: async () => {
    const distDir = path.resolve('dist/registry');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    fs.copyFileSync(
      path.resolve('src/registry/registry.seed.json'),
      path.resolve(distDir, 'registry.seed.json')
    );
    console.log('Copied registry.seed.json into dist/registry.');
  },
});
