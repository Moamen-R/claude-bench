import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RegistryItem } from '../core/schema.js';

export function getRegistryPath(): string {
  let currentDir = '';
  try {
    currentDir = path.dirname(fileURLToPath(import.meta.url));
  } catch {
    currentDir = process.cwd();
  }

  const candidates = [
    path.resolve(currentDir, 'registry/registry.seed.json'),
    path.resolve(currentDir, 'registry.seed.json'),
    path.resolve(currentDir, '../registry/registry.seed.json'),
    path.resolve(currentDir, '../src/registry/registry.seed.json'),
    path.resolve(process.cwd(), 'src/registry/registry.seed.json'),
    path.resolve(process.cwd(), 'dist/registry/registry.seed.json'),
    path.resolve(process.cwd(), 'registry.seed.json'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[candidates.length - 3];
}

export function loadRegistrySeed(): RegistryItem[] {
  const filePath = getRegistryPath();
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}
