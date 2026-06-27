// scripts/merge-dist.mjs
// Merges docs and playground build outputs into a single dist/ folder for Vercel deployment.
// - docs (.vitepress/dist) → dist/          (root: anomotionjs.vercel.app/)
// - playground (playground/dist) → dist/playground/   (anomotionjs.vercel.app/playground/)

import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const docsOut = resolve(root, 'docs/.vitepress/dist');
const playgroundOut = resolve(root, 'playground/dist');
const mergedOut = resolve(root, 'dist');

// Clean and recreate dist
if (existsSync(mergedOut)) {
  rmSync(mergedOut, { recursive: true, force: true });
}
mkdirSync(mergedOut, { recursive: true });

// 1. Copy docs build → dist
if (existsSync(docsOut)) {
  cpSync(docsOut, mergedOut, { recursive: true });
  console.log('✓ Copied docs → dist/');
} else {
  console.warn('⚠ docs/.vitepress/dist not found, skipping.');
}

// 2. Copy playground build → dist/playground/
if (existsSync(playgroundOut)) {
  const playgroundDest = resolve(mergedOut, 'playground');
  mkdirSync(playgroundDest, { recursive: true });
  cpSync(playgroundOut, playgroundDest, { recursive: true });
  console.log('✓ Copied playground → dist/playground/');
} else {
  console.warn('⚠ playground/dist not found, skipping.');
}

console.log('✓ merge-dist complete → dist/');
