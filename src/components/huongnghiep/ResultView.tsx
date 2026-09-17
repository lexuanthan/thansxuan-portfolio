"use client";

import { useState } from "react";

import { Card, CardHeader, Chip, cx } from "@/components/ui";
import { IconCheck, IconChart, IconUser } from "@/components/ui/icons";
import { BAND_LABEL, GROUP_LABEL, LOW_CONFIDENCE_THRESHOLD } from "@/lib/huongnghiep/config";
import { explainResult } from "@/lib/huongnghiep/explain";
import { RIASEC_LABEL, RIASEC_KEYS, type PartialRiasec } from "@/lib/huongnghiep/types";
import type { ProfileDetail } from "@/lib/huongnghiep/profile";
import type { BatchResult } from "@/lib/huongnghiep/engine";

/**
 * Trang kết quả.
 *
 * Nguyên tắc trình bày, theo 6.62 và 5.19:
 *  — gọi là "mức tương thích", không gọi là "ngành tốt nhất" hay "ngành hợp nhất";
 *  — nói về "hồ sơ hiện tại", không nói "tính cách của bạn";
 *  — con số nào hiện ra cũng phải kèm chỗ để hiểu nó ở đâu ra.
 * Mọi câu chữ đều lấy từ explain.ts, không có câu nào viết cứng ở đây.
 */

const BAND_STYLE: Record<string, string> = {
  STRONG_MATCH: "from-emerald-100 to-emerald-50 text-emerald-900",
  GOOD_MATCH: "from-brand-100 to-brand-50 text-brand-900",
  EXPLORE: "from-sky-100 to-sky-50 text-sky-900",
  LOW_MATCH: "from-stone-100 to-stone-50 text-ink-700",
};

