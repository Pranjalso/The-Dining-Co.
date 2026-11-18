/**
 * PDF & Print Utilities for Cafe Table Standees & QR Codes.
 * Generates standards-compliant, zero-dependency PDF documents directly in the browser
 * and provides pixel-perfect isolated iframe printing for table tent cards.
 */

import { QrCode, QrErrorCorrectionLevel } from "./qrcode";

export function formatTableLabel(t?: string): string {
  if (!t || t.trim().toLowerCase() === "general") return "General (No Table)";
  const trimmed = t.trim();
  if (/^table\s+/i.test(trimmed)) return trimmed;
  if (/^\d+$/.test(trimmed)) return `Table ${trimmed}`;
  return trimmed;
}

export function formatTableBadge(t?: string): string {
  if (!t || t.trim().toLowerCase() === "general") return "General Dine-In Menu";
  const trimmed = t.trim();
  if (/^table\s+/i.test(trimmed)) return trimmed;
  if (/^\d+$/.test(trimmed)) return `Table ${trimmed}`;
  return trimmed;
}

/**
 * Draws a high-resolution, print-ready 300-DPI table standee poster onto an HTML5 canvas.
 */
export function drawStandeeToCanvas(
  cafeName: string,
  tableLabel: string,
  url: string,
  accentColor = "#D97706"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 1700;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Background - pristine white
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Outer border & subtle inner margin
  const margin = 50;
  const cardW = width - margin * 2;
  const cardH = height - margin * 2;
  const radius = 48;

  // Draw card container border
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(margin, margin, cardW, cardH, radius);
  ctx.lineWidth = 8;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  // Subtle interior fill
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  // Top accent pill bar
  ctx.save();
  ctx.beginPath();
  const pillW = 200;
  const pillH = 16;
  ctx.roundRect((width - pillW) / 2, margin + 40, pillW, pillH, 8);
  ctx.fillStyle = accentColor;
  ctx.fill();
  ctx.restore();

  // 1. Brand Header: "THE DINING CO."
  ctx.save();
  ctx.fillStyle = accentColor;
  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "6px";
  ctx.fillText("THE DINING CO.", width / 2, margin + 100);
  ctx.restore();

  // 2. Cafe Name
  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 60px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Fit long cafe names
  let displayCafeName = cafeName;
  if (displayCafeName.length > 25) {
    ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }
  ctx.fillText(displayCafeName, width / 2, margin + 175);
  ctx.restore();

  // 3. Subheading: "DIGITAL MENU & ORDERING"
  ctx.save();
  ctx.fillStyle = "#6B7280";
  ctx.font = "700 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "3px";
  ctx.fillText("DIGITAL MENU & ORDERING", width / 2, margin + 235);
  ctx.restore();

  // 4. Table Badge Pill
  const badgeText = formatTableBadge(tableLabel);
  ctx.save();
  ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const badgeMetrics = ctx.measureText(badgeText);
  const badgePaddingX = 40;
  const badgeW = badgeMetrics.width + badgePaddingX * 2;
  const badgeH = 64;
  const badgeY = margin + 280;

  ctx.beginPath();
  ctx.roundRect((width - badgeW) / 2, badgeY, badgeW, badgeH, 32);
  ctx.fillStyle = "#FFFBEB";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  ctx.fillStyle = "#92400E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, width / 2, badgeY + badgeH / 2);
  ctx.restore();

  // 5. Draw QR Code in center
  const qrBoxSize = 640;
  const qrBoxY = margin + 380;
  const qrBoxX = (width - qrBoxSize) / 2;

  // QR box border & background
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 36);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#E5E7EB";
  ctx.stroke();
  ctx.restore();

  // Render QR Modules directly
  try {
    const qr = QrCode.encodeText(url, QrErrorCorrectionLevel.HIGH);
    const qrPadding = 48;
    const qrInnerSize = qrBoxSize - qrPadding * 2;
    const moduleSize = qrInnerSize / qr.size;

    ctx.save();
    ctx.fillStyle = "#000000";
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.getModule(x, y)) {
          const px = qrBoxX + qrPadding + x * moduleSize;
          const py = qrBoxY + qrPadding + y * moduleSize;
          ctx.fillRect(px, py, moduleSize + 0.5, moduleSize + 0.5);
        }
      }
    }
    ctx.restore();
  } catch (err) {
    console.error("Failed to render QR on canvas:", err);
  }

  // 6. Action CTA: "Scan to View Menu & Order"
  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Scan to View Menu & Order", width / 2, margin + 1100);
  ctx.restore();

  // 7. Explanatory Text
  ctx.save();
  ctx.fillStyle = "#4B5563";
  ctx.font = "500 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Open your phone camera or QR scanner to browse dishes and order.",
    width / 2,
    margin + 1155
  );
  ctx.restore();

  // 8. Bottom Divider Line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(margin + 120, margin + 1240);
  ctx.lineTo(width - margin - 120, margin + 1240);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#E5E7EB";
  ctx.stroke();
  ctx.restore();

  // 9. URL Link
  ctx.save();
  ctx.fillStyle = "#6B7280";
  ctx.font = "500 20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let displayUrl = url;
  if (displayUrl.length > 55) {
    displayUrl = displayUrl.substring(0, 52) + "...";
  }
  ctx.fillText(displayUrl, width / 2, margin + 1285);
  ctx.restore();

  return canvas;
}

