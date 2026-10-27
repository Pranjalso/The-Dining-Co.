const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK_DIR = '/tmp/admin_hindi_build';
const FRAMES_DIR = path.join(WORK_DIR, 'frames');
const AUDIO_DIR = '/tmp/admin_hindi_audio';
const OUTPUT_MP4 = '/Users/pranjalsoni/Desktop/The Dining Co./The-Dining-Co./Cafe-Owner-Dashboard-Demo.mp4';
const ARTIFACT_MP4 = '/Users/pranjalsoni/.gemini/antigravity-ide/brain/ed3ae498-9ba8-422b-8442-48980162eab5/Cafe-Owner-Dashboard-Demo.mp4';

if (fs.existsSync(WORK_DIR)) {
  fs.rmSync(WORK_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });

const SECTIONS = [
  { name: 'admin_01_intro', audio: path.join(AUDIO_DIR, 'admin_01_intro.mp3') },
  { name: 'admin_02_overview', audio: path.join(AUDIO_DIR, 'admin_02_overview.mp3') },
  { name: 'admin_03_kds', audio: path.join(AUDIO_DIR, 'admin_03_kds.mp3') },
  { name: 'admin_04_orders', audio: path.join(AUDIO_DIR, 'admin_04_orders.mp3') },
  { name: 'admin_05_payments', audio: path.join(AUDIO_DIR, 'admin_05_payments.mp3') },
  { name: 'admin_06_menu', audio: path.join(AUDIO_DIR, 'admin_06_menu.mp3') },
  { name: 'admin_07_qr', audio: path.join(AUDIO_DIR, 'admin_07_qr.mp3') },
  { name: 'admin_08_ratings_settings', audio: path.join(AUDIO_DIR, 'admin_08_ratings_settings.mp3') },
];

// Measure durations
SECTIONS.forEach(s => {
  const durStr = execSync(`/opt/homebrew/bin/ffprobe -i "${s.audio}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
  s.duration = parseFloat(durStr);
  s.frames = Math.round(s.duration * 30);
  console.log(`[Audio] ${s.name}: ${s.duration.toFixed(2)}s -> ${s.frames} frames`);
});

// Concatenate all audios into single master WAV
const concatListPath = path.join(WORK_DIR, 'audio_concat.txt');
const masterAudioPath = path.join(WORK_DIR, 'master_audio.wav');
const concatContent = SECTIONS.map(s => `file '${s.audio}'`).join('\n');
fs.writeFileSync(concatListPath, concatContent);
execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -ar 44100 -ac 2 "${masterAudioPath}" 2>/dev/null`);
console.log('Master Hindi audio concatenated successfully.');

let frameIndex = 0;

async function saveFrame(page, count = 1) {
  const framePath = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(5, '0')}.png`);
  await page.screenshot({ path: framePath, type: 'png' });
  frameIndex++;
  for (let i = 1; i < count; i++) {
    const dupPath = path.join(FRAMES_DIR, `frame_${String(frameIndex).padStart(5, '0')}.png`);
    fs.copyFileSync(framePath, dupPath);
    frameIndex++;
  }
}

// Injects natural macOS arrow cursor & click pulse into page
async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('__human_cursor__')) return;
    const cursor = document.createElement('div');
    cursor.id = '__human_cursor__';
    cursor.style.position = 'fixed';
    cursor.style.top = '0';
    cursor.style.left = '0';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.zIndex = '9999999';
    cursor.style.pointerEvents = 'none';
    cursor.style.transform = 'translate3d(960px, 540px, 0)';
    cursor.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.45));">
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z" fill="#1e1e1e" stroke="#ffffff" stroke-width="1.5"/>
      </svg>
      <div id="__cursor_ripple__" style="position:absolute; top:2px; left:2px; width:44px; height:44px; border-radius:50%; border:2.5px solid #f59e0b; opacity:0; transform:translate(-22px, -22px) scale(0.2); transition:none;"></div>
    `;
    document.body.appendChild(cursor);
    window.__currentCursorX = 960;
    window.__currentCursorY = 540;
  });
}

