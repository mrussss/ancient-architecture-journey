import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const phaserRoot = resolve(here, '..');
const repoRoot = resolve(phaserRoot, '..');
const source = resolve(repoRoot, 'assets', 'images');
const target = resolve(phaserRoot, 'public', 'assets', 'images');

await mkdir(resolve(phaserRoot, 'public', 'assets'), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });

console.log(`Synced ${source} -> ${target}`);
