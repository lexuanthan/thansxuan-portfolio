import { CognitiveLevel, QuizQuestion } from './types';
import { normalizeCognitiveLevel } from './configManager';

export interface ParsedExcelResult {
  questions: QuizQuestion[];
  warnings: string[];
  totalRowsRead: number;
}

/**
 * Decodes XML entities (&amp;, &lt;, &gt;, &quot;, &apos;, &#...;)
 */
function decodeXmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function encodeXmlEntities(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts Excel column letters (e.g., "A" -> 0, "B" -> 1, "Z" -> 25, "AA" -> 26)
 */
function colLettersToIndex(letters: string): number {
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

function indexToColLetters(index: number): string {
  let n = index + 1;
  let str = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    str = String.fromCharCode(65 + rem) + str;
    n = Math.floor((n - 1) / 26);
  }
  return str;
}

/**
 * Decompresses raw DEFLATE bytes using Web Streams API (supported in Node 18+ and modern browsers).
 */
async function inflateRawBytes(compressed: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(compressed as unknown as BufferSource);
    writer.close();
    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    let totalLen = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        totalLen += value.length;
      }
    }
    const out = new Uint8Array(totalLen);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.length;
    }
    return out;
  }
  throw new Error('DecompressionStream not available');
}

/**
 * Extracts entries from a ZIP archive (.xlsx).
 */
async function extractZipEntries(buffer: Uint8Array): Promise<Record<string, Uint8Array>> {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const decoder = new TextDecoder('utf-8');
  const entries: Record<string, Uint8Array> = {};

  // Find End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1;
  const minEocdSearch = Math.max(0, buffer.length - 65557);
  for (let i = buffer.length - 22; i >= minEocdSearch; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid ZIP/XLSX archive: EOCD not found');
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);

  let ptr = cdOffset;
  for (let i = 0; i < totalEntries && ptr + 46 <= buffer.length; i++) {
    const sig = view.getUint32(ptr, true);
    if (sig !== 0x02014b50) break;

    const compressionMethod = view.getUint16(ptr + 10, true);
    const compressedSize = view.getUint32(ptr + 20, true);
    const fileNameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localHeaderOffset = view.getUint32(ptr + 42, true);

    const fileName = decoder.decode(buffer.subarray(ptr + 46, ptr + 46 + fileNameLen));
    ptr += 46 + fileNameLen + extraLen + commentLen;

    // Only extract needed XML files
    if (
      !fileName.startsWith('xl/sharedStrings') &&
      !fileName.startsWith('xl/worksheets/sheet')
    ) {
      continue;
    }

    if (localHeaderOffset + 30 > buffer.length) continue;
    const localSig = view.getUint32(localHeaderOffset, true);
    if (localSig !== 0x04034b50) continue;

    const localNameLen = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);

    if (compressionMethod === 0) {
      entries[fileName] = compressedData;
    } else if (compressionMethod === 8) {
      entries[fileName] = await inflateRawBytes(compressedData);
    }
  }

  return entries;
}

/**
 * Parses OpenXML xl/sharedStrings.xml and xl/worksheets/sheet1.xml into a 2D string grid.
 */
