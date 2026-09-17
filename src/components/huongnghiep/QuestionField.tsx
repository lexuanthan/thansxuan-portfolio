"use client";

import {
  LIKERT_LABELS,
  SLIDER_ENDS,
  SUBJECTS,
  SUBJECT_LABEL,
  dimensionLabel,
  type Answer,
  type MatrixAnswer,
  type Question,
} from "@/lib/huongnghiep/survey";
import { cx } from "@/components/ui";

/**
 * Bộ dựng ô trả lời cho từng kiểu câu hỏi.
 *
 * Không có logic tính điểm ở đây. Thành phần này chỉ nhận giá trị và trả giá
 * trị thô đúng như học sinh nhập — việc quy đổi thang là của derivation.ts.
 * Trộn quy đổi vào giao diện là cách chắc chắn nhất để hai chỗ tính lệch nhau.
 */

type Props = {
  question: Question;
  value: Answer;
  onChange: (value: Answer) => void;
};

/* ------------------------------------------------------------------ */
/* Mảnh dùng chung                                                     */
/* ------------------------------------------------------------------ */

const PILL_BASE =
  "rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors";
const PILL_OFF =
  "border-line bg-surface text-ink-700 hover:border-brand-300 hover:bg-brand-50";
const PILL_ON = "border-brand-400 bg-brand-50 font-semibold text-brand-800";

function Pill({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        PILL_BASE,
        active ? PILL_ON : PILL_OFF,
        disabled && !active && "cursor-not-allowed opacity-40 hover:border-line hover:bg-surface"
      )}
    >
      {children}
    </button>
  );
}

