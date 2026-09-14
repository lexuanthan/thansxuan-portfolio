"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Settings, SocialLinks } from "@/lib/types";
import { Card, Field, inputClass } from "@/components/admin/ui";

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
      setMessage({ ok: false, text: error.message });
      return;
    }
    setMessage({ ok: true, text: "Đã lưu settings." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-white">Liên hệ</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" hint="Dùng cho nút “Get in Touch” trên website.">
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
        <h2 className="text-lg font-semibold text-white">Social links</h2>
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
        <p className="text-xs text-slate-500">
          Để trống ô nào thì link đó sẽ không hiện ở footer.
        </p>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-white">Thương hiệu & Hero</h2>

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

        <Field label="Mô tả ngắn ở footer">
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={form.footer_text}
            onChange={(e) => set("footer_text", e.target.value)}
          />
        </Field>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-white">SEO / Metadata</h2>

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
          <span className="mt-1 block text-right text-xs text-slate-500">
            {form.site_description.length} ký tự
          </span>
        </Field>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-white/10 bg-slate-900/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {message && (
            <p
              className={`text-sm ${
                message.ok ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Lưu settings"}
          </button>
        </div>
      </div>
    </form>
  );
}