function Bar({ value, tone = "brand" }: { value: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div
        className={cx("h-full rounded-full", tone === "brand" ? "bg-brand-400" : "bg-sky-400")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function RiasecPanel({ riasec }: { riasec: PartialRiasec }) {
  const usable = RIASEC_KEYS.filter((k) => typeof riasec[k] === "number");
  if (usable.length === 0) return null;

  const top = [...usable].sort((a, b) => (riasec[b] as number) - (riasec[a] as number)).slice(0, 3);

  return (
    <Card>
      <CardHeader icon={<IconUser className="h-4 w-4" />} tone="violet" title="Xu hướng nghề nghiệp" />
      {/*
        Cố ý KHÔNG viết "bạn thuộc kiểu I-R-A". Đây là xu hướng đo được tại một
        thời điểm, không phải một nhãn gắn vào con người (Rule S01, 3.28).
      */}
      <p className="mb-4 text-sm text-ink-500">
        Ba chiều nổi bật trong hồ sơ hiện tại:{" "}
        <strong className="text-ink-900">
          {top.map((k) => RIASEC_LABEL[k].split(" — ")[1]).join(" – ")}
        </strong>
      </p>
      <div className="space-y-2.5">
        {RIASEC_KEYS.map((k) => {
          const v = riasec[k];
          return (
            <div key={k} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-sm font-bold text-ink-400">{k}</span>
              <span className="w-40 shrink-0 truncate text-xs text-ink-500">
                {RIASEC_LABEL[k].split(" — ")[1]}
              </span>
              <div className="flex-1">
                <Bar value={typeof v === "number" ? v : 0} tone="sky" />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink-700">
                {typeof v === "number" ? Math.round(v) : "–"}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function ResultView({
  batch,
  detail,
  riasec,
  onRestart,
}: {
  batch: BatchResult;
  detail: ProfileDetail;
  /** RIASEC nằm trong hồ sơ học sinh, không nằm trong kết quả khớp. */
  riasec: PartialRiasec;
  onRestart: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const result = batch.ranked[selected] ?? batch.ranked[0];
  const blocks = explainResult(result);
  const headline = blocks.find((b) => b.kind === "HEADLINE");
  const notes = blocks.filter((b) => b.kind === "GATE" || b.kind === "DATA_LIMIT");
  const challenges = blocks.filter((b) => b.kind === "CHALLENGE");

  return (
    <div className="space-y-6">
      {/* ---- Bảng xếp hạng ---- */}
      <Card>
        <CardHeader
          icon={<IconChart className="h-4 w-4" />}
          title={`${batch.ranked.length} ngành có mức tương thích cao với hồ sơ hiện tại`}
        />
        {/*
          Cố ý KHÔNG đánh số 1, 2, 3 và không gọi là "ngành tốt nhất" (6.62).
          Thứ tự là thứ tự điểm, không phải bảng xếp hạng giá trị của ngành.
          Bấm vào một ngành để xem phân tích chi tiết của ngành đó.
        */}
        <ul className="space-y-2">
          {batch.ranked.map((r, i) => (
            <li key={r.majorId}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
                className={cx(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  i === selected
                    ? "border-brand-400 bg-brand-50"
                    : "border-line bg-surface hover:border-brand-300 hover:bg-brand-50/50"
                )}
              >
                <span className="w-10 shrink-0 text-lg font-extrabold text-ink-900">
                  {Math.round(r.finalScore)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900">
                    {r.majorName}
                  </span>
                  <span className="block text-xs text-ink-400">
                    {BAND_LABEL[r.band]}
                    {!r.eligible && " · có điều kiện chưa đáp ứng"}
                    {r.penalty > 0 && ` · có ${r.criticalFactors.filter((c) => c.status === "BELOW_THRESHOLD").length} yếu tố cần lưu ý`}
                  </span>
                </span>
                <span className="w-24 shrink-0">
                  <Bar value={r.finalScore} />
                </span>
              </button>
            </li>
          ))}
        </ul>

        {batch.skipped.length > 0 && (
          <p className="mt-4 border-t border-line pt-3.5 text-xs leading-relaxed text-ink-400">
            {batch.skipped.length} ngành chưa chấm được vì hồ sơ còn thiếu dữ liệu ở
            phần các ngành đó đòi hỏi: {batch.skipped.map((s) => s.majorName).join(", ")}.
          </p>
        )}

        <p className="mt-3 text-xs leading-relaxed text-ink-400">
          Khoảng cách vài điểm giữa các ngành liền nhau không có nhiều ý nghĩa — hãy
          đọc theo nhóm chứ đừng đọc theo thứ hạng.
        </p>
      </Card>

      {/* ---- Điểm tổng của ngành đang xem ---- */}
      <Card className={cx("bg-gradient-to-br", BAND_STYLE[result.band])}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">
              Mức tương thích
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">{result.majorName}</h2>
            <p className="mt-1 text-sm opacity-80">{BAND_LABEL[result.band]}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-extrabold leading-none">
              {Math.round(result.finalScore)}
            </div>
            <div className="mt-1 text-xs opacity-70">trên 100</div>
          </div>
        </div>

        {headline && <p className="mt-4 text-sm leading-relaxed">{headline.text}</p>}

        {!result.eligible && (
          <p className="mt-3 rounded-xl bg-white/60 px-3.5 py-2.5 text-sm font-semibold">
            Ngành này có điều kiện bắt buộc mà hồ sơ chưa đáp ứng. Kết quả vẫn được
            hiện đầy đủ để bạn biết mình còn thiếu đúng phần nào.
          </p>
        )}
      </Card>

      {/* ---- Cảnh báo độ tin cậy, PART 6.52 ---- */}
      {result.confidence < LOW_CONFIDENCE_THRESHOLD && (
        <Card className="border-orange-200 bg-orange-50">
          <p className="text-sm font-semibold text-orange-900">
            Dữ liệu còn mỏng
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-orange-800">
            Kết quả hiện tại còn phụ thuộc vào một số dữ liệu chưa đầy đủ
            (độ tin cậy {Math.round(result.confidence * 100)}%). Hoàn thiện thêm hồ sơ
            sẽ cho kết quả sát hơn.
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          {/* ---- Điểm từng nhóm ---- */}
          <Card>
            <CardHeader icon={<IconChart className="h-4 w-4" />} title="Điểm theo từng nhóm" />
            <div className="space-y-3.5">
              {result.groups.map((g) => (
                <div key={g.group}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-ink-700">
                      {GROUP_LABEL[g.group]}
                    </span>
                    <span className="shrink-0 text-xs text-ink-400">
                      {g.score === null ? (
                        "chưa đủ dữ liệu"
                      ) : (
                        <>
                          <strong className="text-sm text-ink-900">
                            {Math.round(g.score)}
                          </strong>
                          <span className="ml-1.5">
                            · trọng số {Math.round(g.effectiveWeight * 100)}%
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <Bar value={g.score ?? 0} />
                </div>
              ))}
            </div>
            {/*
              coverage và score là hai thứ khác nhau (6.40). Nói rõ ở đây vì
              người đọc rất dễ hiểu "đủ dữ liệu" thành "khớp cao".
            */}
            <p className="mt-4 text-xs leading-relaxed text-ink-400">
              Trọng số được chia lại giữa các nhóm có đủ dữ liệu, nên tổng luôn bằng 100%.
              Nhóm thiếu dữ liệu không bị tính là điểm thấp — nó được bỏ ra khỏi phép tính.
            </p>
          </Card>

          {/* ---- Điểm mạnh ---- */}
          {result.strengths.length > 0 && (
            <Card>
              <CardHeader
                icon={<IconCheck className="h-4 w-4" />}
                tone="emerald"
                title="Gần với đặc trưng của ngành"
              />
              <ul className="space-y-2.5">
                {result.strengths.map((s) => (
                  <li
                    key={s.factor}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-soft px-3.5 py-2.5"
                  >
                    <span className="min-w-0 text-sm text-ink-700">{s.label}</span>
                    <span className="shrink-0 text-xs text-ink-400">
                      bạn {Math.round(s.studentValue ?? 0)} · ngành{" "}
                      {Math.round(s.majorExpected ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* ---- Điểm cần củng cố ---- */}
          {result.gaps.length > 0 && (
            <Card>
              <CardHeader
                icon={<IconChart className="h-4 w-4" />}
                tone="orange"
                title="Có thể ưu tiên củng cố"
              />
              <ul className="space-y-2.5">
                {result.gaps.map((g) => (
                  <li
                    key={g.factor}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-soft px-3.5 py-2.5"
                  >
                    <span className="min-w-0 text-sm text-ink-700">{g.label}</span>
                    <span className="shrink-0 text-xs text-ink-400">
                      bạn {Math.round(g.studentValue ?? 0)} · ngành{" "}
                      {Math.round(g.majorExpected ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3.5 text-xs leading-relaxed text-ink-400">
                Đây là khoảng cách so với mức đặc trưng của ngành, không phải đánh giá
                về năng lực của bạn.
              </p>
            </Card>
          )}

          {/* ---- Lưu ý và thử thách ---- */}
          {(notes.length > 0 || challenges.length > 0) && (
            <Card>
              <CardHeader title="Những điều nên biết trước" />
              <ul className="space-y-2.5">
                {[...notes, ...challenges].map((b, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* ---- Cột phải ---- */}
        <div className="space-y-6">
          <RiasecPanel riasec={riasec} />

          <Card>
            <CardHeader title="Chất lượng dữ liệu" />
            <dl className="space-y-3">
              <Stat
                label="Hồ sơ đã khai"
                value={`${Math.round(result.confidenceBreakdown.profileCompleteness * 100)}%`}
              />
              <Stat
                label="Dữ liệu ngành dùng được"
                value={`${Math.round(result.coverage * 100)}%`}
              />
              <Stat
                label="Độ tin cậy kết quả"
                value={`${Math.round(result.confidence * 100)}%`}
              />
              <Stat
                label="Mức độ tự đánh giá"
                value={`${Math.round((1 - detail.reliability) * 100)}%`}
              />
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-ink-400">
              Độ tin cậy nói về mức đầy đủ của dữ liệu, KHÔNG phải xác suất bạn sẽ
              thành công hay trúng tuyển.
            </p>
          </Card>

          {detail.qualityFlags.length > 0 && (
            <Card>
              <CardHeader title="Ghi nhận về cách trả lời" />
              <div className="flex flex-wrap gap-1.5">
                {detail.qualityFlags.map((f) => (
                  <Chip key={f} tone="neutral">
                    {FLAG_LABEL[f] ?? f}
                  </Chip>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-400">
                Đây chỉ là ghi nhận, không có câu trả lời nào bị loại bỏ.
              </p>
            </Card>
          )}

          <Card className="bg-surface-soft">
            <p className="text-sm leading-relaxed text-ink-700">
              Kết quả này là một góc nhìn dựa trên dữ liệu bạn vừa khai, không phải
              lời khuyên nên chọn ngành nào. Quyết định vẫn là của bạn.
            </p>
            <button
              type="button"
              onClick={onRestart}
              className="mt-4 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              Làm lại khảo sát
            </button>
          </Card>

          <p className="px-1 text-[11px] leading-relaxed text-ink-400">
            Dữ liệu ngành đang dùng là bộ mẫu phát triển, chưa phải số liệu tuyển
            sinh chính thức. Phiên bản: hồ sơ v{result.versions.studentProfileVersion} ·
            DNA v{result.versions.majorDnaVersion} · cấu hình v
            {result.versions.matchingConfigurationVersion} · mã {result.inputHash}
          </p>
        </div>
      </div>
    </div>
  );
}

const FLAG_LABEL: Record<string, string> = {
  STRAIGHT_LINING: "Trả lời đều tay ở một bảng",
  BROAD_INTEREST_PROFILE: "Quan tâm nhiều lĩnh vực",
  MIXED_PREFERENCES: "Sở thích hỗn hợp",
  SPARSE_RESPONSE: "Còn nhiều câu bỏ trống",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm font-bold text-ink-900">{value}</dd>
    </div>
  );
}