function parseOpenXmlSheetToGrid(
  sheetXml: string,
  sharedStringsXml?: string
): string[][] {
  const sharedStrings: string[] = [];
  if (sharedStringsXml) {
    const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
    let siMatch: RegExpExecArray | null;
    while ((siMatch = siRegex.exec(sharedStringsXml)) !== null) {
      const siBody = siMatch[1];
      const tRegex = /<t(?:\s+[^>]*)?>([\s\S]*?)<\/t>/g;
      let tMatch: RegExpExecArray | null;
      let combined = '';
      while ((tMatch = tRegex.exec(siBody)) !== null) {
        combined += decodeXmlEntities(tMatch[1]);
      }
      sharedStrings.push(combined);
    }
  }

  const rows: string[][] = [];
  const rowRegex = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(sheetXml)) !== null) {
    const rowXml = rowMatch[1];
    const rowCells: string[] = [];
    let nextColIndex = 0;

    const cellRegex = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowXml)) !== null) {
      const attrs = cellMatch[1] || '';
      const cellBody = cellMatch[2] || '';

      const refMatch = /\br="([A-Z]+)\d+"/.exec(attrs);
      const colIdx = refMatch ? colLettersToIndex(refMatch[1]) : nextColIndex;
      nextColIndex = colIdx + 1;

      const typeMatch = /\bt="([^"]+)"/.exec(attrs);
      const cellType = typeMatch ? typeMatch[1] : '';

      let cellValue = '';
      if (cellType === 'inlineStr') {
        const tRegex = /<t(?:\s+[^>]*)?>([\s\S]*?)<\/t>/g;
        let tMatch: RegExpExecArray | null;
        while ((tMatch = tRegex.exec(cellBody)) !== null) {
          cellValue += decodeXmlEntities(tMatch[1]);
        }
      } else {
        const vMatch = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(cellBody);
        const rawV = vMatch ? decodeXmlEntities(vMatch[1].trim()) : '';
        if (cellType === 's') {
          const sIdx = parseInt(rawV, 10);
          cellValue =
            Number.isInteger(sIdx) && sIdx >= 0 && sIdx < sharedStrings.length
              ? sharedStrings[sIdx]
              : rawV;
        } else {
          cellValue = rawV;
        }
      }

      while (rowCells.length <= colIdx) {
        rowCells.push('');
      }
      rowCells[colIdx] = cellValue.trim();
    }

    if (rowCells.some((c) => c !== '')) {
      rows.push(rowCells);
    }
  }

  return rows;
}

/**
 * Parses CSV or TSV text into a 2D string grid, supporting quoted multi-line fields.
 */
export function parseDelimitedTextToGrid(rawText: string): string[][] {
  const text = rawText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Detect delimiter from first non-empty line
  const firstLine = text.split('\n').find((l) => l.trim().length > 0) || '';
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  let delimiter = ',';
  if (tabCount >= 3 && tabCount >= commaCount && tabCount >= semiCount) {
    delimiter = '\t';
  } else if (semiCount > commaCount && semiCount >= 3) {
    delimiter = ';';
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && nextCh === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (ch === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += ch;
      }
    }
  }

  if (currentField.trim() !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses XML Spreadsheet 2003 or HTML table (.xls) into a 2D string grid.
 */
function parseXmlOrHtmlTableToGrid(text: string): string[][] {
  const rows: string[][] = [];

  // Check XML Spreadsheet 2003 <Row>...<Cell>...<Data>
  if (text.includes('<Row') && text.includes('<Cell')) {
    const rowRegex = /<Row\b[^>]*>([\s\S]*?)<\/Row>/gi;
    let rMatch: RegExpExecArray | null;
    while ((rMatch = rowRegex.exec(text)) !== null) {
      const cells: string[] = [];
      const cellRegex = /<Cell\b[^>]*>[\s\S]*?<Data\b[^>]*>([\s\S]*?)<\/Data>[\s\S]*?<\/Cell>/gi;
      let cMatch: RegExpExecArray | null;
      while ((cMatch = cellRegex.exec(rMatch[1])) !== null) {
        cells.push(decodeXmlEntities(cMatch[1].replace(/<[^>]+>/g, '').trim()));
      }
      if (cells.some((c) => c !== '')) rows.push(cells);
    }
    if (rows.length > 0) return rows;
  }

  // Check HTML <tr><td>
  if (text.toLowerCase().includes('<tr')) {
    const trRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch: RegExpExecArray | null;
    while ((trMatch = trRegex.exec(text)) !== null) {
      const cells: string[] = [];
      const tdRegex = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let tdMatch: RegExpExecArray | null;
      while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
        cells.push(decodeXmlEntities(tdMatch[1].replace(/<[^>]+>/g, '').trim()));
      }
      if (cells.some((c) => c !== '')) rows.push(cells);
    }
  }

  return rows;
}

