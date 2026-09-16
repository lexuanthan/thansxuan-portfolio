"use client";

import { useState } from "react";
import { inputClass } from "./styles";

export default function TagInput({
  value,
  onChange,
  placeholder = "Nhập tag rồi Enter…",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const parts = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const p of parts) {
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
    setDraft("");
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-sky-700"
          >
            {tag}
            <button
              type="button"
              aria-label={`Xoá tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-sky-700 transition hover:text-brand-700"
            >
              ✕
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-xs text-ink-400">Chưa có tag nào</span>
        )}
      </div>

      <input
        type="text"
        value={draft}
        placeholder={placeholder}
        className={inputClass}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
      />
    </div>
  );
}
