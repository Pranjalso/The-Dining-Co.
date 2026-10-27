const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK_DIR = '/tmp/customer_video_build';
const FRAMES_DIR = path.join(WORK_DIR, 'frames');
const AUDIO_DIR = path.join(WORK_DIR, 'audio');
const OUTPUT_MP4 = '/Users/pranjalsoni/Desktop/The Dining Co./The-Dining-Co./Customer-Menu-Ordering-Demo.mp4';
const ARTIFACT_MP4 = '/Users/pranjalsoni/.gemini/antigravity-ide/brain/ed3ae498-9ba8-422b-8442-48980162eab5/Customer-Menu-Ordering-Demo.mp4';

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

function getTitleCardHtml(title, subtitle, badgeText = 'THE DINING CO. GUEST EXPERIENCE', highlight = '') {
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
        <span>Contactless Digital Dining</span>
      </div>
    </body>
    </html>
  `;
}

function getMobileFrameHtml(mobileScreenshotBase64, headerTitle, stepBadge, notesText, extraBadge = '') {
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
          background: #0f0d0b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #fff;
          overflow: hidden;
          position: relative;
        }
        .bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(245, 158, 11, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.6;
        }
        .container {
          display: flex;
          align-items: center;
          gap: 90px;
          z-index: 10;
          max-width: 1700px;
          width: 100%;
          padding: 0 80px;
        }
        .info-panel {
          flex: 1;
        }
        .step-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 999px;
          color: #f59e0b;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 10px #f59e0b;
        }
        h2 {
          font-size: 46px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 20px;
          color: #ffffff;
        }
        p.desc {
          font-size: 20px;
          color: #a8a29e;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .feature-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .feature-text h4 {
          font-size: 16px;
          font-weight: 700;
          color: #f5f5f4;
          margin-bottom: 4px;
        }
        .feature-text p {
          font-size: 14px;
          color: #78716c;
          line-height: 1.4;
        }
        .phone-wrapper {
          width: 430px;
          height: 890px;
          background: #18181b;
          border-radius: 52px;
          padding: 12px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 40px rgba(245, 158, 11, 0.15);
          position: relative;
          flex-shrink: 0;
        }
        .phone-screen {
          width: 100%;
          height: 100%;
          border-radius: 42px;
          overflow: hidden;
          background: #000;
          position: relative;
        }
        .phone-notch {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 28px;
          background: #000;
          border-radius: 20px;
          z-index: 50;
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
      <div class="bg-pattern"></div>
      <div class="container">
        <div class="info-panel">
          <div class="step-badge">
            <span class="pulse-dot"></span>
            ${stepBadge}
          </div>
          <h2>${headerTitle}</h2>
          <p class="desc">${notesText}</p>
          <div class="feature-box">
            <div class="feature-icon">✨</div>
            <div class="feature-text">
              <h4>${extraBadge || 'Zero App Download Required'}</h4>
              <p>Guests scan Table 4 QR code, view beautiful categories with deals, customize items, and checkout in under 30 seconds.</p>
            </div>
          </div>
        </div>
        <div class="phone-wrapper">
          <div class="phone-screen">
            <div class="phone-notch"></div>
            <img class="screen-img" src="data:image/png;base64,${mobileScreenshotBase64}" />
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

(async () => {
  console.log('🎬 Starting Customer Digital Menu Demo Video with Voiceover...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const renderPage = await browser.newPage();
  await renderPage.setViewport({ width: 1920, height: 1080 });

  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 430, height: 890, deviceScaleFactor: 2 });

  // 1. SCENE 1: Intro Title Card
  console.log('Recording Scene 1: Intro Card...');
  const text1 = "Welcome to the digital dining experience powered by The Dining Co. Here is how easy, fast, and seamless contactless table ordering is at The Grand Velvet Cafe.";
  const dur1 = generateVoice(text1, 'cust_01');
  const frames1 = Math.ceil(dur1 * 30) + 15;
  await renderPage.setContent(getTitleCardHtml(
    'Contactless Digital Table Ordering at',
    'Experience seamless table QR scanning, cultural Namaste welcome, exclusive promotional deals, dish customization, and direct UPI payments.',
    'GUEST DINING EXPERIENCE',
    'The Grand Velvet Cafe'
  ));
  await saveFrame(renderPage, frames1);

  // 2. SCENE 2: Cultural Namaste Welcome Screen
  console.log('Recording Scene 2: Namaste Welcome Screen...');
  await mobilePage.goto('http://localhost:3001/suman/menu?table=4', { waitUntil: 'networkidle2' });
  let snap2 = await mobilePage.screenshot({ encoding: 'base64' });

  const text2 = "Guests sit at Table 4 and simply open their phone camera to scan the tabletop QR code. No app download is required. They are immediately greeted by our signature cultural Namaste welcome screen.";
  const dur2 = generateVoice(text2, 'cust_02');
  const frames2 = Math.ceil(dur2 * 30) + 15;
  await renderPage.setContent(getMobileFrameHtml(
    snap2,
    'Step 1: Contactless Scan & Cultural Welcome',
    'Table 4 Arrival',
    'Guests scan the standee QR code at Table 4 and are instantly greeted by The Grand Velvet Cafe branded Namaste portal.',
    'Zero Friction Onboarding'
  ));
  await saveFrame(renderPage, frames2);

  // Wait 1.6s for menu entrance animation
  await new Promise(r => setTimeout(r, 1600));

  // 3. SCENE 3: Active Deals & Privilege Coupons
  console.log('Recording Scene 3: Active Deals & Privilege Passes...');
  let snap3 = await mobilePage.screenshot({ encoding: 'base64' });

  const text3 = "Upon entering the menu, diners are presented with active promotional deals like Flat 20% Off. Tapping apply instantly attaches the discount to their table order.";
  const dur3 = generateVoice(text3, 'cust_03');
  const frames3 = Math.ceil(dur3 * 30) + 15;
  await renderPage.setContent(getMobileFrameHtml(
    snap3,
    'Step 2: Exclusive Table Deals & Discounts',
    'Promotional Offers',
    'Interactive promotional banners auto-apply discounts like Flat 20% Off, rewarding diners and increasing order value.',
    '1-Tap Privilege Pass'
  ));
  await saveFrame(renderPage, frames3);

  // 4. SCENE 4: Browse Gourmet Categories & Dishes
  console.log('Recording Scene 4: Browse Gourmet Categories...');
  await mobilePage.evaluate(() => window.scrollBy({ top: 320, behavior: 'smooth' }));
  await new Promise(r => setTimeout(r, 600));
  let snap4 = await mobilePage.screenshot({ encoding: 'base64' });

  const text4 = "Diners explore beautifully categorized menus with high-resolution photography, detailed ingredients, and dietary indicators. Everything is interactive, fast, and visually appetizing.";
  const dur4 = generateVoice(text4, 'cust_04');
  const frames4 = Math.ceil(dur4 * 30) + 15;
  await renderPage.setContent(getMobileFrameHtml(
    snap4,
    'Step 3: Browse Artisanal Gourmet Categories',
    'Interactive Menu',
    'Browse Appetizers, Starters, Artisanal Pizzas, Gourmet Burgers, and Desserts with dietary tags and clear pricing.',
    'Vibrant Dish Photography'
  ));
  await saveFrame(renderPage, frames4);

  // 5. SCENE 5: Add Dishes to Cart with Instant Feedback
  console.log('Recording Scene 5: Add Dishes to Cart...');
  await mobilePage.evaluate(() => {
    const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Add') || b.textContent.includes('+'));
    if (addBtns[0]) addBtns[0].click();
    if (addBtns[1]) addBtns[1].click();
  });
  await new Promise(r => setTimeout(r, 600));
  let snap5 = await mobilePage.screenshot({ encoding: 'base64' });

  const text5 = "Adding dishes to the cart is instant. The floating bottom checkout bar keeps diners informed of their selected items, discounts saved, and live order total.";
  const dur5 = generateVoice(text5, 'cust_05');
  const frames5 = Math.ceil(dur5 * 30) + 15;
  await renderPage.setContent(getMobileFrameHtml(
    snap5,
    'Step 4: 1-Tap Cart Add & Real-Time Total',
    'Cart Update',
    'The animated floating checkout bar tracks active items, savings, and table number in real time.',
    'Instant Visual Feedback'
  ));
  await saveFrame(renderPage, frames5);

  // 6. SCENE 6: Custom Special Kitchen Instructions
  console.log('Recording Scene 6: Special Kitchen Instructions...');
  await mobilePage.goto('http://localhost:3001/suman/menu/checkout?table=4', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));

  await mobilePage.evaluate(() => {
    const ta = document.querySelector('textarea');
    if (ta) {
      ta.value = 'extra cheess, less spicy please';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  let snap6 = await mobilePage.screenshot({ encoding: 'base64' });

  const text6 = "At checkout, guests can add custom cooking instructions for the chefs, such as extra cheese, less spicy. Our direct kitchen routing ensures chef accuracy every time.";
  const dur6 = generateVoice(text6, 'cust_06');
  const frames6 = Math.ceil(dur6 * 30) + 15;
  await renderPage.setContent(getMobileFrameHtml(
    snap6,
    'Step 5: Custom Cooking Requests & Instructions',
    'Kitchen Customization',
    'Diners enter specific preferences: "extra cheess, less spicy please". These notes appear highlighted in the kitchen.',
    'Guaranteed Kitchen Transmission'
  ));
  await saveFrame(renderPage, frames6);

  // 7. SCENE 7: Flexible Contactless Payment
  console.log('Recording Scene 7: Flexible Payment...');
  await mobilePage.goto('http://localhost:3001/suman/menu/checkout/payment?table=4&instructions=' + encodeURIComponent('extra cheess, less spicy please'), { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  let snap7 = await mobilePage.screenshot({ encoding: 'base64' });

  const text7 = "For payment, diners can scan the dynamic UPI QR code with any UPI app like Google Pay or PhonePe, or choose to pay cash at the counter with zero middleman fees.";
  const dur7 = generateVoice(text7, 'cust_07');
  const frames7 = Math.ceil(dur7 * 30) + 15;
  await renderPage.setContent(getMobileFrameHtml(
    snap7,
    'Step 6: Dynamic UPI QR & Counter Billing',
    'Frictionless Payment',
    'Supports instant GPay, PhonePe, Paytm QR scans or traditional pay-at-counter cash options.',
    '0% Platform Fee'
  ));
  await saveFrame(renderPage, frames7);

  // 8. SCENE 8: Real-Time Order Confirmed Receipt
  console.log('Recording Scene 8: Order Confirmation Receipt...');
  // Place fresh test order #1012 via API
  const orderRes = await fetch('http://localhost:3001/api/orders/suman', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tableNumber: '4',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      specialInstructions: 'extra cheess, less spicy please',
      notes: 'extra cheess, less spicy please',
      items: [
        { menuItemId: '6adf16cf77f6dc7958962610', name: 'Crispy Lotus Stem Chips', price: 220, quantity: 1 },
        { menuItemId: '6adf16cf77f6dc795896260f', name: 'Paneer Tikka Crostini', price: 260, quantity: 1 }
      ]
    })
  });
  const orderJson = await orderRes.json();
  const placedNum = orderJson.data ? orderJson.data.orderNumber : 1012;

  await mobilePage.goto(`http://localhost:3001/suman/menu/order-confirmation?orderNumber=${placedNum}&table=4`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  let snap8 = await mobilePage.screenshot({ encoding: 'base64' });

  const text8 = "Once placed, diners receive instant confirmation with an estimated preparation timer and verified kitchen request transmission. The counter confirms payment with an audible chime.";
  const dur8 = generateVoice(text8, 'cust_08');
  const frames8 = Math.ceil(dur8 * 30) + 15;
  await renderPage.setContent(getMobileFrameHtml(
    snap8,
    `Step 7: Order Confirmed (#${placedNum})`,
    'Order Placed',
    'Real-time receipt displays estimated kitchen preparation time, Table 4 tag, and verified special request.',
    'Harmonic Payment Chime'
  ));
  await saveFrame(renderPage, frames8);

  // 9. SCENE 9: Post-Meal 5-Star Feedback
  console.log('Recording Scene 9: Customer 5-Star Feedback...');
  await mobilePage.evaluate(() => {
    const ratingSec = document.getElementById('customer-rating-section');
    if (ratingSec) ratingSec.scrollIntoView({ behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 600));
  let snap9 = await mobilePage.screenshot({ encoding: 'base64' });

  const text9 = "After enjoying their meal, guests can leave five-star ratings and praise tags with a single tap, helping the cafe celebrate exceptional food and service.";
  const dur9 = generateVoice(text9, 'cust_09');
  const frames9 = Math.ceil(dur9 * 30) + 15;
  await renderPage.setContent(getMobileFrameHtml(
    snap9,
    'Step 8: Post-Meal 5-Star Rating & Praise Tags',
    'Guest Reviews',
    'Diners celebrate their experience with 5-star ratings and praise tags: Delicious Food, Quick Service, Great Vibe.',
    'Direct Staff Recognition'
  ));
  await saveFrame(renderPage, frames9);

  // 10. SCENE 10: Outro Card & Enjoy Your Meal
  console.log('Recording Scene 10: Outro...');
  const text10 = "The Dining Co. Contactless Digital Dining. Delicious food, zero wait time, and effortless ordering. Enjoy your meal!";
  const dur10 = generateVoice(text10, 'cust_10');
  const frames10 = Math.ceil(dur10 * 30) + 15;
  await renderPage.setContent(getTitleCardHtml(
    'Delicious Food • Zero Wait Time',
    'Thank you for dining with The Grand Velvet Cafe powered by The Dining Co.',
    'ENJOY YOUR MEAL',
    'The Dining Co.'
  ));
  await saveFrame(renderPage, frames10);

  await browser.close();
  console.log(`✅ Rendered all ${frameIndex} frames to ${FRAMES_DIR}!`);

  // Concatenate voiceover tracks
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
  console.log(`🎉 CUSTOMER MENU DEMO VIDEO CREATED SUCCESSFULLY:\n-> ${OUTPUT_MP4}\n-> ${ARTIFACT_MP4}`);
})();