/**
 * Resolves the correct answer index (0, 1, 2, or 3) from flexible user input:
 * - "A", "B", "C", "D" (or "Đáp án A", "Phương án B")
 * - "1", "2", "3", "4" (1-based)
 * - Exact text match with one of the 4 options
 */
export function resolveCorrectAnswerIndex(
  rawCorrect: string,
  options: [string, string, string, string]
): number {
  const cleaned = String(rawCorrect ?? '').trim();
  if (!cleaned) return 0;

  const upper = cleaned.toUpperCase();

  // Direct letter A, B, C, D
  if (upper === 'A' || /^(ĐÁP ÁN|PHƯƠNG ÁN|OPTION)\s*A$/i.test(cleaned)) return 0;
  if (upper === 'B' || /^(ĐÁP ÁN|PHƯƠNG ÁN|OPTION)\s*B$/i.test(cleaned)) return 1;
  if (upper === 'C' || /^(ĐÁP ÁN|PHƯƠNG ÁN|OPTION)\s*C$/i.test(cleaned)) return 2;
  if (upper === 'D' || /^(ĐÁP ÁN|PHƯƠNG ÁN|OPTION)\s*D$/i.test(cleaned)) return 3;

  // Number 1..4 (1-based)
  if (cleaned === '1') return 0;
  if (cleaned === '2') return 1;
  if (cleaned === '3') return 2;
  if (cleaned === '4') return 3;

  // Match option text
  const exactIdx = options.findIndex(
    (opt) => opt.trim().toLowerCase() === cleaned.toLowerCase()
  );
  if (exactIdx !== -1) return exactIdx;

  // Starts with A., B., C., D.
  if (/^A[.):\s-]/i.test(cleaned)) return 0;
  if (/^B[.):\s-]/i.test(cleaned)) return 1;
  if (/^C[.):\s-]/i.test(cleaned)) return 2;
  if (/^D[.):\s-]/i.test(cleaned)) return 3;

  return 0;
}

/**
 * Converts a 2D string grid (from Excel / CSV / TSV) into validated QuizQuestion items.
 */
