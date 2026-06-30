import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/remove-green-screen.mjs <input.png> <output.png>');
  process.exit(1);
}

const source = PNG.sync.read(fs.readFileSync(inputPath));
for (let y = 0; y < source.height; y += 1) {
  for (let x = 0; x < source.width; x += 1) {
    const index = (source.width * y + x) << 2;
    const r = source.data[index];
    const g = source.data[index + 1];
    const b = source.data[index + 2];
    const greenDominance = g - Math.max(r, b);
    if (g > 145 && greenDominance > 35) {
      const edge = Math.max(0, Math.min(255, (greenDominance - 35) * 6));
      source.data[index + 3] = 255 - edge;
      source.data[index] = Math.min(r, 110);
      source.data[index + 1] = Math.min(g, 110);
      source.data[index + 2] = Math.min(b, 110);
    }
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, PNG.sync.write(source));
