const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK_DIR = '/tmp/customer_hindi_build';
const FRAMES_DIR = path.join(WORK_DIR, 'frames');
const AUDIO_DIR = '/tmp/customer_hindi_audio';
const OUTPUT_MP4 = '/Users/pranjalsoni/Desktop/The Dining Co./The-Dining-Co./Customer-Menu-Ordering-Demo.mp4';
const ARTIFACT_MP4 = '/Users/pranjalsoni/.gemini/antigravity-ide/brain/ed3ae498-9ba8-422b-8442-48980162eab5/Customer-Menu-Ordering-Demo.mp4';

if (fs.existsSync(WORK_DIR)) {
  fs.rmSync(WORK_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });

const SECTIONS = [
  { name: 'cust_01_welcome', audio: path.join(AUDIO_DIR, 'cust_01_welcome.mp3') },
  { name: 'cust_02_deals_categories', audio: path.join(AUDIO_DIR, 'cust_02_deals_categories.mp3') },
  { name: 'cust_03_selection_customization', audio: path.join(AUDIO_DIR, 'cust_03_selection_customization.mp3') },
  { name: 'cust_04_cart_checkout', audio: path.join(AUDIO_DIR, 'cust_04_cart_checkout.mp3') },
  { name: 'cust_05_payment_confirmation', audio: path.join(AUDIO_DIR, 'cust_05_payment_confirmation.mp3') },
  { name: 'cust_06_review', audio: path.join(AUDIO_DIR, 'cust_06_review.mp3') },
];

SECTIONS.forEach(s => {
  const durStr = execSync(`/opt/homebrew/bin/ffprobe -i "${s.audio}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
  s.duration = parseFloat(durStr);
  s.frames = Math.round(s.duration * 30);
  console.log(`[Audio] ${s.name}: ${s.duration.toFixed(2)}s -> ${s.frames} frames`);
});

const concatListPath = path.join(WORK_DIR, 'audio_concat.txt');
const masterAudioPath = path.join(WORK_DIR, 'master_audio.wav');
const concatContent = SECTIONS.map(s => `file '${s.audio}'`).join('\n');
fs.writeFileSync(concatListPath, concatContent);
execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -ar 44100 -ac 2 "${masterAudioPath}" 2>/dev/null`);
console.log('Master Customer Hindi audio ready.');

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

// Injects natural mobile touch pointer
async function injectTouchCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('__touch_cursor__')) return;
    const touch = document.createElement('div');
    touch.id = '__touch_cursor__';
    touch.style.position = 'fixed';
    touch.style.top = '0';
    touch.style.left = '0';
    touch.style.width = '28px';
    touch.style.height = '28px';
    touch.style.zIndex = '9999999';
    touch.style.pointerEvents = 'none';
    touch.style.transform = 'translate3d(210px, 450px, 0)';
    touch.innerHTML = `
      <div style="width:28px; height:28px; border-radius:50%; background:rgba(245, 158, 11, 0.45); border:2px solid #ffffff; box-shadow:0 0 12px rgba(245, 158, 11, 0.6); display:flex; align-items:center; justify-content:center;">
        <div style="width:8px; height:8px; border-radius:50%; background:#ffffff;"></div>
      </div>
      <div id="__touch_ripple__" style="position:absolute; top:0px; left:0px; width:50px; height:50px; border-radius:50%; border:2.5px solid #f59e0b; opacity:0; transform:translate(-11px, -11px) scale(0.2); transition:none;"></div>
    `;
    document.body.appendChild(touch);
    window.__currentTouchX = 210;
    window.__currentTouchY = 450;
  });
}

async function moveTouch(page, targetX, targetY, framesCount = 20) {
  const start = await page.evaluate(() => ({
    x: window.__currentTouchX || 210,
    y: window.__currentTouchY || 450
  }));
  
  for (let f = 1; f <= framesCount; f++) {
    const t = f / framesCount;
    const ease = 1 - Math.pow(1 - t, 3);
    const currX = start.x + (targetX - start.x) * ease;
    const currY = start.y + (targetY - start.y) * ease;
    await page.evaluate((x, y) => {
      window.__currentTouchX = x;
      window.__currentTouchY = y;
      const el = document.getElementById('__touch_cursor__');
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }, currX, currY);
    await saveFrame(page, 1);
  }
}

async function tapTouch(page, framesCount = 15) {
  await page.evaluate(() => {
    const rip = document.getElementById('__touch_ripple__');
    if (rip) {
      rip.style.transition = 'transform 0.35s ease-out, opacity 0.35s ease-out';
      rip.style.transform = 'translate(-11px, -11px) scale(1.6)';
      rip.style.opacity = '0.9';
      setTimeout(() => {
        rip.style.opacity = '0';
        rip.style.transform = 'translate(-11px, -11px) scale(2.4)';
      }, 150);
    }
  });
  await saveFrame(page, framesCount);
}