export function convertGridToQuizQuestions(
  grid: string[][],
  defaultTimeLimitSeconds = 15
): ParsedExcelResult {
  const warnings: string[] = [];
  if (!grid || grid.length === 0) {
    return { questions: [], warnings: ['File trống hoặc không có dữ liệu.'], totalRowsRead: 0 };
  }

  // Detect if row 0 is a header row
  const firstRow = grid[0].map((c) => c.toLowerCase().trim());
  const isHeaderRow = firstRow.some(
    (cell) =>
      cell.includes('câu hỏi') ||
      cell.includes('cau hoi') ||
      cell.includes('question') ||
      cell.includes('đáp án') ||
      cell.includes('dap an') ||
      cell.includes('phương án') ||
      cell === 'stt'
  );

  // Column index mapping defaults (matches our official Excel template):
  // Col 0: STT | Col 1: Câu hỏi | Col 2: Mức độ | Col 3: Đáp án A | Col 4: Đáp án B | Col 5: Đáp án C | Col 6: Đáp án D | Col 7: Đáp án đúng | Col 8: Thời gian (giây) | Col 9: Giải thích
  let colQuestion = 1;
  let colLevel = 2;
  let colOptA = 3;
  let colOptB = 4;
  let colOptC = 5;
  let colOptD = 6;
  let colCorrect = 7;
  let colTime = 8;
  let colExplanation = 9;

  if (isHeaderRow) {
    // Dynamic column detection by header keywords
    const findCol = (pred: (h: string, idx: number) => boolean) =>
      firstRow.findIndex(pred);

    const qIdx = findCol(
      (h) =>
        h.includes('câu hỏi') ||
        h.includes('cau hoi') ||
        h.includes('question') ||
        h.includes('nội dung') ||
        h.includes('đề bài')
    );
    const lvlIdx = findCol(
      (h) =>
        h.includes('mức độ') ||
        h.includes('muc do') ||
        h.includes('cấp độ') ||
        h.includes('level') ||
        h.includes('độ khó')
    );
    const aIdx = findCol(
      (h) =>
        h === 'a' ||
        h.endsWith(' a') ||
        h.includes('đáp án a') ||
        h.includes('dap an a') ||
        h.includes('phương án a') ||
        h.includes('option a')
    );
    const bIdx = findCol(
      (h) =>
        h === 'b' ||
        h.endsWith(' b') ||
        h.includes('đáp án b') ||
        h.includes('dap an b') ||
        h.includes('phương án b') ||
        h.includes('option b')
    );
    const cIdx = findCol(
      (h) =>
        h === 'c' ||
        h.endsWith(' c') ||
        h.includes('đáp án c') ||
        h.includes('dap an c') ||
        h.includes('phương án c') ||
        h.includes('option c')
    );
    const dIdx = findCol(
      (h) =>
        h === 'd' ||
        h.endsWith(' d') ||
        h.includes('đáp án d') ||
        h.includes('dap an d') ||
        h.includes('phương án d') ||
        h.includes('option d')
    );
    const corrIdx = findCol(
      (h) =>
        h.includes('đáp án đúng') ||
        h.includes('dap an dung') ||
        h.includes('correct') ||
        h === 'đáp án' ||
        h === 'dap an' ||
        h.includes('kết quả')
    );
    const timeIdx = findCol(
      (h) =>
        h.includes('thời gian') ||
        h.includes('thoi gian') ||
        h.includes('time') ||
        h.includes('giây') ||
        h.includes('seconds')
    );
    const expIdx = findCol(
      (h) =>
        h.includes('giải thích') ||
        h.includes('giai thich') ||
        h.includes('explanation') ||
        h.includes('căn cứ') ||
        h.includes('ghi chú')
    );

    if (qIdx !== -1) colQuestion = qIdx;
    if (lvlIdx !== -1) colLevel = lvlIdx;
    else colLevel = -1;

    if (aIdx !== -1 && bIdx !== -1 && cIdx !== -1 && dIdx !== -1) {
      colOptA = aIdx;
      colOptB = bIdx;
      colOptC = cIdx;
      colOptD = dIdx;
    } else if (qIdx !== -1 && lvlIdx === -1) {
      // Compact layout: Question | A | B | C | D | Correct | Explanation
      colOptA = qIdx + 1;
      colOptB = qIdx + 2;
      colOptC = qIdx + 3;
      colOptD = qIdx + 4;
      colCorrect = corrIdx !== -1 ? corrIdx : qIdx + 5;
      colExplanation = expIdx !== -1 ? expIdx : qIdx + 6;
      colTime = timeIdx;
    }

    if (corrIdx !== -1) colCorrect = corrIdx;
    if (timeIdx !== -1) colTime = timeIdx;
    if (expIdx !== -1) colExplanation = expIdx;
  } else {
    // No header row: check if column 0 is numeric STT or question text
    const firstCell = grid[0][0]?.trim() || '';
    const isFirstColNumber = /^\d+$/.test(firstCell);
    if (!isFirstColNumber && grid[0].length >= 6) {
      // Question | A | B | C | D | Correct | [Explanation]
      colQuestion = 0;
      colLevel = -1;
      colOptA = 1;
      colOptB = 2;
      colOptC = 3;
      colOptD = 4;
      colCorrect = 5;
      colExplanation = 6;
      colTime = 7;
    }
  }

  const startRow = isHeaderRow ? 1 : 0;
  const questions: QuizQuestion[] = [];

  for (let r = startRow; r < grid.length; r++) {
    const row = grid[r];
    if (!row || row.every((c) => !c || !c.trim())) continue;

    const questionText = (row[colQuestion] || '').trim();
    const optA = (row[colOptA] || '').trim();
    const optB = (row[colOptB] || '').trim();
    const optC = (row[colOptC] || '').trim();
    const optD = (row[colOptD] || '').trim();

    if (!questionText) {
      warnings.push(`Dòng ${r + 1}: Bỏ qua vì thiếu nội dung câu hỏi.`);
      continue;
    }

    if (!optA && !optB && !optC && !optD) {
      warnings.push(`Dòng ${r + 1}: Bỏ qua câu "${questionText.slice(0, 30)}..." vì thiếu 4 phương án trả lời.`);
      continue;
    }

    const options: [string, string, string, string] = [
      optA || 'Phương án A',
      optB || 'Phương án B',
      optC || 'Phương án C',
      optD || 'Phương án D',
    ];

    const rawLevel = colLevel >= 0 ? row[colLevel] : 'Nhận biết';
    const level: CognitiveLevel = normalizeCognitiveLevel(rawLevel);

    const rawCorrect = colCorrect >= 0 ? row[colCorrect] || 'A' : 'A';
    const correctIndex = resolveCorrectAnswerIndex(rawCorrect, options);

    const rawTime = colTime >= 0 ? Number(row[colTime]) : NaN;
    const timeLimit =
      Number.isFinite(rawTime) && rawTime >= 5 && rawTime <= 300
        ? Math.round(rawTime)
        : defaultTimeLimitSeconds;

    const rawExp = colExplanation >= 0 ? (row[colExplanation] || '').trim() : '';
    const explanation =
      rawExp ||
      `Đáp án đúng là phương án ${['A', 'B', 'C', 'D'][correctIndex]}: ${options[correctIndex]}`;

    questions.push({
      id: questions.length + 1,
      question: questionText,
      level,
      timeLimit,
      options,
      correctIndex,
      explanation,
      active: true,
    });
  }

  return {
    questions,
    warnings,
    totalRowsRead: Math.max(0, grid.length - startRow),
  };
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV/TSV file buffer into QuizQuestion[].
 */
export async function parseQuizExcelBuffer(
  buffer: Uint8Array | ArrayBuffer,
  fileName = 'questions.xlsx',
  defaultTimeLimitSeconds = 15
): Promise<ParsedExcelResult> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  // Check if file starts with PK\x03\x04 (ZIP / .xlsx)
  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04;

  if (isZip) {
    const entries = await extractZipEntries(bytes);
    const decoder = new TextDecoder('utf-8');
    const sharedStringsBytes = entries['xl/sharedStrings.xml'];
    const sharedStringsXml = sharedStringsBytes
      ? decoder.decode(sharedStringsBytes)
      : undefined;

    const sheetKey =
      Object.keys(entries)
        .filter((k) => k.startsWith('xl/worksheets/sheet'))
        .sort()[0] || 'xl/worksheets/sheet1.xml';

    const sheetBytes = entries[sheetKey];
    if (!sheetBytes) {
      throw new Error('Không tìm thấy trang tính (worksheet) trong file .xlsx');
    }

    const sheetXml = decoder.decode(sheetBytes);
    const grid = parseOpenXmlSheetToGrid(sheetXml, sharedStringsXml);
    return convertGridToQuizQuestions(grid, defaultTimeLimitSeconds);
  }

  // Otherwise decode as UTF-8 text (.csv, .tsv, XML .xls, or HTML .xls)
  const text = new TextDecoder('utf-8').decode(bytes);
  if (
    fileName.toLowerCase().endsWith('.xls') &&
    (text.includes('<Row') || text.toLowerCase().includes('<tr'))
  ) {
    const grid = parseXmlOrHtmlTableToGrid(text);
    if (grid.length > 0) {
      return convertGridToQuizQuestions(grid, defaultTimeLimitSeconds);
    }
  }

  const grid = parseDelimitedTextToGrid(text);
  return convertGridToQuizQuestions(grid, defaultTimeLimitSeconds);
}

