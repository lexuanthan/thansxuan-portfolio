"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";
import { IconArrow, IconCheck } from "@/components/ui/icons";

type FieldErrors = Partial<Record<"name" | "email" | "content", string>>;

const FIELD =
  "w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-400 focus:bg-surface";

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFieldErrors({});
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      content: form.get("content"),
      website: form.get("website"), // ô bẫy bot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        errors?: { field: keyof FieldErrors; message: string }[];
      } | null;

      if (res.ok && data?.ok) {
        setSent(true);
        return;
      }

      if (data?.errors) {
        const next: FieldErrors = {};
        for (const e of data.errors) next[e.field] = e.message;
        setFieldErrors(next);
        return;
      }

      setFormError(data?.error ?? "Gửi không thành công, anh chị thử lại giúp mình.");
    } catch {
      setFormError("Mất kết nối mạng. Kiểm tra lại đường truyền rồi gửi lần nữa nhé.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-card border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
          <IconCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink-900">Đã nhận được lời nhắn!</h2>
        <p className="mt-2 text-sm text-ink-700">
          Cảm ơn anh chị đã liên hệ. Mình sẽ đọc và phản hồi sớm nhất có thể.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink-700">
            Tên của anh chị <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            aria-invalid={Boolean(fieldErrors.name)}
            className={FIELD}
          />
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink-700">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ten@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            className={FIELD}
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-ink-700">
          Chủ đề
        </label>
        <input
          id="subject"
          name="subject"
          placeholder="Ví dụ: hợp tác nội dung, hỏi về công cụ…"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1.5 block text-sm font-semibold text-ink-700">
          Nội dung <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={6}
          placeholder="Anh chị cần trao đổi điều gì?"
          aria-invalid={Boolean(fieldErrors.content)}
          className={`${FIELD} resize-y`}
        />
        {fieldErrors.content && (
          <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.content}</p>
        )}
      </div>

      {/* Ô bẫy bot — ẩn với người thật lẫn trình đọc màn hình */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Để trống ô này</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {formError}
        </p>
      )}

      <Button type="submit" disabled={sending} className="w-full sm:w-auto">
        {sending ? "Đang gửi…" : "Gửi lời nhắn"}
        {!sending && <IconArrow className="h-4 w-4" />}
      </Button>
    </form>
  );
}
