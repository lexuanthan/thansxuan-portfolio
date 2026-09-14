/**
 * Tách riêng khỏi ui.tsx để các component nhỏ (TagInput, ImagePicker) không phải
 * kéo theo next/link — nhờ vậy test chạy được ngoài môi trường Next.
 */
export const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";
