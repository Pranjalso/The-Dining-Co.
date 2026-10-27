const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK_DIR = '/tmp/admin_video_build';
const FRAMES_DIR = path.join(WORK_DIR, 'frames');
const AUDIO_DIR = path.join(WORK_DIR, 'audio');
const OUTPUT_MP4 = '/Users/pranjalsoni/Desktop/The Dining Co./The-Dining-Co./Cafe-Owner-Dashboard-Demo.mp4';
const ARTIFACT_MP4 = '/Users/pranjalsoni/.gemini/antigravity-ide/brain/ed3ae498-9ba8-422b-8442-48980162eab5/Cafe-Owner-Dashboard-Demo.mp4';

if (fs.existsSync(WORK_DIR)) {
  fs.rmSync(WORK_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });
fs.mkdirSync(AUDIO_DIR, { recursive: true });

let frameIndex = 0;
const audioFiles = [];

function generateVoice(text, filename) {
  const aiffPath = path.join(AUDIO_DIR, `${filename}.aiff`);
  const wavPath = path.join(AUDIO_DIR, `${filename}.wav`);
  // Clean text for shell
  const safeText = text.replace(/"/g, '\\"');
  execSync(`say -v Samantha "${safeText}" -o "${aiffPath}"`);
  execSync(`/opt/homebrew/bin/ffmpeg -y -i "${aiffPath}" -ar 44100 -ac 2 "${wavPath}" 2>/dev/null`);
  const durStr = execSync(`/opt/homebrew/bin/ffprobe -i "${wavPath}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
  const duration = parseFloat(durStr);
  audioFiles.push(wavPath);
  return duration;
}

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

function getTitleCardHtml(title, subtitle, badgeText = 'THE DINING CO. OWNER SUITE', highlight = '') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1920px;
          height: 1080px;
          background: radial-gradient(circle at 50% 40%, #1c1917 0%, #0c0a09 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #f5f5f4;
          overflow: hidden;
          position: relative;
        }
        .glow {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, rgba(217, 119, 6, 0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .crown {
          width: 100px;
          height: 100px;
          margin-bottom: 24px;
          filter: drop-shadow(0 0 28px rgba(245, 158, 11, 0.45));
        }
        .badge {
          display: inline-block;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 8px 24px;
          border-radius: 999px;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 56px;
          font-weight: 800;
          letter-spacing: -1px;
          text-align: center;
          max-width: 1300px;
          line-height: 1.15;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #ffffff 40%, #d6d3d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .highlight {
          color: #f59e0b;
          -webkit-text-fill-color: #f59e0b;
        }
        p {
          font-size: 24px;
          color: #a8a29e;
          font-weight: 400;
          text-align: center;
          max-width: 950px;
          line-height: 1.5;
        }
        .footer {
          position: absolute;
          bottom: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #78716c;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="glow"></div>
      <svg class="crown" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.269a4 4 0 0 1-3.86 2.934H8.713a4 4 0 0 1-3.86-2.934L2.019 6.019a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
        <path d="M5 21h14"/>
      </svg>
      <div class="badge">${badgeText}</div>
      <h1>${title} ${highlight ? `<span class="highlight">${highlight}</span>` : ''}</h1>
      <p>${subtitle}</p>
      <div class="footer">
        <span>The Dining Co.</span>
        <span>•</span>
        <span>Cafe Owner Management System</span>
      </div>
    </body>
    </html>
  `;
}

function getDesktopFrameHtml(desktopScreenshotBase64, headerTitle, stepBadge, highlightText, currentPath) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1920px;
          height: 1080px;
          background: #09090b;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #fff;
          overflow: hidden;
          padding: 24px 32px;
        }
        .header-bar {
          width: 100%;
          max-width: 1820px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .left-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 999px;
          color: #f59e0b;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 10px #f59e0b;
        }
        .title {
          font-size: 26px;
          font-weight: 800;
          color: #ffffff;
        }
        .highlight-text {
          font-size: 15px;
          color: #d4d4d8;
          background: rgba(255, 255, 255, 0.06);
          padding: 7px 18px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .desktop-window {
          width: 100%;
          max-width: 1820px;
          height: 980px;
          background: #18181b;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
        }
        .window-topbar {
          height: 38px;
          background: #27272a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 8px;
          flex-shrink: 0;
        }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red { background: #ef4444; }
        .dot.yellow { background: #eab308; }
        .dot.green { background: #22c55e; }
        .url-pill {
          margin-left: 20px;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 6px;
          padding: 4px 16px;
          font-size: 13px;
          color: #a1a1aa;
          font-family: monospace;
        }
        .screen-container {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .screen-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div class="left-meta">
          <div class="badge">
            <span class="pulse-dot"></span>
            ${stepBadge}
          </div>
          <div class="title">${headerTitle}</div>
        </div>
        <div class="highlight-text">${highlightText}</div>
      </div>
      <div class="desktop-window">
        <div class="window-topbar">
          <div class="dot red"></div>
          <div class="dot yellow"></div>
          <div class="dot green"></div>
          <div class="url-pill">thediningco.com/suman${currentPath} • The Grand Velvet Cafe</div>
        </div>
        <div class="screen-container">
          <img class="screen-img" src="data:image/png;base64,${desktopScreenshotBase64}" />
        </div>
      </div>
    </body>
    </html>
  `;
}

(async () => {
  console.log('🎬 Starting Cafe Owner Dashboard Demo Video with Voiceover...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const renderPage = await browser.newPage();
  await renderPage.setViewport({ width: 1920, height: 1080 });

  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  // Authenticate admin session
  console.log('Logging in as Cafe Admin...');
  await adminPage.goto('http://localhost:3001/suman/adminlogin', { waitUntil: 'networkidle2' });
  await adminPage.type('input[placeholder*="username" i], input[type="text"]', 'Suman');
  await adminPage.type('input[type="password"]', 'Suman@123');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});

  // 1. SCENE 1: Brand Intro Card with Voice
  console.log('Recording Scene 1: Intro Card...');
  const introText = "Welcome to The Dining Co. Cafe Owner Operating System. In this comprehensive tour, we will explore the complete management portal for The Grand Velvet Cafe.";
  const dur1 = generateVoice(introText, 'voice_01');
  const frames1 = Math.ceil(dur1 * 30) + 15;
  await renderPage.setContent(getTitleCardHtml(
    'Cafe Owner Operating System & Portal for',
    'A complete walk-through of every management page: Live Kitchen KDS, real-time analytics, dynamic menu controls, table QR generator, and direct UPI settlements.',
    'THE DINING CO. OWNER PORTAL',
    'The Grand Velvet Cafe'
  ));
  await saveFrame(renderPage, frames1);

  // 2. SCENE 2: Overview Analytics Dashboard (/suman/admin)
  console.log('Recording Scene 2: Overview Dashboard...');
  await adminPage.goto('http://localhost:3001/suman/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const snap2 = await adminPage.screenshot({ encoding: 'base64' });

  const text2 = "First, the Overview Dashboard gives cafe owners instant visibility into today's revenue, active table count, order velocity, and weekly sales performance at a glance.";
  const dur2 = generateVoice(text2, 'voice_02');
  const frames2 = Math.ceil(dur2 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap2,
    'Executive Overview & Live Analytics',
    'Dashboard Overview',
    'Real-time Revenue • Active Dining Tables • Order Volume',
    '/admin'
  ));
  await saveFrame(renderPage, frames2);

  // 3. SCENE 3: Live Kitchen Orders & KDS (/suman/admin/new-orders)
  console.log('Recording Scene 3: Live Kitchen Display (KDS)...');
  await adminPage.goto('http://localhost:3001/suman/admin/new-orders', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  const snap3 = await adminPage.screenshot({ encoding: 'base64' });

  const text3 = "Next, the Live Kitchen Display System. When a diner places an order from Table 4, kitchen staff hear an immediate audio chime. Special cooking requests like extra cheese, less spicy are highlighted in high-contrast gold, eliminating order mistakes.";
  const dur3 = generateVoice(text3, 'voice_03');
  const frames3 = Math.ceil(dur3 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap3,
    'Live Kitchen Display System (KDS)',
    'Real-Time Kitchen Orders',
    'Table 4 • Order #1011 • Golden Special Instructions Banner',
    '/admin/new-orders'
  ));
  await saveFrame(renderPage, frames3);

  // 4. SCENE 4: Orders History & Workflow (/suman/admin/orders)
  console.log('Recording Scene 4: Orders History...');
  await adminPage.goto('http://localhost:3001/suman/admin/orders', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const snap4 = await adminPage.screenshot({ encoding: 'base64' });

  const text4 = "The Orders section provides full historical tracking. Filter by preparing, ready, or served, view detailed item breakdowns, and monitor table turnover in real time.";
  const dur4 = generateVoice(text4, 'voice_04');
  const frames4 = Math.ceil(dur4 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap4,
    'Orders History & Stage Tracking',
    'Order Management',
    'Filter by Pending, Preparing, Ready, Served & Cancelled',
    '/admin/orders'
  ));
  await saveFrame(renderPage, frames4);

  // 5. SCENE 5: Payment Completed & Direct Settlement (/suman/admin/payment-completed)
  console.log('Recording Scene 5: Payment Completed...');
  await adminPage.goto('http://localhost:3001/suman/admin/payment-completed', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const snap5 = await adminPage.screenshot({ encoding: 'base64' });

  const text5 = "In Payment Completed, track all reconciled bills with zero percent commission. Whether guests pay via direct UPI QR or cash at the counter, money goes directly into your bank account.";
  const dur5 = generateVoice(text5, 'voice_05');
  const frames5 = Math.ceil(dur5 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap5,
    'Payment Completed & Zero-Commission Reconciliation',
    'Billing Settlements',
    'Direct UPI Transfers • Cash at Counter • Zero Middleman Fees',
    '/admin/payment-completed'
  ));
  await saveFrame(renderPage, frames5);

  // 6. SCENE 6: Manage Menu & Item Availability (/suman/admin/manage-menu)
  console.log('Recording Scene 6: Manage Menu...');
  await adminPage.goto('http://localhost:3001/suman/admin/manage-menu', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const snap6 = await adminPage.screenshot({ encoding: 'base64' });

  const text6 = "The Manage Menu suite lets you add new gourmet dishes, update prices on the fly, organize categories, and toggle sold-out items with one tap so guests never order an unavailable dish.";
  const dur6 = generateVoice(text6, 'voice_06');
  const frames6 = Math.ceil(dur6 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap6,
    'Dynamic Menu & Item Stock Controls',
    'Menu Management',
    '1-Tap Stock Availability Toggle • Live Price Edits • Category Sort',
    '/admin/manage-menu'
  ));
  await saveFrame(renderPage, frames6);

  // 7. SCENE 7: Table QR Code Generator (/suman/admin/qr-code)
  console.log('Recording Scene 7: Table QR Generator...');
  await adminPage.goto('http://localhost:3001/suman/admin/qr-code', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const snap7 = await adminPage.screenshot({ encoding: 'base64' });

  const text7 = "With the Table QR Code Generator, generate customized, high-resolution QR standees for every table in seconds, ready for instant printing and tabletop placement.";
  const dur7 = generateVoice(text7, 'voice_07');
  const frames7 = Math.ceil(dur7 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap7,
    'Instant Table QR Standee Generator',
    'Table QR Printing',
    'Configure Tables 1 to 50+ • Instant High-Res Downloads',
    '/admin/qr-code'
  ));
  await saveFrame(renderPage, frames7);

  // 8. SCENE 8: Customer Ratings & Reviews (/suman/admin/ratings)
  console.log('Recording Scene 8: Customer Ratings...');
  await adminPage.goto('http://localhost:3001/suman/admin/ratings', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const snap8 = await adminPage.screenshot({ encoding: 'base64' });

  const text8 = "The Customer Ratings portal collects authentic five-star reviews and praise tags immediately after every meal, giving you direct feedback to elevate food quality and guest satisfaction.";
  const dur8 = generateVoice(text8, 'voice_08');
  const frames8 = Math.ceil(dur8 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap8,
    'Live Customer Feedback & 5-Star Praise Tags',
    'Ratings Intelligence',
    'Post-Meal Diner Ratings • Praise Tags: Delicious Food, Great Vibe',
    '/admin/ratings'
  ));
  await saveFrame(renderPage, frames8);

  // 9. SCENE 9: Special Offers & Discount Engine (/suman/admin/offers)
  console.log('Recording Scene 9: Special Offers...');
  await adminPage.goto('http://localhost:3001/suman/admin/offers', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const snap9 = await adminPage.screenshot({ encoding: 'base64' });

  const text9 = "Boost slow dining hours with the Special Offers engine. Create percentage or flat discounts that automatically present to diners upon scanning and auto-apply at checkout.";
  const dur9 = generateVoice(text9, 'voice_09');
  const frames9 = Math.ceil(dur9 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap9,
    'Promotional Deals & Automated Coupon Engine',
    'Marketing Engine',
    'Flat 20% Off • Instant ₹100 Off • First Order Welcome Passes',
    '/admin/offers'
  ));
  await saveFrame(renderPage, frames9);

  // 10. SCENE 10: Cafe Settings (/suman/admin/settings)
  console.log('Recording Scene 10: Cafe Settings...');
  await adminPage.goto('http://localhost:3001/suman/admin/settings', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const snap10 = await adminPage.screenshot({ encoding: 'base64' });

  const text10 = "Finally, Cafe Settings allows you to configure your direct UPI receiving ID, customize applicable tax rates, manage staff credentials, and update restaurant details.";
  const dur10 = generateVoice(text10, 'voice_10');
  const frames10 = Math.ceil(dur10 * 30) + 15;
  await renderPage.setContent(getDesktopFrameHtml(
    snap10,
    'Direct Bank UPI & Restaurant Configuration',
    'System Settings',
    'UPI ID: suman.dining@oksbi • Tax Rates • Staff Access Controls',
    '/admin/settings'
  ));
  await saveFrame(renderPage, frames10);

  // 11. SCENE 11: Outro Card & Call to Action
  console.log('Recording Scene 11: Outro...');
  const outroText = "The Dining Co. brings enterprise restaurant technology to your cafe starting at just 999 rupees per month with zero commission. Contact us today to get started.";
  const dur11 = generateVoice(outroText, 'voice_11');
  const frames11 = Math.ceil(dur11 * 30) + 15;
  await renderPage.setContent(getTitleCardHtml(
    'Modernize Your Restaurant Today with',
    'Zero Commission • Instant Direct UPI Payments • Live Kitchen KDS • Just ₹999/month flat.',
    'ACTIVATE YOUR CAFE TODAY',
    'The Dining Co.'
  ));
  await saveFrame(renderPage, frames11);

  await browser.close();
  console.log(`✅ Rendered all ${frameIndex} frames to ${FRAMES_DIR}!`);

  // Concatenate all voice files into one master voice track
  console.log('Merging voiceover audio tracks...');
  const concatListPath = path.join(WORK_DIR, 'concat_list.txt');
  const concatContent = audioFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  const masterAudioPath = path.join(WORK_DIR, 'master_voice.wav');
  execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:a pcm_s16le "${masterAudioPath}"`);

  // Final Mux: Video Frames + Voiceover Track
  console.log('🎬 Muxing Video Frames + Voiceover into Full HD MP4...');
  const ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -f image2 -framerate 30 -i "${FRAMES_DIR}/frame_%05d.png" -i "${masterAudioPath}" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 20 -c:a aac -b:a 192k -shortest "${OUTPUT_MP4}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  fs.copyFileSync(OUTPUT_MP4, ARTIFACT_MP4);
  console.log(`🎉 CAFE OWNER DASHBOARD VIDEO CREATED SUCCESSFULLY:\n-> ${OUTPUT_MP4}\n-> ${ARTIFACT_MP4}`);
})();