/** Năm nút Likert. Giá trị lưu là 1–5 thô, không phải điểm đã quy đổi. */
function LikertRow({
  value,
  onChange,
  compact = false,
}: {
  value: number | null;
  onChange: (n: number) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex gap-1.5" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={LIKERT_LABELS[n - 1]}
          title={LIKERT_LABELS[n - 1]}
          onClick={() => onChange(n)}
          className={cx(
            "flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
            compact ? "h-9 w-9" : "h-10 flex-1",
            value === n
              ? "border-brand-500 bg-brand-500 text-white"
              : "border-line bg-surface text-ink-500 hover:border-brand-300 hover:bg-brand-50"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function matrixOf(value: Answer): MatrixAnswer {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as MatrixAnswer;
}

function listOf(value: Answer): string[] {
  if (!Array.isArray(value)) return [];
  return (value as unknown[]).filter((x): x is string => typeof x === "string");
}

/* ------------------------------------------------------------------ */
/* Ô trả lời                                                           */
/* ------------------------------------------------------------------ */

export default function QuestionField({ question, value, onChange }: Props) {
  const { type, options = [], dimensions = [] } = question;

  /* ---- Một lựa chọn ---- */
  if (type === "single_choice" || type === "single_choice_with_other") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((label) => (
          <Pill
            key={label}
            active={value === label}
            onClick={() => onChange(value === label ? null : label)}
          >
            {label}
          </Pill>
        ))}
      </div>
    );
  }

  /* ---- Nhiều lựa chọn, có thể giới hạn số mục ---- */
  if (type === "multiple_choice" || type === "multi_select" || type === "rank_5") {
    const picked = listOf(value);
    const limit = type === "rank_5" ? 5 : question.max;
    const full = limit !== undefined && picked.length >= limit;

    return (
      <div>
        {limit !== undefined && (
          <p className="mb-2.5 text-xs font-medium text-ink-400">
            Chọn tối đa {limit} mục — đã chọn {picked.length}
            {type === "rank_5" && picked.length > 0 && " (theo thứ tự bạn bấm)"}
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((label) => {
            const on = picked.includes(label);
            const order = picked.indexOf(label) + 1;
            return (
              <Pill
                key={label}
                active={on}
                disabled={full && !on}
                onClick={() =>
                  onChange(on ? picked.filter((x) => x !== label) : [...picked, label])
                }
              >
                {type === "rank_5" && on && (
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
                    {order}
                  </span>
                )}
                {label}
              </Pill>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---- Thang Likert đơn ---- */
  if (type === "likert_1_5") {
    return (
      <div>
        <LikertRow
          value={typeof value === "number" ? value : null}
          onChange={(n) => onChange(n)}
        />
        <div className="mt-2 flex justify-between text-[11px] text-ink-400">
          <span>{LIKERT_LABELS[0]}</span>
          <span>{LIKERT_LABELS[4]}</span>
        </div>
      </div>
    );
  }

  /* ---- Bảng Likert ---- */
  if (type === "matrix_likert_1_5") {
    const m = matrixOf(value);
    return (
      <div className="space-y-2.5">
        {dimensions.map((dim) => (
          <div
            key={dim}
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface-soft p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm text-ink-700">
              {dimensionLabel(question.code, dim)}
            </span>
            <LikertRow
              compact
              value={typeof m[dim] === "number" ? (m[dim] as number) : null}
              onChange={(n) => onChange({ ...m, [dim]: n })}
            />
          </div>
        ))}
      </div>
    );
  }

  /* ---- Thanh trượt đơn ---- */
  if (type === "slider") {
    const current = typeof value === "number" ? value : 50;
    const [left, right] = SLIDER_ENDS[question.code] ?? ["0", "100"];
    return (
      <div className="rounded-xl border border-line bg-surface-soft p-4">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={current}
          aria-label={question.text}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
          <span>{left}</span>
          <span className="font-bold text-brand-700">{current}</span>
          <span>{right}</span>
        </div>
      </div>
    );
  }

  /* ---- Bảng thanh trượt ---- */
  if (type === "slider_matrix") {
    const m = matrixOf(value);
    return (
      <div className="space-y-3">
        {dimensions.map((dim) => {
          const current = typeof m[dim] === "number" ? (m[dim] as number) : 50;
          return (
            <div key={dim} className="rounded-xl border border-line bg-surface-soft p-3.5">
              <p className="mb-2 text-sm text-ink-700">
                {dimensionLabel(question.code, dim)}
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={current}
                aria-label={dimensionLabel(question.code, dim)}
                onChange={(e) => onChange({ ...m, [dim]: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
              <p className="mt-1 text-right text-xs font-bold text-brand-700">{current}</p>
            </div>
          );
        })}
      </div>
    );
  }

  /* ---- Bảng điểm môn ---- */
  if (type === "subject_score_matrix") {
    const m = matrixOf(value);
    return (
      <div>
        <p className="mb-2.5 text-xs font-medium text-ink-400">
          Thang 10. Môn nào chưa có điểm thì để trống — bỏ trống KHÔNG bị tính là 0 điểm.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <label
              key={s}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-soft px-3.5 py-2.5"
            >
              <span className="text-sm text-ink-700">{SUBJECT_LABEL[s]}</span>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                inputMode="decimal"
                value={typeof m[s] === "number" ? String(m[s]) : ""}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  const next = { ...m };
                  // Xoá hẳn khoá khi để trống. Đặt 0 ở đây là biến "chưa khai"
                  // thành "được 0 điểm" — đúng cái bẫy mà cả hệ thống đang tránh.
                  if (raw === "") delete next[s];
                  else next[s] = Number(raw);
                  onChange(next);
                }}
                className="w-20 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-right text-sm font-semibold text-ink-900 outline-none focus:border-brand-400"
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ---- Số ---- */
  if (type === "numeric") {
    return (
      <input
        type="number"
        min={question.range?.min}
        max={question.range?.max}
        step={question.code === "Q59" ? 0.1 : 1}
        inputMode="decimal"
        value={typeof value === "number" ? String(value) : ""}
        onChange={(e) => {
          const raw = e.target.value.trim();
          onChange(raw === "" ? null : Number(raw));
        }}
        placeholder={
          question.range ? `${question.range.min} – ${question.range.max}` : undefined
        }
        className="w-full max-w-xs rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-400"
      />
    );
  }

  /* ---- Khoảng giá trị dạng lựa chọn ---- */
  if (type === "numeric_range") {
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((label) => (
          <Pill
            key={label}
            active={value === label}
            onClick={() => onChange(value === label ? null : label)}
          >
            {label}
          </Pill>
        ))}
      </div>
    );
  }

  /* ---- Ô chữ tự do ---- */
  if (type === "searchable_select" || type === "textarea") {
    return (
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-400"
      />
    );
  }

  /* ---- Chứng chỉ: chưa dựng ô nhập đầy đủ ---- */
  if (type === "certificate_input") {
    return (
      <p className="rounded-xl border border-dashed border-line-strong bg-surface-soft px-4 py-5 text-sm text-ink-500">
        Phần khai chứng chỉ sẽ mở khi hệ thống ghép dữ liệu tuyển sinh của trường.
        Hiện chưa cần điền — nó không ảnh hưởng tới kết quả gợi ý ngành.
      </p>
    );
  }

  return null;
}
