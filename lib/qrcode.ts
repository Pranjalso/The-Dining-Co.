/**
 * Self-contained, zero-dependency QR Code generator in TypeScript.
 * Based on Project Nayuki's standard QR Code generator library.
 * Generates standards-compliant QR Codes (ISO/IEC 18004) for any URL or text.
 */

export const QrErrorCorrectionLevel = {
  LOW: 0,
  MEDIUM: 1,
  QUARTILE: 2,
  HIGH: 3,
} as const;
export type QrErrorCorrectionLevel = typeof QrErrorCorrectionLevel[keyof typeof QrErrorCorrectionLevel];

export class QrCode {
  public readonly version: number;
  public readonly size: number;
  public readonly errorCorrectionLevel: QrErrorCorrectionLevel;
  public readonly mask: number;
  private readonly modules: boolean[][];

  private constructor(
    version: number,
    ecl: QrErrorCorrectionLevel,
    dataCodewords: Uint8Array,
    mask: number
  ) {
    if (version < 1 || version > 40) throw new RangeError("Version out of range");
    if (mask < -1 || mask > 7) throw new RangeError("Mask out of range");
    this.version = version;
    this.size = version * 4 + 17;
    this.errorCorrectionLevel = ecl;
    this.mask = mask;

    // Initialize modules matrix
    this.modules = [];
    const isFunction: boolean[][] = [];
    for (let y = 0; y < this.size; y++) {
      this.modules.push(new Array(this.size).fill(false));
      isFunction.push(new Array(this.size).fill(false));
    }

    // Draw function patterns
    this.drawFunctionPatterns(isFunction);
    const allCodewords = this.addEccAndInterleave(dataCodewords);
    this.drawCodewords(allCodewords, isFunction);

    // If mask is -1 (auto), pick the one with lowest penalty
    if (mask === -1) {
      let minPenalty = 1e9;
      let bestMask = 0;
      for (let m = 0; m < 8; m++) {
        this.applyMask(m, isFunction);
        this.drawFormatBits(m);
        const penalty = this.getPenaltyScore();
        if (penalty < minPenalty) {
          minPenalty = penalty;
          bestMask = m;
        }
        this.applyMask(m, isFunction); // Undoes mask
      }
      this.mask = bestMask;
    }

    this.applyMask(this.mask, isFunction);
    this.drawFormatBits(this.mask);
  }

