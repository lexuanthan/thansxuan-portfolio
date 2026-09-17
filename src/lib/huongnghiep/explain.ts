/**
 * DIỄN GIẢI KẾT QUẢ — PART 6.81, 6.82, 6.83.
 *
 * Sinh lời giải thích THEO MẪU, hoàn toàn tất định: cùng một kết quả luôn ra
 * cùng một đoạn chữ. Không gọi AI ở đây.
 *
 * Vai trò của AI, nếu sau này bật lên, chỉ là viết lại cho mượt những câu do
 * file này sinh ra (6.82: "AI chỉ làm natural language generation"). Nó không
 * được đổi số, đổi thứ hạng, thêm bớt yếu tố then chốt, hay tự tạo xác suất.
 * Vì vậy mọi con số cần nói đều phải có mặt trong đầu ra ở đây — cái gì không
 * có trong này thì AI không có cớ để nhắc tới.
 *
 * Giọng văn bám 5.19 và 6.62: nói về "hồ sơ hiện tại" và "mức tương thích",
 * không nói "bạn có tính cách phù hợp" hay "ngành tốt nhất cho bạn".
 */

import { BAND_LABEL, LOW_CONFIDENCE_THRESHOLD, labelOfFactor } from "./config";
import type { ExplanationItem, MatchResult } from "./types";

export type ExplanationBlock = {
  kind: "HEADLINE" | "STRENGTH" | "GAP" | "GATE" | "DATA_LIMIT" | "CHALLENGE";
  text: string;
};

