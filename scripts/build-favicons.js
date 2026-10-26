const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const scratchDir = path.resolve('/Users/pranjalsoni/.gemini/antigravity-ide/brain/ed3ae498-9ba8-422b-8442-48980162eab5/scratch');
const svgPath = path.join(projectRoot, 'app/icon.svg');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const svgContent = fs.readFileSync(svgPath, 'utf8');

// 1. Render Transparent Master PNG (for browser favicon.ico & tab icon)
const transparentMaster = path.join(scratchDir, 'master-transparent.png');
const htmlTransparent = path.join(scratchDir, 'render-transparent.html');
fs.writeFileSync(htmlTransparent, `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 512px; height: 512px; overflow: hidden; background: transparent; }
  svg { width: 512px; height: 512px; display: block; }
</style>
</head>
<body>${svgContent}</body>
</html>`, 'utf8');

console.log('Rendering transparent master King Crown with Chrome...');
execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${transparentMaster}" --window-size=512,512 --default-background-color=00000000 "file://${htmlTransparent}" > /dev/null 2>&1`);

// 2. Render App-Icon Master PNG with Deep Obsidian Canvas (for iOS Apple Touch Icon & PWA)
const appMaster = path.join(scratchDir, 'master-app.png');
const htmlApp = path.join(scratchDir, 'render-app.html');
fs.writeFileSync(htmlApp, `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 512px;
    height: 512px;
    overflow: hidden;
    background: #14110F;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .frame {
    width: 480px;
    height: 480px;
    border-radius: 104px;
    background: radial-gradient(circle at 50% 40%, #2A241F 0%, #14110F 85%);
    border: 6px solid #D4AF37;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 40px rgba(0,0,0,0.6);
  }
  svg { width: 340px; height: 340px; }
</style>
</head>
<body>
  <div class="frame">
    ${svgContent}
  </div>
</body>
</html>`, 'utf8');

console.log('Rendering app icon master King Crown with Chrome...');
execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${appMaster}" --window-size=512,512 --default-background-color=14110F "file://${htmlApp}" > /dev/null 2>&1`);

// 3. Generate standard Favicon PNGs from transparent master
const icoSizes = [16, 32, 48];
const pngBuffers = {};

icoSizes.forEach((size) => {
  const outPath = path.join(scratchDir, `icon-${size}.png`);
  execSync(`sips -z ${size} ${size} "${transparentMaster}" --out "${outPath}" > /dev/null 2>&1`);
  pngBuffers[size] = fs.readFileSync(outPath);
  console.log(`Generated transparent ${size}x${size} PNG (${pngBuffers[size].length} bytes)`);
});

// 4. Generate Apple Touch Icon & PWA icons from appMaster
const appSizes = [180, 192, 512];
appSizes.forEach((size) => {
  const outPath = path.join(scratchDir, `app-${size}.png`);
  execSync(`sips -z ${size} ${size} "${appMaster}" --out "${outPath}" > /dev/null 2>&1`);
});

fs.copyFileSync(path.join(scratchDir, 'app-180.png'), path.join(projectRoot, 'public/apple-touch-icon.png'));
fs.copyFileSync(path.join(scratchDir, 'app-180.png'), path.join(projectRoot, 'app/apple-icon.png'));
fs.copyFileSync(path.join(scratchDir, 'app-192.png'), path.join(projectRoot, 'public/icon-192.png'));
fs.copyFileSync(path.join(scratchDir, 'app-512.png'), path.join(projectRoot, 'public/icon-512.png'));
console.log('Saved apple-touch-icon and PWA icons.');

// 5. Build multi-resolution ICO file (16, 32, 48)
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
