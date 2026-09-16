/**
 * Tách riêng khỏi ui.tsx để các component nhỏ (TagInput, ImagePicker) không phải
 * kéo theo next/link — nhờ vậy test chạy được ngoài môi trường Next.
 */
export const inputClass =
  "w-full rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400 focus:bg-surface";