/** Nối danh sách theo kiểu tiếng Việt: "A, B và C". */
function join(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} và ${parts[parts.length - 1]}`;
}

function labels(items: ExplanationItem[], limit: number): string[] {
  return items.slice(0, limit).map((i) => i.label.toLowerCase());
}

/** Làm tròn CHỈ khi hiển thị — điểm gốc vẫn là số thực (6.48). */
function show(score: number): number {
  return Math.round(score);
}

/**
 * Câu mở đầu.
 *
 * Không dùng "ngành phù hợp nhất" hay "bạn nên học". Mức tương thích là một
 * phép đo giữa hai bộ dữ liệu, không phải một lời khuyên.
 */
function headline(result: MatchResult): string {
  const band = BAND_LABEL[result.band].toLowerCase();
  if (!result.eligible) {
    return `Hồ sơ hiện tại của bạn đạt mức ${band} với ngành ${result.majorName} (${show(
      result.finalScore
    )}/100), nhưng ngành này có điều kiện bắt buộc mà hồ sơ chưa đáp ứng — xem phần lưu ý bên dưới.`;
  }
  return `Hồ sơ hiện tại của bạn có mức ${band} với ngành ${result.majorName}: ${show(
    result.finalScore
  )}/100.`;
}

function strengthSentence(result: MatchResult): string | null {
  const names = labels(result.strengths, 3);
  if (names.length === 0) return null;
  return `Những điểm gần với đặc trưng của ngành nhất là ${join(names)}.`;
}

function gapSentence(result: MatchResult): string | null {
  const gaps = result.gaps.filter((g) => g.reasonCode !== "BELOW_CRITICAL_THRESHOLD");
  const names = labels(gaps, 3);
  if (names.length === 0) return null;
  return `Phần bạn có thể ưu tiên củng cố thêm là ${join(names)}.`;
}

/**
 * Câu về cổng chặn.
 *
 * Nói rõ con số và ngưỡng, không nói "bạn không đủ khả năng". Một em thiếu 20
 * điểm Toán cần biết mình thiếu bao nhiêu để còn quyết định, chứ không cần
 * một lời phán về năng lực của mình.
 */
function gateSentences(result: MatchResult): ExplanationBlock[] {
  const out: ExplanationBlock[] = [];

  for (const cf of result.criticalFactors) {
    const name = labelOfFactor(cf.factor);

    if (cf.status === "BELOW_THRESHOLD") {
      const gap = cf.minimumValue - (cf.studentValue ?? 0);
      out.push({
        kind: "GATE",
        text:
          cf.gateType === "HARD_GATE"
            ? `${name}: ngành có điều kiện bắt buộc từ ${cf.minimumValue}/100, hồ sơ hiện ở ${show(
                cf.studentValue ?? 0
              )}/100.`
            : `${name}: hồ sơ hiện ở ${show(cf.studentValue ?? 0)}/100, thấp hơn mức ${
                cf.minimumValue
              }/100 mà ngành thường đòi hỏi — còn cách khoảng ${show(gap)} điểm.`,
      });
      continue;
    }

    if (cf.status === "NEAR_THRESHOLD") {
      out.push({
        kind: "GATE",
        text: `${name}: hồ sơ ở ${show(
          cf.studentValue ?? 0
        )}/100, vừa đủ mức ${cf.minimumValue}/100 — nên tiếp tục giữ và củng cố.`,
      });
      continue;
    }

    if (cf.status === "MISSING") {
      out.push({
        kind: "DATA_LIMIT",
        text: `${name} là yếu tố then chốt của ngành nhưng hồ sơ chưa có dữ liệu, nên phần này chưa được tính.`,
      });
    }
  }

  return out;
}

/**
 * Cảnh báo dữ liệu mỏng — PART 6.52.
 *
 * Bắt buộc phải nói khi confidence thấp. Một con số 82 dựng từ nửa bộ câu hỏi
 * trông giống hệt một con số 82 dựng từ đủ bộ, và người đọc không có cách nào
 * tự phân biệt nếu hệ thống không nói ra.
 */
function dataLimitSentences(result: MatchResult): ExplanationBlock[] {
  const out: ExplanationBlock[] = [];

  if (result.confidence < LOW_CONFIDENCE_THRESHOLD) {
    out.push({
      kind: "DATA_LIMIT",
      text: "Kết quả hiện tại còn phụ thuộc vào một số dữ liệu chưa đầy đủ. Hoàn thiện thêm hồ sơ sẽ cho kết quả sát hơn.",
    });
  }

  const weak = result.groups.filter((g) => g.status !== "VALID");
  if (weak.length > 0) {
    out.push({
      kind: "DATA_LIMIT",
      text: `Chưa đủ dữ liệu để chấm nhóm ${join(
        weak.map((g) => g.group.toLowerCase().replace(/_/g, " "))
      )}, nên phần điểm đã được chia lại cho các nhóm còn lại.`,
    });
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Đầu ra                                                              */
/* ------------------------------------------------------------------ */

/**
 * Toàn bộ nguyên liệu diễn giải, dạng khối có nhãn.
 *
 * Giao diện chọn khối nào để hiện; AI — nếu bật — chỉ được viết lại từ đây.
 */
export function explainResult(result: MatchResult): ExplanationBlock[] {
  const blocks: ExplanationBlock[] = [{ kind: "HEADLINE", text: headline(result) }];

  const s = strengthSentence(result);
  if (s) blocks.push({ kind: "STRENGTH", text: s });

  const g = gapSentence(result);
  if (g) blocks.push({ kind: "GAP", text: g });

  blocks.push(...gateSentences(result));
  blocks.push(...dataLimitSentences(result));

  for (const c of result.challenges) {
    blocks.push({ kind: "CHALLENGE", text: `${c.title}: ${c.description}` });
  }

  return blocks;
}

/** Một đoạn văn liền mạch, dùng cho phần tóm tắt ngắn. */
export function explainSummary(result: MatchResult): string {
  return explainResult(result)
    .filter((b) => b.kind === "HEADLINE" || b.kind === "STRENGTH" || b.kind === "GAP")
    .map((b) => b.text)
    .join(" ");
}

/**
 * Hợp đồng đầu vào cho lớp AI — PART 3.62, 6.83.
 *
 * Trả về đúng những gì AI được phép đọc. Không kèm câu trả lời gốc, không kèm
 * thông tin định danh, không kèm quyền ghi. Nếu một ngày bật AI lên, chỗ nối
 * là hàm này chứ không phải cả `MatchResult`.
 */
export function aiInputContract(result: MatchResult): {
  major: string;
  score: number;
  band: string;
  confidence: number;
  blocks: ExplanationBlock[];
  forbidden: string[];
} {
  return {
    major: result.majorName,
    score: show(result.finalScore),
    band: BAND_LABEL[result.band],
    confidence: Number(result.confidence.toFixed(2)),
    blocks: explainResult(result),
    forbidden: [
      "không được đổi điểm hay thứ hạng",
      "không được thêm hoặc bớt yếu tố then chốt",
      "không được tạo xác suất trúng tuyển hay xác suất thành công",
      "không được khẳng định chắc chắn về tương lai",
      "không được nhắc con số nào không có trong blocks",
    ],
  };
}
