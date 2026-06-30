import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const projectRoot = path.resolve(import.meta.dirname, '../..');
const playerDir = path.join(projectRoot, 'assets/images/player');
const frameWidth = 72;
const frameHeight = 96;
const targetHeight = 88;
const maxTargetWidth = 66;
const sheetFrames = [
  'xiaoyan_idle.png',
  'xiaoyan_walk_1.png',
  'xiaoyan_walk_2.png',
  'xiaoyan_walk_3.png',
  'xiaoyan_walk_4.png',
  'xiaoyan_jump.png',
  'xiaoyan_attack.png'
];

function readPng(fileName) {
  return PNG.sync.read(fs.readFileSync(path.join(playerDir, fileName)));
}

function writePng(fileName, png) {
  fs.writeFileSync(path.join(playerDir, fileName), PNG.sync.write(png));
}

function findBounds(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[((png.width * y + x) << 2) + 3];
      if (alpha > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0 || maxY < 0) {
    throw new Error('frame has no visible pixels');
  }

  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function drawScaled(source, bounds, target, frameIndex) {
  const scale = Math.min(targetHeight / bounds.height, maxTargetWidth / bounds.width);
  const drawWidth = Math.max(1, Math.round(bounds.width * scale));
  const drawHeight = Math.max(1, Math.round(bounds.height * scale));
  const offsetX = frameIndex * frameWidth + Math.round((frameWidth - drawWidth) / 2);
  const offsetY = frameHeight - drawHeight;

  for (let y = 0; y < drawHeight; y += 1) {
    for (let x = 0; x < drawWidth; x += 1) {
      const srcX = Math.min(bounds.maxX, bounds.minX + Math.floor(x / scale));
      const srcY = Math.min(bounds.maxY, bounds.minY + Math.floor(y / scale));
      const srcIndex = (source.width * srcY + srcX) << 2;
      const dstIndex = (target.width * (offsetY + y) + offsetX + x) << 2;
      const color = normalizeCostumeColor(source.data[srcIndex], source.data[srcIndex + 1], source.data[srcIndex + 2]);
      target.data[dstIndex] = color.r;
      target.data[dstIndex + 1] = color.g;
      target.data[dstIndex + 2] = color.b;
      target.data[dstIndex + 3] = source.data[srcIndex + 3];
    }
  }
}

const sheet = new PNG({ width: frameWidth * 4, height: frameHeight, colorType: 6 });
sheet.data.fill(0);

for (let frame = 1; frame <= 4; frame += 1) {
  const source = readPng(`xiaoyan_walk_${frame}.png`);
  const bounds = findBounds(source);
  const normalized = new PNG({ width: frameWidth, height: frameHeight, colorType: 6 });
  normalized.data.fill(0);
  drawScaled(source, bounds, normalized, 0);
  writePng(`xiaoyan_walk_${frame}.png`, normalized);
  drawScaled(normalized, findBounds(normalized), sheet, frame - 1);
}

writePng('xiaoyan_walk_sheet.png', sheet);

const fullSheet = new PNG({ width: frameWidth * sheetFrames.length, height: frameHeight, colorType: 6 });
fullSheet.data.fill(0);
sheetFrames.forEach((fileName, index) => {
  const source = readPng(fileName);
  drawScaled(source, findBounds(source), fullSheet, index);
});
writePng('xiaoyan_sheet.png', fullSheet);

console.info('Normalized Xiaoyan frames to 72x96 and wrote xiaoyan_walk_sheet.png + xiaoyan_sheet.png');

function normalizeCostumeColor(r, g, b) {
  const isWarmJacket = r > 110 && g < 120 && b < 110 && r > g * 1.25;
  if (!isWarmJacket) {
    return { r, g, b };
  }

  const brightness = Math.max(0.45, Math.min(1.22, (r + g + b) / 260));
  return {
    r: Math.round(32 * brightness),
    g: Math.round(126 * brightness),
    b: Math.round(102 * brightness)
  };
}