// Move cursor smoothly along bezier/eased curve
async function moveCursor(page, targetX, targetY, framesCount = 20) {
  const start = await page.evaluate(() => ({
    x: window.__currentCursorX || 960,
    y: window.__currentCursorY || 540
  }));
  
  for (let f = 1; f <= framesCount; f++) {
    const t = f / framesCount;
    // Cubic bezier ease-out
    const ease = 1 - Math.pow(1 - t, 3);
    const currX = start.x + (targetX - start.x) * ease;
    const currY = start.y + (targetY - start.y) * ease;
    await page.evaluate((x, y) => {
      window.__currentCursorX = x;
      window.__currentCursorY = y;
      const el = document.getElementById('__human_cursor__');
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }, currX, currY);
    await saveFrame(page, 1);
  }
}

// Simulate click with ripple pulse animation
async function clickCursor(page, framesCount = 15) {
  await page.evaluate(() => {
    const rip = document.getElementById('__cursor_ripple__');
    if (rip) {
      rip.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
      rip.style.transform = 'translate(-22px, -22px) scale(1.4)';
      rip.style.opacity = '0.9';
      setTimeout(() => {
        rip.style.opacity = '0';
        rip.style.transform = 'translate(-22px, -22px) scale(2.2)';
      }, 150);
    }
  });
  await saveFrame(page, framesCount);
}

// Smooth page scroll
async function smoothScroll(page, targetY, framesCount = 25) {
  const startY = await page.evaluate(() => window.scrollY);
  for (let f = 1; f <= framesCount; f++) {
    const t = f / framesCount;
    const ease = 1 - Math.pow(1 - t, 3);
    const currY = startY + (targetY - startY) * ease;
    await page.evaluate((y) => window.scrollTo(0, y), currY);
    await saveFrame(page, 1);
  }
}

