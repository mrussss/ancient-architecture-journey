import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const phaserRoot = resolve(here, '..');
const repoRoot = resolve(phaserRoot, '..');

await mkdir(resolve(phaserRoot, 'public', 'assets'), { recursive: true });

await syncAssetDir('images');
await syncAssetDir('audio');

async function syncAssetDir(name) {
  const source = resolve(repoRoot, 'assets', name);
  const target = resolve(phaserRoot, 'public', 'assets', name);
  await rm(target, { recursive: true, force: true });
  if (!existsSync(source)) {
    console.warn(`Skipped missing asset directory: ${source}`);
    return;
  }
  await cp(source, target, { recursive: true });
  console.log(`Synced ${source} -> ${target}`);
}
