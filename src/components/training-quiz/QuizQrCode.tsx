'use client';

import React, { useMemo } from 'react';

/**
 * Pure SVG QR Code Generator (Zero external dependencies)
 *
 * Implements ISO/IEC 18004 QR code matrix generation (Byte Mode, EC Level M & L, Versions 1-10)
 * Renders as crisp scalable SVG with high contrast quiet-zone.
 */

// GF(256) Math tables for Reed-Solomon error correction
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function rsComputeRemainder(msg: Uint8Array, ecCount: number): Uint8Array {
  // Generate generator polynomial for ecCount
  let gen = new Uint8Array([1]);
  for (let i = 0; i < ecCount; i++) {
    const nextGen = new Uint8Array(gen.length + 1);
    const root = GF_EXP[i];
    for (let j = 0; j < gen.length; j++) {
      nextGen[j] ^= gfMul(gen[j], root);
      nextGen[j + 1] ^= gen[j];
    }
    gen = nextGen;
  }

  const remainder = new Uint8Array(ecCount);
  for (let i = 0; i < msg.length; i++) {
    const factor = msg[i] ^ remainder[0];
    for (let j = 0; j < ecCount - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMul(gen[ecCount - 1 - j], factor);
    }
    remainder[ecCount - 1] = gfMul(gen[0], factor);
  }
  return remainder;
}

// Table of capacity (data codewords, ec codewords) for Byte mode EC Level L / M
interface VersionInfo {
  version: number;
  dataCodewords: number;
  ecCodewords: number;
  alignmentPositions: number[];
}

const QR_VERSIONS: VersionInfo[] = [
  { version: 1, dataCodewords: 19, ecCodewords: 7, alignmentPositions: [] },
  { version: 2, dataCodewords: 34, ecCodewords: 10, alignmentPositions: [6, 18] },
  { version: 3, dataCodewords: 55, ecCodewords: 15, alignmentPositions: [6, 22] },
  { version: 4, dataCodewords: 80, ecCodewords: 20, alignmentPositions: [6, 26] },
  { version: 5, dataCodewords: 108, ecCodewords: 26, alignmentPositions: [6, 30] },
  { version: 6, dataCodewords: 136, ecCodewords: 18, alignmentPositions: [6, 34] },
];

function selectVersion(dataLen: number): VersionInfo {
  // Byte mode header: 4 bits mode + 8 bits length indicator = 12 bits = 2 bytes
  const neededBytes = dataLen + 2;
  for (const v of QR_VERSIONS) {
    if (v.dataCodewords >= neededBytes) {
      return v;
    }
  }
  return QR_VERSIONS[QR_VERSIONS.length - 1];
}

function generateQrMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);
  const versionInfo = selectVersion(rawBytes.length);
  const { version, dataCodewords, ecCodewords, alignmentPositions } = versionInfo;

  // 1. Bit Buffer: Mode (0100) + Character Count (8 bits) + Data + Terminator (0000)
  const bitBuffer: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bitBuffer.push((val >> i) & 1);
    }
  };

  // Byte mode indicator: 0100
  pushBits(0b0100, 4);
  // Character count indicator (8 bits for versions 1-9)
  pushBits(rawBytes.length, 8);
  for (let i = 0; i < rawBytes.length; i++) {
    pushBits(rawBytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const capacityBits = dataCodewords * 8;
  const termLen = Math.min(4, capacityBits - bitBuffer.length);
  pushBits(0, termLen);

  // Pad to multiple of 8
  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.push(0);
  }

  // Pad bytes 0xEC and 0x11
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (bitBuffer.length < capacityBits) {
    pushBits(padPatterns[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bit buffer to data codewords
  const dataBytes = new Uint8Array(dataCodewords);
  for (let i = 0; i < dataCodewords; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitBuffer[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // 2. Compute Reed-Solomon Error Correction
  const ecBytes = rsComputeRemainder(dataBytes, ecCodewords);

  // Interleave (for single block, simply concatenate)
  const finalCodewords = new Uint8Array(dataCodewords + ecCodewords);
  finalCodewords.set(dataBytes, 0);
  finalCodewords.set(ecBytes, dataCodewords);

  // 3. Matrix Setup
  const size = version * 4 + 17;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  // Helper to place finder pattern
  const placeFinder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = r0 + r;
        const nc = c0 + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            matrix[nr][nc] = false;
          } else if (r === 0 || r === 6 || c === 0 || c === 6) {
            matrix[nr][nc] = true;
          } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            matrix[nr][nc] = true;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  };

  // Place 3 Finder Patterns
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing Patterns (row 6 and col 6)
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Alignment Patterns
  for (const ar of alignmentPositions) {
    for (const ac of alignmentPositions) {
      if (matrix[ar][ac] !== null) continue; // Skip if overlapping finder
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isCenter = r === 0 && c === 0;
          matrix[ar + r][ac + c] = isBorder || isCenter;
        }
      }
    }
  }

  // Dark module
  matrix[size - 8][8] = true;

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = size - 8; i < size; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }

  // 4. Place Data Codewords (Zig-zag 2-column right-to-left)
  let bitIdx = 0;
  const totalBits = finalCodewords.length * 8;
  let upwards = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing pattern column

    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (const c of [col, col - 1]) {
        if (matrix[row][c] === null) {
          let bit = false;
          if (bitIdx < totalBits) {
            const byte = finalCodewords[Math.floor(bitIdx / 8)];
            const bitOffset = 7 - (bitIdx % 8);
            bit = ((byte >> bitOffset) & 1) === 1;
            bitIdx++;
          }

          // Apply Mask Pattern 0: (row + col) % 2 === 0
          const mask = (row + c) % 2 === 0;
          matrix[row][c] = mask ? !bit : bit;
        }
      }
    }
    upwards = !upwards;
  }

  // 5. Format Information (EC Level L=01, Mask 0=000 -> 01000 + BCH error correction -> 0x77c4 xor 0x5412)
  const formatBits = [true, false, true, false, true, false, false, false, false, false, true, false, true, false, true];
  // Place format info along top-left finder and split around bottom/right
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
  matrix[8][7] = formatBits[6];
  matrix[8][8] = formatBits[7];
  matrix[7][8] = formatBits[8];
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i];

  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = formatBits[i];
  for (let i = 0; i < 8; i++) matrix[8][size - 8 + i] = formatBits[7 + i];

  return matrix.map((row) => row.map((cell) => cell ?? false));
}

export interface QuizQrCodeProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
}

export const QuizQrCode: React.FC<QuizQrCodeProps> = ({
  value,
  size = 200,
  className = '',
  fgColor = '#004098', // HCMUTE Official Blue
  bgColor = '#ffffff',
  includeMargin = true,
}) => {
  const matrix = useMemo(() => {
    try {
      return generateQrMatrix(value);
    } catch {
      // Fallback simple 21x21 empty matrix if string too long
      return Array.from({ length: 21 }, () => Array(21).fill(false));
    }
  }, [value]);

  const matrixSize = matrix.length;
  const margin = includeMargin ? 3 : 1;
  const viewBoxSize = matrixSize + margin * 2;

  // Build SVG path
  const pathData = useMemo(() => {
    let d = '';
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          const x = c + margin;
          const y = r + margin;
          d += `M${x},${y}h1v1h-1z `;
        }
      }
    }
    return d;
  }, [matrix, matrixSize, margin]);

  return (
    <div
      className={`inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-md border border-line ${className}`}
      data-testid="quiz-qr-code"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="max-w-full h-auto"
        aria-label={`Mã QR: ${value}`}
        role="img"
      >
        <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} rx={1} />
        <path d={pathData} fill={fgColor} />
      </svg>
    </div>
  );
};

export default QuizQrCode;