  public getModule(x: number, y: number): boolean {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.modules[y][x];
    }
    return false;
  }

  public static encodeText(
    text: string,
    ecl: QrErrorCorrectionLevel = QrErrorCorrectionLevel.MEDIUM
  ): QrCode {
    const bytes = new TextEncoder().encode(text);
    // Find minimum version that fits data
    for (let version = 1; version <= 40; version++) {
      const dataCapacity = QrCode.getNumDataCodewords(version, ecl);
      // Byte mode header: 4 bits mode + (version < 10 ? 8 : 16) bits count + 8 * length
      const countBits = version < 10 ? 8 : 16;
      const totalBits = 4 + countBits + bytes.length * 8;
      if (totalBits <= dataCapacity * 8) {
        // Fits in this version!
        const bb = new BitBuffer();
        bb.appendBits(0b0100, 4); // Byte mode
        bb.appendBits(bytes.length, countBits);
        for (const b of bytes) {
          bb.appendBits(b, 8);
        }
        // Terminator
        bb.appendBits(0, Math.min(4, dataCapacity * 8 - bb.length));
        // Byte align
        if (bb.length % 8 !== 0) {
          bb.appendBits(0, 8 - (bb.length % 8));
        }
        // Pad bytes
        const padBytes = [0xec, 0x11];
        let padIdx = 0;
        while (bb.length < dataCapacity * 8) {
          bb.appendBits(padBytes[padIdx], 8);
          padIdx = (padIdx + 1) % 2;
        }

        const dataCodewords = new Uint8Array(dataCapacity);
        for (let i = 0; i < dataCapacity; i++) {
          dataCodewords[i] = bb.getByte(i);
        }

        return new QrCode(version, ecl, dataCodewords, -1);
      }
    }
    throw new Error("Text too long to fit in a QR Code");
  }

  private drawFunctionPatterns(isFunction: boolean[][]): void {
    // Timing patterns
    for (let i = 0; i < this.size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0, isFunction);
      this.setFunctionModule(i, 6, i % 2 === 0, isFunction);
    }

    // Finder patterns & separators
    this.drawFinderPattern(3, 3, isFunction);
    this.drawFinderPattern(this.size - 4, 3, isFunction);
    this.drawFinderPattern(3, this.size - 4, isFunction);

    // Alignment patterns
    const alignPositions = QrCode.getAlignmentPatternPositions(this.version);
    const numAlign = alignPositions.length;
    for (let i = 0; i < numAlign; i++) {
      for (let j = 0; j < numAlign; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === 0 && j === numAlign - 1) ||
          (i === numAlign - 1 && j === 0)
        ) {
          continue; // Skips finders
        }
        this.drawAlignmentPattern(alignPositions[i], alignPositions[j], isFunction);
      }
    }

    // Reserve format bits
    for (let i = 0; i <= 8; i++) {
      if (i !== 6) {
        this.setFunctionModule(8, i, false, isFunction);
        this.setFunctionModule(i, 8, false, isFunction);
      }
    }
    for (let i = 0; i < 8; i++) {
      this.setFunctionModule(this.size - 1 - i, 8, false, isFunction);
      this.setFunctionModule(8, this.size - 1 - i, false, isFunction);
    }
    this.setFunctionModule(8, this.size - 8, true, isFunction); // Dark module

    // Version info
    if (this.version >= 7) {
      let rem = this.version;
      for (let i = 0; i < 12; i++) {
        rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      }
      const bits = (this.version << 12) | rem;
      for (let i = 0; i < 18; i++) {
        const bit = ((bits >>> i) & 1) !== 0;
        const a = this.size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        this.setFunctionModule(a, b, bit, isFunction);
        this.setFunctionModule(b, a, bit, isFunction);
      }
    }
  }

  private drawFinderPattern(x: number, y: number, isFunction: boolean[][]): void {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const px = x + dx;
        const py = y + dy;
        if (px >= 0 && px < this.size && py >= 0 && py < this.size) {
          this.setFunctionModule(px, py, dist !== 2 && dist !== 4, isFunction);
        }
      }
    }
  }

  private drawAlignmentPattern(x: number, y: number, isFunction: boolean[][]): void {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        this.setFunctionModule(x + dx, y + dy, dist !== 1, isFunction);
      }
    }
  }

  private setFunctionModule(x: number, y: number, isDark: boolean, isFunction: boolean[][]): void {
    this.modules[y][x] = isDark;
    isFunction[y][x] = true;
  }

  // ISO 18004 format bits for error correction: Low=01, Med=00, Quartile=11, High=10
  private static readonly ECC_FORMAT_BITS = [1, 0, 3, 2];

  private drawFormatBits(mask: number): void {
    // 15 format bits
    const data = (QrCode.ECC_FORMAT_BITS[this.errorCorrectionLevel] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) {
      rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    }
    const bits = ((data << 10) | rem) ^ 0x5412;
    const getBit = (i: number) => ((bits >>> i) & 1) !== 0;

    // Draw first copy
    for (let i = 0; i <= 5; i++) this.modules[i][8] = getBit(i);
    this.modules[7][8] = getBit(6);
    this.modules[8][8] = getBit(7);
    this.modules[8][7] = getBit(8);
    for (let i = 9; i < 15; i++) this.modules[8][14 - i] = getBit(i);

    // Draw second copy
    for (let i = 0; i < 8; i++) this.modules[8][this.size - 1 - i] = getBit(i);
    for (let i = 8; i < 15; i++) this.modules[this.size - 15 + i][8] = getBit(i);
    this.modules[this.size - 8][8] = true; // Always dark module
  }

  private addEccAndInterleave(data: Uint8Array): Uint8Array {
    const ver = this.version;
    const ecl = this.errorCorrectionLevel;
    const numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl][ver];
    const blockEccLen = QrCode.ECC_CODEWORDS_PER_BLOCK[ecl][ver];
    const rawCodewords = Math.floor(QrCode.getNumRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const rsDivisor = QrCode.reedSolomonComputeDivisor(blockEccLen);
    const blocks: Uint8Array[] = [];
    const eccBlocks: Uint8Array[] = [];

    let k = 0;
    for (let i = 0; i < numBlocks; i++) {
      const dataLen = shortBlockLen - blockEccLen + (i >= numShortBlocks ? 1 : 0);
      const blockData = data.slice(k, k + dataLen);
      k += dataLen;
      blocks.push(blockData);
      eccBlocks.push(QrCode.reedSolomonComputeRemainder(blockData, rsDivisor));
    }

    // Interleave
    const result = new Uint8Array(rawCodewords);
    let p = 0;
    for (let i = 0; i < shortBlockLen - blockEccLen + 1; i++) {
      for (let j = 0; j < numBlocks; j++) {
        if (i < blocks[j].length) {
          result[p++] = blocks[j][i];
        }
      }
    }
    for (let i = 0; i < blockEccLen; i++) {
      for (let j = 0; j < numBlocks; j++) {
        result[p++] = eccBlocks[j][i];
      }
    }
    return result;
  }

  private drawCodewords(allCodewords: Uint8Array, isFunction: boolean[][]): void {
    let bitIndex = 0;
    let right = this.size - 1;
    let upward = true;

    while (right > 0) {
      if (right === 6) right--; // Skip vertical timing pattern
      for (let vert = 0; vert < this.size; vert++) {
        const y = upward ? this.size - 1 - vert : vert;
        for (let i = 0; i < 2; i++) {
          const x = right - i;
          if (!isFunction[y][x]) {
            let isDark = false;
            if (bitIndex < allCodewords.length * 8) {
              const byteVal = allCodewords[Math.floor(bitIndex / 8)];
              isDark = ((byteVal >>> (7 - (bitIndex % 8))) & 1) !== 0;
              bitIndex++;
            }
            this.modules[y][x] = isDark;
          }
        }
      }
      upward = !upward;
      right -= 2;
    }
  }

  private applyMask(mask: number, isFunction: boolean[][]): void {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (!isFunction[y][x]) {
          let invert = false;
          switch (mask) {
            case 0: invert = (x + y) % 2 === 0; break;
            case 1: invert = y % 2 === 0; break;
            case 2: invert = x % 3 === 0; break;
            case 3: invert = (x + y) % 3 === 0; break;
            case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
            case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
            case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
            case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          }
          if (invert) this.modules[y][x] = !this.modules[y][x];
        }
      }
    }
  }

  private getPenaltyScore(): number {
    let penalty = 0;
    // Penalty 1: Row and column 5+ in a row
    for (let y = 0; y < this.size; y++) {
      let runColor = false;
      let runVal = 0;
      for (let x = 0; x < this.size; x++) {
        if (x === 0 || this.modules[y][x] !== runColor) {
          runColor = this.modules[y][x];
          runVal = 1;
        } else {
          runVal++;
          if (runVal === 5) penalty += 3;
          else if (runVal > 5) penalty += 1;
        }
      }
    }
    for (let x = 0; x < this.size; x++) {
      let runColor = false;
      let runVal = 0;
      for (let y = 0; y < this.size; y++) {
        if (y === 0 || this.modules[y][x] !== runColor) {
          runColor = this.modules[y][x];
          runVal = 1;
        } else {
          runVal++;
          if (runVal === 5) penalty += 3;
          else if (runVal > 5) penalty += 1;
        }
      }
    }
    // Penalty 2: 2x2 blocks of same color
    for (let y = 0; y < this.size - 1; y++) {
      for (let x = 0; x < this.size - 1; x++) {
        const color = this.modules[y][x];
        if (
          color === this.modules[y][x + 1] &&
          color === this.modules[y + 1][x] &&
          color === this.modules[y + 1][x + 1]
        ) {
          penalty += 3;
        }
      }
    }
    // Penalty 4: Dark/light module ratio imbalance
    let totalDark = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x]) totalDark++;
      }
    }
    const totalModules = this.size * this.size;
    const darkPercentage = Math.floor((totalDark * 100) / totalModules);
    const k = Math.floor(Math.abs(darkPercentage - 50) / 5);
    penalty += k * 10;

    return penalty;
  }

  // --- Static Tables & Math ---
  public static getNumDataCodewords(ver: number, ecl: QrErrorCorrectionLevel): number {
    return (
      Math.floor(QrCode.getNumRawDataModules(ver) / 8) -
      QrCode.ECC_CODEWORDS_PER_BLOCK[ecl][ver] *
      QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl][ver]
    );
  }

  private static getNumRawDataModules(ver: number): number {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  private static getAlignmentPatternPositions(ver: number): number[] {
    if (ver === 1) return [];
    const numAlign = Math.floor(ver / 7) + 2;
    const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const result = [6];
    for (let pos = ver * 4 + 10; result.length < numAlign; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }

  private static reedSolomonComputeDivisor(degree: number): Uint8Array {
    const result = new Uint8Array(degree);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < degree; j++) {
        result[j] = QrCode.reedSolomonMultiply(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = QrCode.reedSolomonMultiply(root, 0x02);
    }
    return result;
  }

  private static reedSolomonComputeRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
    const result = new Uint8Array(divisor.length);
    for (const b of data) {
      const factor = b ^ result[0];
      for (let i = 0; i < divisor.length - 1; i++) {
        result[i] = result[i + 1] ^ QrCode.reedSolomonMultiply(divisor[i], factor);
      }
      result[divisor.length - 1] = QrCode.reedSolomonMultiply(divisor[divisor.length - 1], factor);
    }
    return result;
  }

  private static reedSolomonMultiply(x: number, y: number): number {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  // Lookups
  private static readonly ECC_CODEWORDS_PER_BLOCK: number[][] = [
    // L
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    // M
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    // Q
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    // H
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  ];

  private static readonly NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
    // L
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    // M
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    // Q
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    // H
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 72, 74, 77],
  ];
}