async function run() {
  console.log('Launching browser for Hindi Cafe Owner Walkthrough...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // -------------------------------------------------------------
  // SECTION 1: Intro & Login (admin_01_intro ~ 795 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 1: Intro & Admin Login...');
  const sec1Frames = SECTIONS[0].frames;
  const sec1Start = frameIndex;

  await page.goto('http://localhost:3001/suman/adminlogin', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30); // Hold initially

  // Move cursor to username input
  await moveCursor(page, 960, 430, 25);
  await clickCursor(page, 10);
  
  // Type username smoothly
  const userStr = 'Suman';
  for (const char of userStr) {
    await page.type('input[placeholder*="user" i], input[type="text"]', char);
    await saveFrame(page, 4);
  }
  await saveFrame(page, 15);

  // Move to password input
  await moveCursor(page, 960, 510, 20);
  await clickCursor(page, 10);

  // Type password smoothly
  const passStr = 'Suman@123';
  for (const char of passStr) {
    await page.type('input[type="password"]', char);
    await saveFrame(page, 4);
  }
  await saveFrame(page, 20);

  // Move to submit button
  await moveCursor(page, 960, 590, 25);
  await clickCursor(page, 15);

  // Click login
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
  ]);

  await injectCursor(page);
  // Pad remaining frames for Section 1
  const sec1Elapsed = frameIndex - sec1Start;
  if (sec1Frames > sec1Elapsed) {
    await saveFrame(page, sec1Frames - sec1Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 2: Dashboard Overview & Analytics (admin_02_overview ~ 768 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 2: Dashboard Overview...');
  const sec2Frames = SECTIONS[1].frames;
  const sec2Start = frameIndex;

  // Cursor moves to KPI card 1: Today's Revenue
  await moveCursor(page, 400, 220, 30);
  await saveFrame(page, 40);

  // Move to KPI card 2: Active Orders
  await moveCursor(page, 720, 220, 25);
  await saveFrame(page, 35);

  // Move to KPI card 3: Table Turnover
  await moveCursor(page, 1040, 220, 25);
  await saveFrame(page, 35);

  // Smooth scroll down to view Revenue Graph & Analytics
  await smoothScroll(page, 450, 40);
  await saveFrame(page, 30);

  // Hover over chart / sales breakdown
  await moveCursor(page, 650, 500, 30);
  await saveFrame(page, 50);
  await moveCursor(page, 1300, 520, 35);
  await saveFrame(page, 50);

  // Smooth scroll back up
  await smoothScroll(page, 0, 35);
  await saveFrame(page, 25);

  const sec2Elapsed = frameIndex - sec2Start;
  if (sec2Frames > sec2Elapsed) {
    await saveFrame(page, sec2Frames - sec2Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 3: Live Kitchen KDS & New Orders (admin_03_kds ~ 1060 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 3: Kitchen Display System (New Orders)...');
  const sec3Frames = SECTIONS[2].frames;
  const sec3Start = frameIndex;

  // Move cursor to sidebar "New Orders"
  await moveCursor(page, 140, 205, 30);
  await clickCursor(page, 15);

  await page.goto('http://localhost:3001/suman/admin/new-orders', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30);

  // Move cursor to Order Card Table 4
  await moveCursor(page, 600, 380, 35);
  await saveFrame(page, 40);

  // Move cursor to highlight customer cooking instruction: "Extra cheese, less spicy please"
  await moveCursor(page, 650, 520, 30);
  await saveFrame(page, 80); // Linger on instructions so viewer reads it!

  // Move cursor to "Accept" or "Preparing" button
  await moveCursor(page, 750, 620, 30);
  await clickCursor(page, 20);

  // Scroll down smoothly to show all pending table orders
  await smoothScroll(page, 300, 35);
  await saveFrame(page, 50);
  await smoothScroll(page, 0, 30);
  await saveFrame(page, 30);

  const sec3Elapsed = frameIndex - sec3Start;
  if (sec3Frames > sec3Elapsed) {
    await saveFrame(page, sec3Frames - sec3Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 4: Orders Management (admin_04_orders ~ 618 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 4: Orders Management...');
  const sec4Frames = SECTIONS[3].frames;
  const sec4Start = frameIndex;

  // Move cursor to sidebar "Orders"
  await moveCursor(page, 140, 245, 25);
  await clickCursor(page, 15);

  await page.goto('http://localhost:3001/suman/admin/orders', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30);

  // Move cursor to tabs: "1 Preparing", "0 Served"
  await moveCursor(page, 450, 160, 30);
  await saveFrame(page, 35);
  await moveCursor(page, 580, 160, 25);
  await saveFrame(page, 35);

  // Scroll to show order timeline
  await smoothScroll(page, 250, 30);
  await saveFrame(page, 45);
  await smoothScroll(page, 0, 25);
  await saveFrame(page, 20);

  const sec4Elapsed = frameIndex - sec4Start;
  if (sec4Frames > sec4Elapsed) {
    await saveFrame(page, sec4Frames - sec4Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 5: Payment Completed (admin_05_payments ~ 628 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 5: Payment Completed & Settlements...');
  const sec5Frames = SECTIONS[4].frames;
  const sec5Start = frameIndex;

  // Move cursor to sidebar "Payment Completed"
  await moveCursor(page, 140, 285, 25);
  await clickCursor(page, 15);

  await page.goto('http://localhost:3001/suman/admin/payment-completed', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30);

  // Move cursor to Revenue Summary Card
  await moveCursor(page, 520, 260, 30);
  await saveFrame(page, 50);

  // Move cursor to UPI vs Cash settlement filter
  await moveCursor(page, 920, 260, 30);
  await saveFrame(page, 50);

  // Smooth scroll down to view transaction list
  await smoothScroll(page, 200, 25);
  await saveFrame(page, 40);
  await smoothScroll(page, 0, 20);

  const sec5Elapsed = frameIndex - sec5Start;
  if (sec5Frames > sec5Elapsed) {
    await saveFrame(page, sec5Frames - sec5Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 6: Menu Management (admin_06_menu ~ 711 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 6: Menu Management...');
  const sec6Frames = SECTIONS[5].frames;
  const sec6Start = frameIndex;

  // Move cursor to sidebar "Manage Menu"
  await moveCursor(page, 140, 325, 25);
  await clickCursor(page, 15);

  await page.goto('http://localhost:3001/suman/admin/manage-menu', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30);

  // Move cursor to categories bar
  await moveCursor(page, 480, 220, 30);
  await saveFrame(page, 35);

  // Move cursor to an item availability switch (In Stock / Out of Stock)
  await moveCursor(page, 1150, 380, 30);
  await clickCursor(page, 15); // Toggle stock live!
  await saveFrame(page, 40);
  await clickCursor(page, 15); // Toggle back

  // Move cursor to "+ New Category" / "Add Item" button
  await moveCursor(page, 1400, 160, 30);
  await saveFrame(page, 40);

  // Smooth scroll through menu list
  await smoothScroll(page, 400, 35);
  await saveFrame(page, 50);
  await smoothScroll(page, 0, 30);

  const sec6Elapsed = frameIndex - sec6Start;
  if (sec6Frames > sec6Elapsed) {
    await saveFrame(page, sec6Frames - sec6Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 7: Table QR Code Generator (admin_07_qr ~ 609 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 7: Table QR Code Generator...');
  const sec7Frames = SECTIONS[6].frames;
  const sec7Start = frameIndex;

  // Move cursor to sidebar "Menu QR Code"
  await moveCursor(page, 140, 365, 25);
  await clickCursor(page, 15);

  await page.goto('http://localhost:3001/suman/admin/qr-code', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30);

  // Move cursor to Table Selector buttons ('1 to 20')
  await moveCursor(page, 520, 190, 30);
  await clickCursor(page, 15);
  await saveFrame(page, 35);

  // Move cursor to the generated branded QR code preview
  await moveCursor(page, 800, 460, 35);
  await saveFrame(page, 60);

  // Hover over "Download PDF Standee" button
  await moveCursor(page, 1200, 460, 30);
  await saveFrame(page, 50);

  const sec7Elapsed = frameIndex - sec7Start;
  if (sec7Frames > sec7Elapsed) {
    await saveFrame(page, sec7Frames - sec7Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 8: Customer Ratings & Settings (admin_08_ratings_settings ~ 878 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 8: Ratings, Offers & Cafe Settings...');
  const sec8Frames = SECTIONS[7].frames;
  const sec8Start = frameIndex;

  // Move cursor to sidebar "Customer Ratings"
  await moveCursor(page, 140, 405, 25);
  await clickCursor(page, 15);

  await page.goto('http://localhost:3001/suman/admin/ratings', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30);

  // Move cursor over 5-Star Average Rating & Reviews
  await moveCursor(page, 500, 240, 30);
  await saveFrame(page, 45);
  await smoothScroll(page, 300, 30);
  await saveFrame(page, 40);

  // Move cursor to sidebar "Special Offers"
  await moveCursor(page, 140, 445, 25);
  await clickCursor(page, 15);

  await page.goto('http://localhost:3001/suman/admin/offers', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30);

  // Move cursor over active promo cards
  await moveCursor(page, 600, 280, 30);
  await saveFrame(page, 45);

  // Move cursor to sidebar "Settings"
  await moveCursor(page, 140, 485, 25);
  await clickCursor(page, 15);

  await page.goto('http://localhost:3001/suman/admin/settings', { waitUntil: 'networkidle2' });
  await injectCursor(page);
  await saveFrame(page, 30);

  // Move cursor to Cafe Details & UPI Configuration
  await moveCursor(page, 650, 320, 30);
  await saveFrame(page, 60);

  const sec8Elapsed = frameIndex - sec8Start;
  if (sec8Frames > sec8Elapsed) {
    await saveFrame(page, sec8Frames - sec8Elapsed);
  }

  await browser.close();
  console.log(`Frame capture complete. Total frames captured: ${frameIndex}`);

  // Compile video with FFmpeg
  console.log('Compiling 1080p video with Hindi audio...');
  const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -framerate 30 -i "${FRAMES_DIR}/frame_%05d.png" -i "${masterAudioPath}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -c:a aac -b:a 192k -shortest "${OUTPUT_MP4}"`;
  execSync(ffmpegCmd);

  // Copy to artifacts
  fs.copyFileSync(OUTPUT_MP4, ARTIFACT_MP4);
  console.log(`Video successfully generated at:\n${OUTPUT_MP4}\n${ARTIFACT_MP4}`);
}

run().catch(err => {
  console.error('Error generating Hindi admin video:', err);
  process.exit(1);
});
