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
