const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const scratchDir = path.resolve('/Users/pranjalsoni/.gemini/antigravity-ide/brain/ed3ae498-9ba8-422b-8442-48980162eab5/scratch');
const svgPath = path.join(projectRoot, 'app/icon.svg');

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

// 1. Render high-res master PNG from SVG using macOS QuickLook
const masterPng = path.join(scratchDir, 'master-icon.png');
console.log('Rendering master icon from SVG...');
execSync(`qlmanage -t -s 512 -o "${scratchDir}" "${svgPath}"`);
const qlOutput = path.join(scratchDir, 'icon.svg.png');
if (fs.existsSync(qlOutput)) {
  fs.renameSync(qlOutput, masterPng);
} else {
  throw new Error('QuickLook failed to produce thumbnail');
}

// 2. Generate various standard sizes using sips
const sizes = [16, 32, 48, 64, 180, 192, 512];
const pngBuffers = {};

sizes.forEach((size) => {
  const outPath = path.join(scratchDir, `icon-${size}.png`);
  execSync(`sips -z ${size} ${size} "${masterPng}" --out "${outPath}" > /dev/null 2>&1`);
  pngBuffers[size] = fs.readFileSync(outPath);
  console.log(`Generated ${size}x${size} PNG (${pngBuffers[size].length} bytes)`);
});

// 3. Save Apple Touch Icon and PWA icons
fs.copyFileSync(path.join(scratchDir, 'icon-180.png'), path.join(projectRoot, 'public/apple-touch-icon.png'));
fs.copyFileSync(path.join(scratchDir, 'icon-180.png'), path.join(projectRoot, 'app/apple-icon.png'));
fs.copyFileSync(path.join(scratchDir, 'icon-192.png'), path.join(projectRoot, 'public/icon-192.png'));
fs.copyFileSync(path.join(scratchDir, 'icon-512.png'), path.join(projectRoot, 'public/icon-512.png'));
console.log('Saved apple-touch-icon and PWA icons.');

// 4. Build multi-resolution ICO file (16, 32, 48)
function createIco(pngSizes) {
  const count = pngSizes.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirTotalSize = headerSize + count * dirEntrySize;

  let currentOffset = dirTotalSize;
  const dirEntries = [];
  const imageBuffers = [];

  for (const s of pngSizes) {
    const buf = pngBuffers[s];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // Width
    entry.writeUInt8(s === 256 ? 0 : s, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buf.length, 8); // Image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // Offset
    dirEntries.push(entry);
    imageBuffers.push(buf);
    currentOffset += buf.length;
  }

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(count, 4); // Number of images

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

const icoBuffer = createIco([16, 32, 48]);
fs.writeFileSync(path.join(projectRoot, 'app/favicon.ico'), icoBuffer);
console.log(`Generated app/favicon.ico (${icoBuffer.length} bytes) for Next.js App Router`);