/**
 * Creates a standards-compliant multi-page or single-page PDF document
 * from an array of JPEG image buffers without any external libraries.
 */
export function buildPdfFromJpegImages(
  images: Array<{ bytes: Uint8Array; width: number; height: number }>
): Blob {
  // A4 dimensions in PDF points (1/72 inch): 595.28 x 841.89
  const pageW = 595.28;
  const pageH = 841.89;

  let currentObjId = 3;
  const pageObjectIds: number[] = [];
  const bodyChunks: Uint8Array[] = [];

  const encoder = new TextEncoder();

  interface PageData {
    imgObj: Uint8Array;
    contentObj: Uint8Array;
    pageObj: Uint8Array;
  }
  const pages: PageData[] = [];

  for (let i = 0; i < images.length; i++) {
    const imgObjId = currentObjId++;
    const contentObjId = currentObjId++;
    const pageObjId = currentObjId++;
    pageObjectIds.push(pageObjId);

    const { bytes, width: imgW, height: imgH } = images[i];

    // Compute aspect-fit dimensions on A4
    const margin = 28.35; // 10mm
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    let renderW = maxW;
    let renderH = (imgH / imgW) * renderW;
    if (renderH > maxH) {
      renderH = maxH;
      renderW = (imgW / imgH) * renderH;
    }

    const posX = (pageW - renderW) / 2;
    const posY = (pageH - renderH) / 2;

    // 1. Image XObject
    const imgHeader = encoder.encode(
      `${imgObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`
    );
    const imgFooter = encoder.encode("\nendstream\nendobj\n");
    const imgObj = concatUint8Arrays([imgHeader, bytes, imgFooter]);

    // 2. Content Stream (draws image)
    const streamContent = `q ${renderW.toFixed(2)} 0 0 ${renderH.toFixed(2)} ${posX.toFixed(2)} ${posY.toFixed(2)} cm /Im0 Do Q`;
    const streamBytes = encoder.encode(streamContent);
    const contentObj = encoder.encode(
      `${contentObjId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`
    );

    // 3. Page Object
    const pageObj = encoder.encode(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 ${imgObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );

    pages.push({ imgObj, contentObj, pageObj });
  }

  // Header
  const header = encoder.encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const catalogObj = encoder.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const kidsStr = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  const pagesObj = encoder.encode(
    `2 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${pageObjectIds.length} >>\nendobj\n`
  );

  const objects: Uint8Array[] = [catalogObj, pagesObj];
  for (const p of pages) {
    objects.push(p.imgObj);
    objects.push(p.contentObj);
    objects.push(p.pageObj);
  }

  // Calculate byte offsets
  const offsets: number[] = [];
  let currentOffset = header.length;

  for (const obj of objects) {
    offsets.push(currentOffset);
    currentOffset += obj.length;
  }

  // XRef Table & Trailer
  const xrefOffset = currentOffset;
  let xrefStr = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xrefStr += off.toString().padStart(10, "0") + " 00000 n \n";
  }
  const trailerStr = `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const xrefBytes = encoder.encode(xrefStr + trailerStr);

  const allChunks = [header, ...objects, xrefBytes];
  return new Blob(allChunks as any, { type: "application/pdf" });
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Converts a Canvas to a JPEG Uint8Array byte buffer.
 */
export async function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  quality = 0.92
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to convert canvas to blob"));
          return;
        }
        const arrayBuffer = await blob.arrayBuffer();
        resolve(new Uint8Array(arrayBuffer));
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Triggers an immediate browser file download for a Blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}

/**
 * Generates and downloads a clean, multi-page or single-page PDF containing table standees.
 */
export async function downloadStandeesPdf(
  cafeName: string,
  items: Array<{ tableLabel: string; url: string }>,
  filename: string,
  accentColor = "#D97706"
): Promise<void> {
  const jpegImages: Array<{ bytes: Uint8Array; width: number; height: number }> = [];

  for (const item of items) {
    const canvas = drawStandeeToCanvas(cafeName, item.tableLabel, item.url, accentColor);
    const bytes = await canvasToJpegBytes(canvas, 0.93);
    jpegImages.push({ bytes, width: canvas.width, height: canvas.height });
  }

  const pdfBlob = buildPdfFromJpegImages(jpegImages);
  downloadBlob(pdfBlob, filename);
}

/**
 * Prints table standees in a completely isolated, clean iframe.
 * Ensures:
 * - Exactly one table per A4 page (`page-break-after: always`).
 * - No browser headers/footers (`@page { margin: 8mm; }`).
 * - No Next.js layout clipping, `h-screen`, or `overflow-hidden` bugs.
 * - Works perfectly with Chrome's "Save as PDF" and physical printers.
 */
export function printStandeesInIsolatedFrame(
  cafeName: string,
  items: Array<{ tableLabel: string; url: string; qrSvgPath: string; qrViewBoxSize: number }>,
  accentColor = "#D97706"
): void {
  // Remove any previous print iframes
  const existing = document.getElementById("the-dining-co-print-frame");
  if (existing) {
    existing.parentNode?.removeChild(existing);
  }

  const iframe = document.createElement("iframe");
  iframe.id = "the-dining-co-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const sheetsHtml = items
    .map((item) => {
      const badgeText = formatTableBadge(item.tableLabel);
      return `
        <div class="standee-sheet">
          <div class="standee-card">
            <div class="top-accent"></div>
            <div class="brand">THE DINING CO.</div>
            <h1 class="cafe-name">${escapeHtml(cafeName)}</h1>
            <div class="sub">DIGITAL MENU & ORDERING</div>
            
            <div class="table-badge">${escapeHtml(badgeText)}</div>

            <div class="qr-container">
              <svg viewBox="0 0 ${item.qrViewBoxSize} ${item.qrViewBoxSize}" class="qr-svg" fill="#000000">
                <path d="${item.qrSvgPath}" />
              </svg>
            </div>

            <div class="cta">Scan to View Menu & Order</div>
            <div class="help">Open your phone camera or QR scanner to browse dishes and place your order.</div>
            
            <div class="url">${escapeHtml(item.url)}</div>
          </div>
        </div>
      `;
    })
    .join("");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(cafeName)} - Table Standees</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111827;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .standee-sheet {
            width: 100%;
            height: 100vh;
            min-height: 275mm;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8mm 0;
          }
          .standee-sheet:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .standee-card {
            width: 400px;
            max-width: 90%;
            background: #ffffff;
            border: 3.5px solid ${accentColor};
            border-radius: 28px;
            padding: 32px 28px 24px 28px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
            margin: 0 auto;
          }
          .top-accent {
            width: 80px;
            height: 6px;
            background: ${accentColor};
            border-radius: 9999px;
            margin: 0 auto 14px auto;
          }
          .brand {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: ${accentColor};
            margin-bottom: 6px;
          }
          .cafe-name {
            font-size: 26px;
            font-weight: 800;
            color: #111827;
            margin: 0 0 4px 0;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }
          .sub {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 16px;
          }
          .table-badge {
            display: inline-block;
            background: #fffbeb;
            color: #92400e;
            border: 2px solid ${accentColor};
            font-weight: 800;
            font-size: 14px;
            padding: 5px 20px;
            border-radius: 9999px;
            margin-bottom: 16px;
          }
          .qr-container {
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 22px;
            padding: 14px;
            display: inline-block;
            margin-bottom: 16px;
          }
          .qr-svg {
            width: 220px;
            height: 220px;
            display: block;
          }
          .cta {
            font-size: 16px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 4px;
          }
          .help {
            font-size: 12px;
            color: #4b5563;
            max-width: 280px;
            margin: 0 auto 14px auto;
            line-height: 1.4;
          }
          .url {
            font-size: 10px;
            font-family: monospace;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            word-break: break-all;
            max-width: 300px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        ${sheetsHtml}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 4000);
  }, 250);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function drawRoundRectHelper(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof (ctx as any).roundRect === "function") {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

export interface MiniStandeeOptions {
  orientation?: "portrait" | "landscape";
  accentColor?: string;
  showGuides?: boolean;
}

/**
 * Draws a high-resolution, print-ready 300-DPI mini easel standee card onto an HTML5 canvas.
 * Dimensions:
 * - Outer card boundary (cut border): 57.5mm x 88mm (Portrait) or 88mm x 57.5mm (Landscape)
 * - Inner visible window: 45mm x 63mm (Portrait) or 63mm x 45mm (Landscape)
 * At 300 DPI: 1 mm ≈ 11.811 px.
 * - Portrait outer: 680 x 1040 px; Inner window: 532 x 744 px (Left/Right: 74px, Top/Bottom: 148px)
 * - Landscape outer: 1040 x 680 px; Inner window: 744 x 532 px (Left/Right: 148px, Top/Bottom: 74px)
 */
export function drawMiniStandeeToCanvas(
  cafeName: string,
  tableLabel: string,
  url: string,
  options: MiniStandeeOptions = {}
): HTMLCanvasElement {
  const orientation = options.orientation || "portrait";
  const accentColor = options.accentColor || "#D97706";
  const showGuides = options.showGuides !== false;

  const isPortrait = orientation === "portrait";
  const width = isPortrait ? 680 : 1040;
  const height = isPortrait ? 1040 : 680;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Background - pristine white
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Outer cutting dashed border (exact 57.5mm x 88mm / 88mm x 57.5mm)
  ctx.save();
  ctx.strokeStyle = "#9CA3AF";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(4, 4, width - 8, height - 8);
  ctx.restore();

  // Corner crop marks
  const cropLen = 22;
  ctx.save();
  ctx.strokeStyle = "#4B5563";
  ctx.lineWidth = 2;
  // Top-left
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cropLen, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, cropLen); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(width, 0); ctx.lineTo(width - cropLen, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(width, 0); ctx.lineTo(width, cropLen); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(0, height); ctx.lineTo(cropLen, height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, height); ctx.lineTo(0, height - cropLen); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(width, height); ctx.lineTo(width - cropLen, height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(width, height); ctx.lineTo(width, height - cropLen); ctx.stroke();
  ctx.restore();

  // Subtle cutting instruction in outer margin
  ctx.save();
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (isPortrait) {
    ctx.fillText("✂ CUT ALONG DASHED LINE (57.5 × 88 mm)", width / 2, 28);
  } else {
    ctx.fillText("✂ CUT ALONG DASHED LINE (88 × 57.5 mm)", width / 2, 22);
  }
  ctx.restore();

  // Inner visible window coordinates:
  // Portrait: 45mm x 63mm -> 532 x 744 px
  // Landscape: 63mm x 45mm -> 744 x 532 px
  const innerW = isPortrait ? 532 : 744;
  const innerH = isPortrait ? 744 : 532;
  const innerX = (width - innerW) / 2;
  const innerY = (height - innerH) / 2;

  // Faint guide for the inner visible window
  if (showGuides) {
    ctx.save();
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(innerX, innerY, innerW, innerH);
    ctx.restore();
  }

  // Draw content inside the inner window
  if (isPortrait) {
    // 1. Top accent pill
    ctx.save();
    ctx.beginPath();
    const pillW = 60;
    const pillH = 6;
    drawRoundRectHelper(ctx, innerX + (innerW - pillW) / 2, innerY + 20, pillW, pillH, 3);
    ctx.fillStyle = accentColor;
    ctx.fill();
    ctx.restore();

    // 2. "THE DINING CO." micro-brand
    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.font = "900 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "3px";
    ctx.fillText("THE DINING CO.", innerX + innerW / 2, innerY + 44);
    ctx.restore();

    // 3. Cafe Name
    ctx.save();
    ctx.fillStyle = "#111827";
    ctx.font = "800 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let displayName = cafeName;
    if (displayName.length > 20) {
      ctx.font = "800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
    ctx.fillText(displayName, innerX + innerW / 2, innerY + 84);
    ctx.restore();

    // 4. Table Badge Pill
    const badgeText = formatTableBadge(tableLabel);
    ctx.save();
    ctx.font = "800 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = Math.max(120, badgeMetrics.width + 36);
    const badgeH = 36;
    const badgeY = innerY + 118;
    ctx.beginPath();
    drawRoundRectHelper(ctx, innerX + (innerW - badgeW) / 2, badgeY, badgeW, badgeH, 18);
    ctx.fillStyle = "#FFFBEB";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = accentColor;
    ctx.stroke();
    ctx.fillStyle = "#92400E";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, innerX + innerW / 2, badgeY + badgeH / 2);
    ctx.restore();

    // 5. QR Code in Center (scannable size ~360px / approx 30mm)
    const qrBoxSize = 350;
    const qrBoxX = innerX + (innerW - qrBoxSize) / 2;
    const qrBoxY = innerY + 172;

    ctx.save();
    ctx.beginPath();
    drawRoundRectHelper(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#E5E7EB";
    ctx.stroke();
    ctx.restore();

    try {
      const qr = QrCode.encodeText(url, QrErrorCorrectionLevel.HIGH);
      const qrPadding = 24;
      const qrInnerSize = qrBoxSize - qrPadding * 2;
      const moduleSize = qrInnerSize / qr.size;

      ctx.save();
      ctx.fillStyle = "#000000";
      for (let y = 0; y < qr.size; y++) {
        for (let x = 0; x < qr.size; x++) {
          if (qr.getModule(x, y)) {
            const px = qrBoxX + qrPadding + x * moduleSize;
            const py = qrBoxY + qrPadding + y * moduleSize;
            ctx.fillRect(px, py, moduleSize + 0.3, moduleSize + 0.3);
          }
        }
      }
      ctx.restore();
    } catch (e) {
      console.error("QR render error:", e);
    }

    // 6. Action CTA: "Scan to View Menu & Order"
    ctx.save();
    ctx.fillStyle = "#111827";
    ctx.font = "800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scan to View Menu & Order", innerX + innerW / 2, innerY + 560);
    ctx.restore();

    // 7. Subtext
    ctx.save();
    ctx.fillStyle = "#4B5563";
    ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Open camera or QR scanner", innerX + innerW / 2, innerY + 592);
    ctx.restore();

    // 8. Mini URL
    ctx.save();
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "500 12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let shortUrl = url.replace(/^https?:\/\//, "");
    if (shortUrl.length > 32) shortUrl = shortUrl.substring(0, 30) + "...";
    ctx.fillText(shortUrl, innerX + innerW / 2, innerY + 624);
    ctx.restore();

  } else {
    // LANDSCAPE (63mm W x 45mm H inner)
    const leftW = 340;
    const rightW = innerW - leftW;

    // Brand
    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.font = "900 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "2px";
    ctx.fillText("THE DINING CO.", innerX + 24, innerY + 45);
    ctx.restore();

    // Cafe Name
    ctx.save();
    ctx.fillStyle = "#111827";
    ctx.font = "800 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let displayName = cafeName;
    if (displayName.length > 16) {
      ctx.font = "800 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
    ctx.fillText(displayName, innerX + 24, innerY + 95);
    ctx.restore();

    // Table Badge
    const badgeText = formatTableBadge(tableLabel);
    ctx.save();
    ctx.font = "800 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = Math.max(110, badgeMetrics.width + 30);
    const badgeH = 34;
    ctx.beginPath();
    drawRoundRectHelper(ctx, innerX + 24, innerY + 140, badgeW, badgeH, 17);
    ctx.fillStyle = "#FFFBEB";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = accentColor;
    ctx.stroke();
    ctx.fillStyle = "#92400E";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, innerX + 39, innerY + 140 + badgeH / 2);
    ctx.restore();

    // Action CTA
    ctx.save();
    ctx.fillStyle = "#111827";
    ctx.font = "800 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Scan to Order", innerX + 24, innerY + 225);
    ctx.restore();

    // Help
    ctx.save();
    ctx.fillStyle = "#6B7280";
    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Open camera or QR app", innerX + 24, innerY + 255);
    ctx.restore();

    // URL
    ctx.save();
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "500 11px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let shortUrl = url.replace(/^https?:\/\//, "");
    if (shortUrl.length > 25) shortUrl = shortUrl.substring(0, 23) + "...";
    ctx.fillText(shortUrl, innerX + 24, innerY + 285);
    ctx.restore();

    // Right Column: QR Code
    const qrBoxSize = 350;
    const qrBoxX = innerX + leftW + (rightW - qrBoxSize) / 2;
    const qrBoxY = innerY + (innerH - qrBoxSize) / 2;

    ctx.save();
    ctx.beginPath();
    drawRoundRectHelper(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#E5E7EB";
    ctx.stroke();
    ctx.restore();

    try {
      const qr = QrCode.encodeText(url, QrErrorCorrectionLevel.HIGH);
      const qrPadding = 24;
      const qrInnerSize = qrBoxSize - qrPadding * 2;
      const moduleSize = qrInnerSize / qr.size;

      ctx.save();
      ctx.fillStyle = "#000000";
      for (let y = 0; y < qr.size; y++) {
        for (let x = 0; x < qr.size; x++) {
          if (qr.getModule(x, y)) {
            const px = qrBoxX + qrPadding + x * moduleSize;
            const py = qrBoxY + qrPadding + y * moduleSize;
            ctx.fillRect(px, py, moduleSize + 0.3, moduleSize + 0.3);
          }
        }
      }
      ctx.restore();
    } catch (e) {
      console.error("QR render error:", e);
    }
  }

  return canvas;
}

/**
 * Renders an A4 print sheet (2480 x 3508 px at 300 DPI) containing a grid of mini standees.
 * For portrait cards (57.5mm x 88mm): 3 columns x 3 rows = 9 cards per A4 page!
 * For landscape cards (88mm x 57.5mm): 2 columns x 4 rows = 8 cards per A4 page!
 */
export function drawMiniStandeesA4SheetToCanvas(
  cafeName: string,
  items: Array<{ tableLabel: string; url: string }>,
  options: MiniStandeeOptions = {}
): HTMLCanvasElement {
  const orientation = options.orientation || "portrait";
  const accentColor = options.accentColor || "#D97706";
  const isPortrait = orientation === "portrait";

  const a4Canvas = document.createElement("canvas");
  a4Canvas.width = 2480;
  a4Canvas.height = 3508;

  const ctx = a4Canvas.getContext("2d");
  if (!ctx) return a4Canvas;

  // Background - white
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

  // Sheet Header text
  ctx.save();
  ctx.fillStyle = "#4B5563";
  ctx.font = "700 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `THE DINING CO. • ${cafeName.toUpperCase()} • MINI EASEL STANDEES (OUTER: 57.5 × 88 mm | INNER: 45 × 63 mm)`,
    a4Canvas.width / 2,
    80
  );
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Print at 100% scale (No scaling) and cut along dashed lines", a4Canvas.width / 2, 115);
  ctx.restore();

  if (isPortrait) {
    // 3 columns x 3 rows
    const cardW = 680;
    const cardH = 1040;
    const cols = 3;
    const rows = 3;
    const startX = (a4Canvas.width - cols * cardW) / 2; // (2480 - 2040) / 2 = 220px
    const startY = 160 + (a4Canvas.height - 160 - rows * cardH) / 2;

    const maxItems = Math.min(items.length, 9);
    for (let i = 0; i < maxItems; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cardW;
      const y = startY + row * cardH;

      const cardCanvas = drawMiniStandeeToCanvas(
        cafeName,
        items[i].tableLabel,
        items[i].url,
        { orientation: "portrait", accentColor, showGuides: true }
      );
      ctx.drawImage(cardCanvas, x, y);
    }
  } else {
    // 2 columns x 4 rows
    const cardW = 1040;
    const cardH = 680;
    const cols = 2;
    const rows = 4;
    const startX = (a4Canvas.width - cols * cardW) / 2; // (2480 - 2080) / 2 = 200px
    const startY = 160 + (a4Canvas.height - 160 - rows * cardH) / 2;

    const maxItems = Math.min(items.length, 8);
    for (let i = 0; i < maxItems; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cardW;
      const y = startY + row * cardH;

      const cardCanvas = drawMiniStandeeToCanvas(
        cafeName,
        items[i].tableLabel,
        items[i].url,
        { orientation: "landscape", accentColor, showGuides: true }
      );
      ctx.drawImage(cardCanvas, x, y);
    }
  }

  return a4Canvas;
}

/**
 * Downloads a high-resolution PDF for the Mini Easel Standees.
 * Can generate either a single card or an A4 cut-out sheet with 8-9 cards per page!
 */
export async function downloadMiniStandeesPdf(
  cafeName: string,
  items: Array<{ tableLabel: string; url: string }>,
  filename: string,
  options: MiniStandeeOptions = {}
): Promise<void> {
  const isPortrait = options.orientation !== "landscape";
  const itemsPerPage = isPortrait ? 9 : 8;
  const jpegImages: Array<{ bytes: Uint8Array; width: number; height: number }> = [];

  if (items.length === 1) {
    // For a single card, generate an A4 sheet with the card centered and cut lines
    const sheetCanvas = drawMiniStandeesA4SheetToCanvas(cafeName, items, options);
    const bytes = await canvasToJpegBytes(sheetCanvas, 0.94);
    jpegImages.push({ bytes, width: sheetCanvas.width, height: sheetCanvas.height });
  } else {
    // For bulk tables, chunk into pages of 9 (or 8 for landscape)
    for (let i = 0; i < items.length; i += itemsPerPage) {
      const pageItems = items.slice(i, i + itemsPerPage);
      const sheetCanvas = drawMiniStandeesA4SheetToCanvas(cafeName, pageItems, options);
      const bytes = await canvasToJpegBytes(sheetCanvas, 0.94);
      jpegImages.push({ bytes, width: sheetCanvas.width, height: sheetCanvas.height });
    }
  }

  const pdfBlob = buildPdfFromJpegImages(jpegImages);
  downloadBlob(pdfBlob, filename);
}

/**
 * Prints Mini Easel Standees using browser print in exact CSS millimeters.
 * Outer border: 57.5mm x 88mm. Inner window: 45mm x 63mm.
 */
export function printMiniStandeesInIsolatedFrame(
  cafeName: string,
  items: Array<{ tableLabel: string; url: string; qrSvgPath: string; qrViewBoxSize: number }>,
  options: MiniStandeeOptions = {}
): void {
  const existing = document.getElementById("the-dining-co-print-frame");
  if (existing) {
    existing.parentNode?.removeChild(existing);
  }

  const iframe = document.createElement("iframe");
  iframe.id = "the-dining-co-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const isPortrait = options.orientation !== "landscape";
  const accentColor = options.accentColor || "#D97706";
  const itemsPerPage = isPortrait ? 9 : 8;

  // Chunk items into pages
  const pages: Array<typeof items> = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage));
  }

  const pagesHtml = pages
    .map((pageItems, pageIdx) => {
      const cardsHtml = pageItems
        .map((item) => {
          const badgeText = formatTableBadge(item.tableLabel);
          if (isPortrait) {
            return `
              <div class="mini-card-portrait">
                <div class="cut-corner tl"></div>
                <div class="cut-corner tr"></div>
                <div class="cut-corner bl"></div>
                <div class="cut-corner br"></div>
                <div class="cut-label">✂ CUT (57.5 × 88 mm)</div>

                <div class="inner-window-portrait">
                  <div class="top-pill"></div>
                  <div class="mini-brand">THE DINING CO.</div>
                  <div class="mini-cafe-name">${escapeHtml(cafeName)}</div>
                  <div class="mini-table-badge">${escapeHtml(badgeText)}</div>

                  <div class="mini-qr-box">
                    <svg viewBox="0 0 ${item.qrViewBoxSize} ${item.qrViewBoxSize}" class="mini-qr-svg" fill="#000000">
                      <path d="${item.qrSvgPath}" />
                    </svg>
                  </div>

                  <div class="mini-cta">Scan to Order</div>
                  <div class="mini-sub">Open Camera • Scanner</div>
                  <div class="mini-url">${escapeHtml(item.url.replace(/^https?:\/\//, ""))}</div>
                </div>
              </div>
            `;
          } else {
            return `
              <div class="mini-card-landscape">
                <div class="cut-corner tl"></div>
                <div class="cut-corner tr"></div>
                <div class="cut-corner bl"></div>
                <div class="cut-corner br"></div>
                <div class="cut-label">✂ CUT (88 × 57.5 mm)</div>

                <div class="inner-window-landscape">
                  <div class="land-left">
                    <div class="mini-brand">THE DINING CO.</div>
                    <div class="mini-cafe-name">${escapeHtml(cafeName)}</div>
                    <div class="mini-table-badge">${escapeHtml(badgeText)}</div>
                    <div class="mini-cta">Scan to Order</div>
                    <div class="mini-sub">Camera • Scanner</div>
                    <div class="mini-url">${escapeHtml(item.url.replace(/^https?:\/\//, ""))}</div>
                  </div>

                  <div class="land-right">
                    <div class="mini-qr-box">
                      <svg viewBox="0 0 ${item.qrViewBoxSize} ${item.qrViewBoxSize}" class="mini-qr-svg-land" fill="#000000">
                        <path d="${item.qrSvgPath}" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }
        })
        .join("");

      return `
        <div class="a4-print-sheet">
          <div class="sheet-header">
            <span>THE DINING CO. • <strong>${escapeHtml(cafeName)}</strong> • MINI EASEL STANDEES</span>
            <span class="sheet-spec">Outer: ${isPortrait ? "57.5 × 88 mm" : "88 × 57.5 mm"} | Inner: ${isPortrait ? "45 × 63 mm" : "63 × 45 mm"}</span>
          </div>
          <div class="grid-container ${isPortrait ? "portrait-grid" : "landscape-grid"}">
            ${cardsHtml}
          </div>
        </div>
      `;
    })
    .join("");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(cafeName)} - Mini Easel Standees</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111827;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .a4-print-sheet {
            width: 100%;
            height: 100vh;
            min-height: 275mm;
            page-break-after: always;
            break-after: page;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4mm 0;
          }
          .a4-print-sheet:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .sheet-header {
            width: 100%;
            max-width: 185mm;
            margin-bottom: 4mm;
            padding-bottom: 2mm;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .sheet-spec {
            font-weight: 700;
            color: ${accentColor};
          }
          .portrait-grid {
            display: grid;
            grid-template-columns: repeat(3, 57.5mm);
            grid-template-rows: repeat(3, 88mm);
            gap: 2mm;
            justify-content: center;
            align-content: center;
          }
          .landscape-grid {
            display: grid;
            grid-template-columns: repeat(2, 88mm);
            grid-template-rows: repeat(4, 57.5mm);
            gap: 2mm;
            justify-content: center;
            align-content: center;
          }

          /* PORTRAIT CARD (Outer: 57.5mm x 88mm) */
          .mini-card-portrait {
            width: 57.5mm;
            height: 88mm;
            border: 1px dashed #9ca3af;
            background: #ffffff;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }

          /* LANDSCAPE CARD (Outer: 88mm x 57.5mm) */
          .mini-card-landscape {
            width: 88mm;
            height: 57.5mm;
            border: 1px dashed #9ca3af;
            background: #ffffff;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }

          .cut-label {
            position: absolute;
            top: 1.5mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 5pt;
            font-weight: 600;
            color: #9ca3af;
            letter-spacing: 0.05em;
          }

          .cut-corner {
            position: absolute;
            width: 3mm;
            height: 3mm;
            border-color: #4b5563;
            border-style: solid;
          }
          .cut-corner.tl { top: -0.5px; left: -0.5px; border-width: 1px 0 0 1px; }
          .cut-corner.tr { top: -0.5px; right: -0.5px; border-width: 1px 1px 0 0; }
          .cut-corner.bl { bottom: -0.5px; left: -0.5px; border-width: 0 0 1px 1px; }
          .cut-corner.br { bottom: -0.5px; right: -0.5px; border-width: 0 1px 1px 0; }

          /* INNER VISIBLE WINDOW (Portrait: 45mm x 63mm) */
          .inner-window-portrait {
            width: 45mm;
            height: 63mm;
            border: 1px dashed #e5e7eb;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 2mm 1.5mm 1.5mm 1.5mm;
            text-align: center;
          }

          /* INNER VISIBLE WINDOW (Landscape: 63mm x 45mm) */
          .inner-window-landscape {
            width: 63mm;
            height: 45mm;
            border: 1px dashed #e5e7eb;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2mm 2.5mm;
          }

          .land-left {
            width: 30mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            text-align: left;
          }
          .land-right {
            width: 28mm;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .top-pill {
            width: 12mm;
            height: 1mm;
            background: ${accentColor};
            border-radius: 9999px;
            margin-bottom: 0.5mm;
          }
          .mini-brand {
            font-size: 4.5pt;
            font-weight: 900;
            letter-spacing: 0.15em;
            color: ${accentColor};
            text-transform: uppercase;
            line-height: 1;
          }
          .mini-cafe-name {
            font-size: 7.5pt;
            font-weight: 800;
            color: #111827;
            line-height: 1.1;
            margin: 0.5mm 0;
            max-width: 42mm;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .mini-table-badge {
            background: #fffbeb;
            color: #92400e;
            border: 0.75px solid ${accentColor};
            border-radius: 9999px;
            font-size: 5.5pt;
            font-weight: 800;
            padding: 0.5mm 2.5mm;
            line-height: 1.2;
            display: inline-block;
          }
          .mini-qr-box {
            background: #ffffff;
            border: 0.75px solid #e5e7eb;
            border-radius: 2mm;
            padding: 1mm;
            display: inline-block;
          }
          .mini-qr-svg {
            width: 27mm;
            height: 27mm;
            display: block;
          }
          .mini-qr-svg-land {
            width: 26mm;
            height: 26mm;
            display: block;
          }
          .mini-cta {
            font-size: 5.5pt;
            font-weight: 800;
            color: #111827;
            line-height: 1.1;
          }
          .mini-sub {
            font-size: 4pt;
            color: #4b5563;
            line-height: 1;
          }
          .mini-url {
            font-size: 3.5pt;
            font-family: monospace;
            color: #9ca3af;
            max-width: 42mm;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 4000);
  }, 250);
}

