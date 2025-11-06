/* eslint-disable no-console */
/**
 * Favicon generator
 *
 * Inputs:
 *  - public/youtube-bank.svg (base icon)
 * Outputs:
 *  - favicon-16x16.png, favicon-32x32.png, favicon-64x64.png, favicon-128x128.png
 *  - apple-touch-icon.png (180x180)
 *  - favicon.ico (128x128 PNG embedded)
 *
 * Usage:
 *  node scripts/generate-favicons.js
 */
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true }).catch(() => {});
}

async function main() {
  const publicDir = path.resolve(__dirname, '../public');
  const sourceSvg = path.join(publicDir, 'youtube-bank.svg');
  const sizes = [16, 32, 64, 128, 180];
  const outputs = [];

  console.log('Generating PNG favicons from', sourceSvg);

  for (const size of sizes) {
    const outName = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
    const outPath = path.join(publicDir, outName);
    const buffer = await sharp(sourceSvg)
      .resize({ width: size, height: size })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await fs.writeFile(outPath, buffer);
    console.log(' ✓', outName);
    if (size !== 180) outputs.push({ size, path: outPath });
  }

  // Generate favicon.ico with a single 128x128 PNG embedded
  const icoPngPath = outputs.find((o) => o.size === 128)?.path || outputs[outputs.length - 1].path;
  const icoPng = await fs.readFile(icoPngPath);
  const ICONDIR = Buffer.alloc(6);
  ICONDIR.writeUInt16LE(0, 0); // reserved
  ICONDIR.writeUInt16LE(1, 2); // type = icon
  ICONDIR.writeUInt16LE(1, 4); // count = 1

  const width = 128;
  const height = 128;
  const ICONDIRENTRY = Buffer.alloc(16);
  ICONDIRENTRY.writeUInt8(width === 256 ? 0 : width, 0); // width
  ICONDIRENTRY.writeUInt8(height === 256 ? 0 : height, 1); // height
  ICONDIRENTRY.writeUInt8(0, 2); // color count
  ICONDIRENTRY.writeUInt8(0, 3); // reserved
  ICONDIRENTRY.writeUInt16LE(1, 4); // planes
  ICONDIRENTRY.writeUInt16LE(32, 6); // bitcount
  ICONDIRENTRY.writeUInt32LE(icoPng.length, 8); // bytes in resource
  ICONDIRENTRY.writeUInt32LE(6 + 16, 12); // image offset

  const icoBuffer = Buffer.concat([ICONDIR, ICONDIRENTRY, icoPng]);
  await fs.writeFile(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log(' ✓ favicon.ico');

  // Also copy SVG to canonical favicon.svg if missing (already updated in repo)
  // No-op here.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});