import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(rootDir, 'node_modules/@litertjs/core/wasm');
const dest = path.join(rootDir, 'public/wasm/litertjs-core');

if (!existsSync(src)) {
  console.error(
    `[copy-litert-wasm] Source not found: ${src}\n` +
      'Run "pnpm install" first so @litertjs/core is installed.'
  );
  process.exit(1);
}

await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true, force: true });

console.log(`[copy-litert-wasm] Copied ${src} -> ${dest}`);