class BitBuffer {
  private buffer: number[] = [];
  public length = 0;

  public appendBits(val: number, len: number): void {
    for (let i = len - 1; i >= 0; i--) {
      this.buffer.push((val >>> i) & 1);
    }
    this.length += len;
  }

  public getByte(index: number): number {
    let b = 0;
    for (let i = 0; i < 8; i++) {
      b = (b << 1) | this.buffer[index * 8 + i];
    }
    return b;
  }
}

/**
 * Generates an SVG path string for the QR code modules.
 */
export function generateQrSvgPath(qr: QrCode, margin = 2): { path: string; viewBoxSize: number } {
  const size = qr.size;
  const viewBoxSize = size + margin * 2;
  const parts: string[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (qr.getModule(x, y)) {
        parts.push(`M${x + margin},${y + margin}h1v1h-1z`);
      }
    }
  }

  return { path: parts.join(" "), viewBoxSize };
}

/**
 * Draws a QR code on an HTML5 canvas at any desired pixel resolution (e.g. 1024x1024).
 */
export function drawQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options?: {
    size?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
    logoUrl?: string;
  }
): void {
  const qr = QrCode.encodeText(text, QrErrorCorrectionLevel.HIGH);
  const canvasSize = options?.size || 1024;
  const margin = options?.margin !== undefined ? options?.margin : 4;
  const darkColor = options?.darkColor || "#000000";
  const lightColor = options?.lightColor || "#FFFFFF";

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Modules
  const totalModules = qr.size + margin * 2;
  const moduleSize = canvasSize / totalModules;

  ctx.fillStyle = darkColor;
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        const px = (x + margin) * moduleSize;
        const py = (y + margin) * moduleSize;
        ctx.fillRect(px, py, moduleSize + 0.5, moduleSize + 0.5);
      }
    }
  }
}

/**
 * Returns a high-resolution PNG data URL for downloading or printing.
 */
export function getQrPngDataUrl(
  text: string,
  size = 1024,
  margin = 4,
  darkColor = "#000000",
  lightColor = "#FFFFFF"
): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  drawQrToCanvas(canvas, text, { size, margin, darkColor, lightColor });
  return canvas.toDataURL("image/png");
}