// ============================================================================
// GENUINE .XLSX & .CSV GENERATOR (Zero external dependencies)
// ============================================================================

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createStoredZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    // Local file header (30 + nameBytes.length)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 flag
    lv.setUint16(8, 0, true); // compression method: 0 (stored)
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0x5421, true); // mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, file.data);

    // Central directory header (46 + nameBytes.length)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x5421, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + size;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const part of centralParts) {
    cdSize += part.length;
  }

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, cdOffset, true);
  ev.setUint16(20, 0, true);

  const totalSize = offset + cdSize + eocd.length;
  const out = new Uint8Array(totalSize);
  let pos = 0;
  for (const p of localParts) {
    out.set(p, pos);
    pos += p.length;
  }
  for (const p of centralParts) {
    out.set(p, pos);
    pos += p.length;
  }
  out.set(eocd, pos);
  return out;
}

/**
 * Generates a valid binary .xlsx file buffer from a list of QuizQuestions.
 */
export function generateQuizExcelBuffer(questions: QuizQuestion[]): Uint8Array {
  const encoder = new TextEncoder();

  const headers = [
    'STT',
    'Câu hỏi',
    'Mức độ',
    'Đáp án A',
    'Đáp án B',
    'Đáp án C',
    'Đáp án D',
    'Đáp án đúng (A/B/C/D)',
    'Thời gian (giây)',
    'Giải thích đáp án',
  ];

  const rows: string[][] = [
    headers,
    ...questions.map((q, idx) => [
      String(idx + 1),
      q.question,
      q.level,
      q.options[0] || '',
      q.options[1] || '',
      q.options[2] || '',
      q.options[3] || '',
      ['A', 'B', 'C', 'D'][q.correctIndex] || 'A',
      String(q.timeLimit || 15),
      q.explanation || '',
    ]),
  ];

  const rowXmlStrings = rows.map((rowCells, rIdx) => {
    const rowNum = rIdx + 1;
    const cellsXml = rowCells
      .map((val, cIdx) => {
        const ref = `${indexToColLetters(cIdx)}${rowNum}`;
        if ((cIdx === 0 || cIdx === 8) && rIdx > 0 && /^\d+$/.test(val)) {
          return `<c r="${ref}"><v>${val}</v></c>`;
        }
        return `<c r="${ref}" t="inlineStr"><is><t>${encodeXmlEntities(val)}</t></is></c>`;
      })
      .join('');
    return `<row r="${rowNum}">${cellsXml}</row>`;
  });

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${rowXmlStrings.join('\n    ')}
  </sheetData>
</worksheet>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="CauHoiTapHuan" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

  return createStoredZip([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypesXml) },
    { name: '_rels/.rels', data: encoder.encode(rootRelsXml) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(workbookRelsXml) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheetXml) },
  ]);
}

/**
 * Generates UTF-8 BOM CSV string for Excel compatibility.
 */
export function generateQuizCsvContent(questions: QuizQuestion[]): string {
  const escapeCsv = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes(';')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headers = [
    'STT',
    'Câu hỏi',
    'Mức độ',
    'Đáp án A',
    'Đáp án B',
    'Đáp án C',
    'Đáp án D',
    'Đáp án đúng (A/B/C/D)',
    'Thời gian (giây)',
    'Giải thích đáp án',
  ];

  const lines = [
    headers.map(escapeCsv).join(','),
    ...questions.map((q, idx) =>
      [
        idx + 1,
        q.question,
        q.level,
        q.options[0] || '',
        q.options[1] || '',
        q.options[2] || '',
        q.options[3] || '',
        ['A', 'B', 'C', 'D'][q.correctIndex] || 'A',
        q.timeLimit || 15,
        q.explanation || '',
      ]
        .map(escapeCsv)
        .join(',')
    ),
  ];

  return '\uFEFF' + lines.join('\r\n');
}