async function smoothScrollMobile(page, targetY, framesCount = 25) {
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
  console.log('Launching browser for Hindi Customer Menu Walkthrough...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  // Realistic high-density mobile viewport
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

  // -------------------------------------------------------------
  // SECTION 1: Welcome & Namaste Modal (cust_01_welcome ~ 718 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 1: Customer Welcome & Namaste...');
  const sec1Frames = SECTIONS[0].frames;
  const sec1Start = frameIndex;

  await page.goto('http://localhost:3001/suman/menu?table=4', { waitUntil: 'networkidle2' });
  await injectTouchCursor(page);
  await saveFrame(page, 40);

  // Move touch pointer over the Welcome Namaste Card
  await moveTouch(page, 215, 420, 25);
  await saveFrame(page, 40);

  // Tap "Tap anywhere to start" or dismiss welcome
  await moveTouch(page, 215, 520, 25);
  await tapTouch(page, 15);
  await page.evaluate(() => {
    const btn = document.querySelector('button, [role="button"]');
    if (btn) btn.click();
    else document.body.click();
  });
  await saveFrame(page, 30);

  const sec1Elapsed = frameIndex - sec1Start;
  if (sec1Frames > sec1Elapsed) {
    await saveFrame(page, sec1Frames - sec1Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 2: Deals Banner & Categories (cust_02_deals_categories ~ 860 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 2: Privilege Deals & Categories...');
  const sec2Frames = SECTIONS[1].frames;
  const sec2Start = frameIndex;

  // Touch moves to "20% OFF Flat Discount" banner
  await moveTouch(page, 215, 175, 30);
  await saveFrame(page, 45);

  // Touch moves horizontally across category chips
  await moveTouch(page, 140, 230, 25);
  await saveFrame(page, 30);
  await moveTouch(page, 280, 230, 25);
  await saveFrame(page, 30);

  // Smooth scroll down through gourmet items
  await smoothScrollMobile(page, 250, 30);
  await saveFrame(page, 40);
  await smoothScrollMobile(page, 520, 35);
  await saveFrame(page, 45);

  const sec2Elapsed = frameIndex - sec2Start;
  if (sec2Frames > sec2Elapsed) {
    await saveFrame(page, sec2Frames - sec2Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 3: Item Selection & Custom Instructions (cust_03_selection_customization ~ 888 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 3: Item Selection & Custom Instructions...');
  const sec3Frames = SECTIONS[2].frames;
  const sec3Start = frameIndex;

  // Tap "+ ADD" on an appetizer / pizza
  await moveTouch(page, 360, 480, 25);
  await tapTouch(page, 15);
  await page.evaluate(() => {
    const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('ADD') || b.innerText.includes('+'));
    if (addBtns[0]) addBtns[0].click();
  });
  await saveFrame(page, 40);

  // Scroll down to select a beverage
  await smoothScrollMobile(page, 800, 30);
  await saveFrame(page, 35);

  // Tap "+ ADD" on second item
  await moveTouch(page, 360, 680, 25);
  await tapTouch(page, 15);
  await page.evaluate(() => {
    const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('ADD') || b.innerText.includes('+'));
    if (addBtns[1]) addBtns[1].click();
  });
  await saveFrame(page, 40);

  // Move touch to bottom floating cart bar
  await moveTouch(page, 215, 875, 25);
  await saveFrame(page, 35);

  const sec3Elapsed = frameIndex - sec3Start;
  if (sec3Frames > sec3Elapsed) {
    await saveFrame(page, sec3Frames - sec3Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 4: Cart Review & Checkout (cust_04_cart_checkout ~ 559 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 4: Cart Review & Special Instructions...');
  const sec4Frames = SECTIONS[3].frames;
  const sec4Start = frameIndex;

  // Tap floating Cart button to navigate to checkout
  await tapTouch(page, 15);
  await page.goto('http://localhost:3001/suman/menu/checkout?table=4', { waitUntil: 'networkidle2' });
  await injectTouchCursor(page);
  await saveFrame(page, 35);

  // Smooth scroll down to Special Instructions input field
  await smoothScrollMobile(page, 320, 30);
  await saveFrame(page, 25);

  // Tap on Special Instructions textarea
  await moveTouch(page, 215, 520, 25);
  await tapTouch(page, 10);

  // Type special cooking instructions smoothly
  const instructionText = 'Extra cheese, less spicy please';
  await page.evaluate(() => {
    const ta = document.querySelector('textarea, input[placeholder*="instruction" i], input[placeholder*="request" i]');
    if (ta) ta.focus();
  });

  for (const char of instructionText) {
    await page.type('textarea, input[placeholder*="instruction" i], input[placeholder*="request" i]', char);
    await saveFrame(page, 3);
  }
  await saveFrame(page, 30);

  // Scroll down to view Bill Summary & Discount
  await smoothScrollMobile(page, 650, 30);
  await saveFrame(page, 35);

  // Move touch to "Proceed to Pay" button
  await moveTouch(page, 215, 870, 25);
  await tapTouch(page, 15);

  const sec4Elapsed = frameIndex - sec4Start;
  if (sec4Frames > sec4Elapsed) {
    await saveFrame(page, sec4Frames - sec4Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 5: Payment & Order Confirmation (cust_05_payment_confirmation ~ 824 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 5: Payment & Order Confirmation...');
  const sec5Frames = SECTIONS[4].frames;
  const sec5Start = frameIndex;

  // Navigate to Payment page
  await page.goto(`http://localhost:3001/suman/menu/checkout/payment?table=4&instructions=${encodeURIComponent('Extra cheese, less spicy please')}`, { waitUntil: 'networkidle2' });
  await injectTouchCursor(page);
  await saveFrame(page, 30);

  // Move touch to UPI QR Code option
  await moveTouch(page, 215, 380, 25);
  await saveFrame(page, 45);

  // Move touch to Pay at Counter option
  await moveTouch(page, 215, 580, 25);
  await saveFrame(page, 35);

  // Navigate to Order Confirmation
  await page.goto('http://localhost:3001/suman/menu/order-confirmation?orderNumber=1012&table=4', { waitUntil: 'networkidle2' });
  await injectTouchCursor(page);
  await saveFrame(page, 40);

  // Move touch to Order Placed badge
  await moveTouch(page, 215, 220, 25);
  await saveFrame(page, 35);

  // Smooth scroll down to highlight "KITCHEN REQUEST SENT “extra cheese, less spicy please”"
  await smoothScrollMobile(page, 280, 30);
  await moveTouch(page, 215, 390, 25);
  await saveFrame(page, 70); // Linger on special instruction confirmation!

  const sec5Elapsed = frameIndex - sec5Start;
  if (sec5Frames > sec5Elapsed) {
    await saveFrame(page, sec5Frames - sec5Elapsed);
  }

  // -------------------------------------------------------------
  // SECTION 6: 5-Star Diner Feedback (cust_06_review ~ 484 frames)
  // -------------------------------------------------------------
  console.log('Recording Section 6: Customer 5-Star Review...');
  const sec6Frames = SECTIONS[5].frames;
  const sec6Start = frameIndex;

  // Scroll down to Customer Feedback stars
  await smoothScrollMobile(page, 520, 25);
  await saveFrame(page, 25);

  // Move touch to 5th star (5-star rating)
  await moveTouch(page, 280, 520, 25);
  await tapTouch(page, 15);
  await page.evaluate(() => {
    const stars = Array.from(document.querySelectorAll('button, svg')).filter(el => el.getAttribute('aria-label')?.includes('5') || el.innerHTML.includes('star') || el.closest('button'));
    if (stars[4]) stars[4].click();
  });
  await saveFrame(page, 40);

  // Move touch to "Submit Feedback"
  await moveTouch(page, 215, 680, 25);
  await tapTouch(page, 15);
  await saveFrame(page, 60);

  const sec6Elapsed = frameIndex - sec6Start;
  if (sec6Frames > sec6Elapsed) {
    await saveFrame(page, sec6Frames - sec6Elapsed);
  }

  await browser.close();
  console.log(`Customer capture complete. Total frames captured: ${frameIndex}`);

  // Compile video with FFmpeg
  console.log('Compiling 1080p Customer Menu video with Hindi audio...');
  // Render onto 1080p canvas with stylish dark centered frame
  const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -framerate 30 -i "${FRAMES_DIR}/frame_%05d.png" -i "${masterAudioPath}" -vf "scale=498:1080,pad=1920:1080:(1920-498)/2:0:color=#0c0a09" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -c:a aac -b:a 192k -shortest "${OUTPUT_MP4}"`;
  execSync(ffmpegCmd);

  // Copy to artifacts
  fs.copyFileSync(OUTPUT_MP4, ARTIFACT_MP4);
  console.log(`Customer video successfully generated at:\n${OUTPUT_MP4}\n${ARTIFACT_MP4}`);
}

run().catch(err => {
  console.error('Error generating Hindi customer video:', err);
  process.exit(1);
});
