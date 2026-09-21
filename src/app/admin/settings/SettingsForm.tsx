"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Settings, SocialLinks } from "@/lib/types";
import { Card, Field, inputClass } from "@/components/admin/ui";
import ImagePicker from "@/components/admin/ImagePicker";

const SOCIALS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/…" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/…" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/…" },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/…" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@…" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@…" },
  { key: "website", label: "Website khác", placeholder: "https://…" },
];

export default function SettingsForm({
  settings,
  exists,
}: {
  settings: Settings;
  exists: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    site_title: settings.site_title ?? "",
    site_description: settings.site_description ?? "",
    brand_name: settings.brand_name ?? "",
    hero_title: settings.hero_title ?? "",
    hero_subtitle: settings.hero_subtitle ?? "",
    quote: settings.quote ?? "",
    hero_image_url: settings.hero_image_url ?? "",
    email: settings.email ?? "",
    phone: settings.phone ?? "",
    location: settings.location ?? "",
    footer_text: settings.footer_text ?? "",
  });
  const [social, setSocial] = useState<SocialLinks>(settings.social ?? {});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const cleanSocial: SocialLinks = {};
    for (const [k, v] of Object.entries(social)) {
      if (v && v.trim()) cleanSocial[k as keyof SocialLinks] = v.trim();
    }

    const payload = {
      id: 1,
      ...Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim()])
      ),
      social: cleanSocial,
    };

    const supabase = createClient();
    const { error } = exists
      ? await supabase.from("settings").update(payload).eq("id", 1)
      : await supabase.from("settings").upsert(payload);

    setSaving(false);
    if (error) {
      /**
       * Thiếu cột trong database là lỗi hay gặp nhất ở đây: mã nguồn đã có ô
       * nhập mới nhưng file SQL chưa chạy. Postgres chỉ báo cụt lủn kiểu
       * 'column settings.hero_image_url does not exist', đọc xong không biết
       * phải làm gì — nên dịch ra thành việc cụ thể.
       */
      const missingColumn = /column .*does not exist/i.test(error.message);
      setMessage({
        ok: false,
        text: missingColumn
          ? `${error.message} — Database chưa có cột này. Vào Supabase → SQL Editor và chạy hai file supabase/v2-giao-dien-moi.sql rồi supabase/v3-anh-bia.sql, sau đó lưu lại.`
          : error.message,
      });
      return;
    }
    setMessage({ ok: true, text: "Đã lưu cài đặt." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-ink-900">Liên hệ</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" hint="Hiện ở footer và trang Liên hệ.">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="ban@example.com"
            />
          </Field>

          <Field label="Số điện thoại">
            <input
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="09xx xxx xxx"
            />
          </Field>
        </div>

        <Field label="Địa chỉ / Khu vực">
          <input
            className={inputClass}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="TP. Hồ Chí Minh, Việt Nam"
          />
        </Field>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-ink-900">Social links</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIALS.map((s) => (
            <Field key={s.key} label={s.label}>
              <input
                type="url"
                className={inputClass}
                value={social[s.key] ?? ""}
                placeholder={s.placeholder}
                onChange={(e) =>
                  setSocial((prev) => ({ ...prev, [s.key]: e.target.value }))
                }
              />
            </Field>
          ))}
        </div>
        <p className="text-xs text-ink-400">
          Để trống ô nào thì link đó sẽ không hiện ở footer.
        </p>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-ink-900">Thương hiệu & Hero</h2>

        <Field label="Tên hiển thị ở navbar">
          <input
            className={inputClass}
            value={form.brand_name}
            onChange={(e) => set("brand_name", e.target.value)}
            placeholder="Thế giới của Thân LX"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tiêu đề hero (trang chủ)">
            <input
              className={inputClass}
              value={form.hero_title}
              onChange={(e) => set("hero_title", e.target.value)}
            />
          </Field>
          <Field label="Phụ đề hero">
            <input
              className={inputClass}
              value={form.hero_subtitle}
              onChange={(e) => set("hero_subtitle", e.target.value)}
            />
          </Field>
        </div>

        <div className="space-y-3">
  <div>
    <span className="block text-sm font-semibold text-ink-700">
      Ảnh bìa trang chủ (Hero Banner)
    </span>
    <span className="text-xs text-ink-400">
      Khung xem trước bên dưới hiển thị đúng tỷ lệ thực tế khi ra ngoài trang chủ.
    </span>
  </div>

  <ImagePicker
    value={form.hero_image_url || null}
    onChange={(url) => set("hero_image_url", url ?? "")}
  />

  {/* Khung xem trước đúng tỷ lệ trang chủ */}
  {form.hero_image_url && (
    <div className="mt-3 rounded-xl border border-line bg-page p-3">
      <p className="mb-2 text-xs font-semibold text-ink-500">
        Xem trước hiển thị thực tế trên trang chủ:
      </p>
      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={form.hero_image_url}
          alt="Xem trước ảnh bìa"
          className="w-full h-auto block object-contain"
        />
      </div>
    </div>
  )}

  <span className="block text-xs leading-relaxed text-ink-400">
    💡 <strong>Mẹo:</strong> Thiết kế ảnh dạng banner ngang (khoảng 1920×450 px hoặc 1200×300 px) để đạt độ nét cao nhất trên cả máy tính và điện thoại.
  </span>
</div>

        <Field
          label="Câu tâm đắc"
          hint='Hiện trong ô "Về tôi" ngoài trang chủ. Bỏ trống thì ô đó không hiện.'
        >
          <input
            className={inputClass}
            value={form.quote}
            onChange={(e) => set("quote", e.target.value)}
            placeholder="Học hỏi mỗi ngày, tạo ra giá trị mỗi ngày!"
          />
        </Field>

        <Field label="Mô tả ngắn ở footer">
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={form.footer_text}
            onChange={(e) => set("footer_text", e.target.value)}
          />
        </Field>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-ink-900">SEO / Metadata</h2>

        <Field label="Site title" hint="Hiện trên tab trình duyệt và kết quả Google.">
          <input
            className={inputClass}
            value={form.site_title}
            onChange={(e) => set("site_title", e.target.value)}
          />
        </Field>

        <Field label="Site description" hint="Khoảng 150–160 ký tự là đẹp nhất.">
          <textarea
            className={`${inputClass} min-h-[90px] resize-y`}
            value={form.site_description}
            onChange={(e) => set("site_description", e.target.value)}
          />
          <span className="mt-1 block text-right text-xs text-ink-400">
            {form.site_description.length} ký tự
          </span>
        </Field>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-surface px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {message && (
            <p
              className={`text-sm ${
                message.ok ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto rounded-lg bg-gradient-to-r from-brand-400 to-brand-300 px-6 py-3 text-sm font-semibold text-ink-900 transition hover:from-brand-300 hover:to-brand-200 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Lưu settings"}
          </button>
        </div>
      </div>
    </form>
  );
}
