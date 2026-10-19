"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HeroLxt3D } from "@/components/home/HeroLxt3D";
import {
  DEFAULT_HOME_CONFIG,
  resolveHomeConfig,
  type HeroMode,
  type HomeConfig,
  type HomeSectionId,
  type MotionPreset,
} from "@/lib/home-config";
import type { AiTool, Project, Settings, SocialLinks } from "@/lib/types";
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

type SaveState = "synced" | "dirty" | "saving" | "saved" | "error";

export default function SettingsForm({
  settings,
  exists,
  tools = [],
  projects = [],
}: {
  settings: Settings;
  exists: boolean;
  tools?: AiTool[];
  projects?: Project[];
}) {
  const router = useRouter();
  const initialHomeConfig = useMemo(
    () => resolveHomeConfig(settings, { useDraft: true }),
    [settings]
  );

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
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(initialHomeConfig);
  const [saveState, setSaveState] = useState<SaveState>("synced");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const isDirty = saveState === "dirty";

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaveState("dirty");
  }

  function updateHome<K extends keyof HomeConfig>(key: K, value: HomeConfig[K]) {
    setHomeConfig((prev) => ({ ...prev, [key]: value }));
    setSaveState("dirty");
  }

  function updateFeaturedSlot(slotIndex: number, idValue: string) {
    setHomeConfig((prev) => {
      const next = [...prev.featured_ids];
      while (next.length < 3) {
        next.push(DEFAULT_HOME_CONFIG.featured_ids[next.length] || "");
      }
      next[slotIndex] = idValue;
      return { ...prev, featured_ids: next.slice(0, 3) };
    });
    setSaveState("dirty");
  }

  function toggleSection(sectionId: HomeSectionId) {
    setHomeConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
    setSaveState("dirty");
  }

  function moveSection(index: number, direction: -1 | 1) {
    setHomeConfig((prev) => {
      const nextSections = [...prev.sections];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= nextSections.length) return prev;
      const temp = nextSections[index];
      nextSections[index] = nextSections[targetIndex];
      nextSections[targetIndex] = temp;
      const reordered = nextSections.map((sec, idx) => ({
        ...sec,
        order: idx + 1,
      }));
      return { ...prev, sections: reordered };
    });
    setSaveState("dirty");
  }

  const selectableCatalog = useMemo(() => {
    const items: {
      id: string;
      label: string;
      published: boolean;
      kind: "tool" | "project";
    }[] = [];

    for (const t of tools) {
      items.push({
        id: t.id,
        label: `[Tiện ích] ${t.title}`,
        published: t.published !== false,
        kind: "tool",
      });
    }
    for (const p of projects) {
      if (!items.some((x) => x.id === p.id)) {
        items.push({
          id: p.id,
          label: `[Dự án] ${p.title}`,
          published: p.published !== false,
          kind: "project",
        });
      }
    }
    return items;
  }, [tools, projects]);

  async function persistSettings(mode: "draft" | "publish") {
    setSaveState("saving");
    setMessage(null);

    const cleanSocial: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(social)) {
      if (typeof v === "string" && v.trim()) {
        cleanSocial[k] = v.trim();
      }
    }

    const publishedBase = resolveHomeConfig(settings, { useDraft: false });
    const nextStoredConfig: HomeConfig =
      mode === "draft"
        ? {
            ...publishedBase,
            draft: {
              ...homeConfig,
            },
            updated_version: (publishedBase.updated_version ?? 1) + 1,
          }
        : {
            ...homeConfig,
            draft: null,
            updated_version: (homeConfig.updated_version ?? 1) + 1,
          };

    cleanSocial._home_config = nextStoredConfig;

    const payload = {
      id: 1,
      ...Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim()])
      ),
      quote: homeConfig.perspective_text.trim() || form.quote.trim(),
      social: cleanSocial,
    };

    const supabase = createClient();
    const { error } = exists
      ? await supabase.from("settings").update(payload).eq("id", 1)
      : await supabase.from("settings").upsert(payload);

    if (error) {
      const missingColumn = /column .*does not exist/i.test(error.message);
      setSaveState("error");
      setMessage({
        ok: false,
        text: missingColumn
          ? `${error.message} — Database chưa có cột này. Vào Supabase → SQL Editor và chạy file supabase/v4-master-upgrade.sql, sau đó lưu lại.`
          : error.message,
      });
      return;
    }

    setSocial(cleanSocial as SocialLinks);
    setSaveState("saved");
    setMessage({
      ok: true,
      text:
        mode === "draft"
          ? "Đã lưu bản nháp. Nhấn 'Xem trước nháp ↗' để kiểm tra trên Trang chủ."
          : "Đã xuất bản cấu hình đồng bộ ra Trang chủ.",
    });
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await persistSettings("publish");
  }

  const statusBadge = {
    synced: {
      label: "Đã đồng bộ",
      cls: "bg-slate-100 text-slate-700 border-slate-200",
    },
    dirty: {
      label: "Chưa lưu thay đổi",
      cls: "bg-amber-100 text-amber-900 border-amber-300",
    },
    saving: {
      label: "Đang lưu…",
      cls: "bg-blue-100 text-blue-800 border-blue-300",
    },
    saved: {
      label: "Đã lưu thành công",
      cls: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    error: {
      label: "Lưu thất bại",
      cls: "bg-rose-100 text-rose-800 border-rose-300",
    },
  }[saveState];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      {/* 1. KHỐI HERO & BIỂU TƯỢNG 3D LXT */}
      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              1. Khối mở đầu (Hero) &amp; Biểu tượng 3D LXT
            </h2>
            <p className="text-xs text-ink-500">
              Đồng bộ trực tiếp với khu vực Hero trên Trang chủ (`/`).
            </p>
          </div>
          <Link
            href="/?preview=1"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#2864FF] bg-[#F0F5FF] px-3 py-1.5 text-xs font-bold text-[#2864FF] hover:bg-[#2864FF] hover:text-white"
          >
            Xem trước Trang chủ (Preview) ↗
          </Link>
        </div>

        <Field label="Dòng nhãn phía trên (Eyebrow)">
          <input
            className={inputClass}
            value={homeConfig.eyebrow}
            onChange={(e) => updateHome("eyebrow", e.target.value)}
            placeholder="TRUYỀN THÔNG / SÁNG TẠO / CÔNG NGHỆ"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tiêu đề chính — Dòng 1 (Màu xanh đen #17243A)">
            <input
              className={inputClass}
              value={homeConfig.headline_line1}
              onChange={(e) => updateHome("headline_line1", e.target.value)}
              placeholder="Tư duy sáng tạo."
            />
          </Field>

          <Field label="Tiêu đề chính — Dòng 2 (Màu xanh cobalt #2864FF)">
            <input
              className={inputClass}
              value={homeConfig.headline_line2}
              onChange={(e) => updateHome("headline_line2", e.target.value)}
              placeholder="Kiến tạo giá trị."
            />
          </Field>
        </div>

        <Field label="Đoạn mô tả dẫn nhập (Hero Lead)">
          <textarea
            className={`${inputClass} min-h-[76px] resize-y`}
            value={homeConfig.lead}
            onChange={(e) => updateHome("lead", e.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nút hành động chính (Primary CTA)">
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                value={homeConfig.cta_primary_label}
                onChange={(e) =>
                  updateHome("cta_primary_label", e.target.value)
                }
                placeholder="Khám phá dự án"
              />
              <input
                className={inputClass}
                value={homeConfig.cta_primary_href}
                onChange={(e) =>
                  updateHome("cta_primary_href", e.target.value)
                }
                placeholder="/du-an"
              />
            </div>
          </Field>

          <Field label="Nút hành động phụ (Secondary CTA)">
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                value={homeConfig.cta_secondary_label}
                onChange={(e) =>
                  updateHome("cta_secondary_label", e.target.value)
                }
                placeholder="Về tôi"
              />
              <input
                className={inputClass}
                value={homeConfig.cta_secondary_href}
                onChange={(e) =>
                  updateHome("cta_secondary_href", e.target.value)
                }
                placeholder="/gioi-thieu"
              />
            </div>
          </Field>
        </div>

        {/* Chế độ hiển thị Visual & 3D */}
        <div className="grid gap-5 border-t border-line pt-4 sm:grid-cols-2">
          <Field
            label="Chế độ hiển thị khung phải Hero"
            hint="Chọn giữa Khối 3D LXT Monogram, Ảnh tĩnh tùy chỉnh hoặc Ảnh chân dung."
          >
            <select
              className={inputClass}
              value={homeConfig.hero_mode}
              onChange={(e) =>
                updateHome("hero_mode", e.target.value as HeroMode)
              }
            >
              <option value="3d">Biểu tượng 3D LXT Studio (Mặc định)</option>
              <option value="image">Ảnh tĩnh tùy chỉnh (Poster)</option>
              <option value="portrait">Ảnh chân dung tác giả</option>
            </select>
          </Field>

          <Field
            label="Cường độ chuyển động 3D (Motion Preset)"
            hint="Tự động chuyển về Tĩnh nếu thiết bị bật prefers-reduced-motion."
          >
            <select
              className={inputClass}
              value={homeConfig.motion_preset}
              onChange={(e) =>
                updateHome("motion_preset", e.target.value as MotionPreset)
              }
            >
              <option value="standard">Tiêu chuẩn (Float nhẹ + Nghiêng tối đa 5°)</option>
              <option value="light">Nhẹ (Nghiêng tối đa 2.5°)</option>
              <option value="static">Tĩnh hoàn toàn (Static)</option>
            </select>
          </Field>
        </div>

        {/* Live Preview of Hero Visual */}
        <div className="rounded-[10px] border border-[#E5EAF2] bg-[#FAFAF7] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#4F5D73]">
            Xem trước trực tiếp khối Visual phải Hero:
          </p>
          <div className="mx-auto max-w-[420px]">
            <HeroLxt3D
              mode={homeConfig.hero_mode}
              motionPreset={homeConfig.motion_preset}
              posterUrl={form.hero_image_url || undefined}
              authorName={form.hero_title || "Lê Xuân Thân"}
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-4">
          <span className="block text-sm font-semibold text-ink-700">
            Ảnh Poster dự phòng / Ảnh tĩnh tùy chỉnh (khi chọn chế độ Ảnh tĩnh)
          </span>
          <ImagePicker
            value={form.hero_image_url || null}
            onChange={(url) => setField("hero_image_url", url ?? "")}
          />
        </div>
      </Card>

      {/* 2. CHỌN 3 DỰ ÁN & TIỆN ÍCH NỔI BẬT TRÊN TRANG CHỦ */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-ink-900">
            2. Ba thẻ Dự án &amp; Tiện ích nổi bật (Section B)
          </h2>
          <p className="text-xs text-ink-500">
            Chọn từ danh sách công cụ AI và dự án thực tế theo ID. Chỉ các mục đang bật{" "}
            <strong>Xuất bản (Published)</strong> mới hiển thị ngoài trang công khai.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((slotIdx) => {
            const currentId =
              homeConfig.featured_ids[slotIdx] ??
              DEFAULT_HOME_CONFIG.featured_ids[slotIdx];
            const matched = selectableCatalog.find((c) => c.id === currentId);
            return (
              <div
                key={slotIdx}
                className="rounded-[10px] border border-line bg-surface-soft p-3.5"
              >
                <label className="mb-1.5 block text-xs font-bold text-ink-700">
                  Vị trí thẻ #{slotIdx + 1}
                </label>
                <select
                  className={inputClass}
                  value={currentId}
                  onChange={(e) => updateFeaturedSlot(slotIdx, e.target.value)}
                >
                  {selectableCatalog.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} {!item.published ? "(Đang ẩn)" : ""}
                    </option>
                  ))}
                </select>
                {matched && !matched.published && (
                  <p className="mt-2 text-xs font-semibold text-amber-700">
                    ⚠️ Mục này đang ở trạng thái Ẩn (Unpublished) nên sẽ được thay tự động ngoài trang chủ.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. DẢI KHO TIỆN ÍCH, VỀ TÔI & KẾT NỐI */}
      <Card className="space-y-5">
        <h2 className="text-lg font-bold text-ink-900">
          3. Nội dung Dải Kho tiện ích, Về tôi &amp; Kết nối
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tiêu đề dải Kho tiện ích">
            <input
              className={inputClass}
              value={homeConfig.utility_banner_title}
              onChange={(e) => updateHome("utility_banner_title", e.target.value)}
            />
          </Field>
          <Field label="Mô tả dải Kho tiện ích">
            <input
              className={inputClass}
              value={homeConfig.utility_banner_subtitle}
              onChange={(e) =>
                updateHome("utility_banner_subtitle", e.target.value)
              }
            />
          </Field>
          <Field label="Nhãn nút Kho tiện ích">
            <input
              className={inputClass}
              value={homeConfig.utility_banner_cta_label}
              onChange={(e) =>
                updateHome("utility_banner_cta_label", e.target.value)
              }
            />
          </Field>
        </div>

        <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <Field label="Tiêu đề Về tôi — Dòng 1">
            <input
              className={inputClass}
              value={homeConfig.perspective_line1}
              onChange={(e) => updateHome("perspective_line1", e.target.value)}
            />
          </Field>
          <Field label="Tiêu đề Về tôi — Dòng 2 (Xanh cobalt)">
            <input
              className={inputClass}
              value={homeConfig.perspective_line2}
              onChange={(e) => updateHome("perspective_line2", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Góc nhìn / Câu tâm đắc (hiển thị ở khối Về tôi)">
          <textarea
            className={`${inputClass} min-h-[72px] resize-y`}
            value={homeConfig.perspective_text}
            onChange={(e) => {
              updateHome("perspective_text", e.target.value);
              setField("quote", e.target.value);
            }}
          />
        </Field>

        <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
          <Field label="Tiêu đề khối Kết nối cuối trang">
            <input
              className={inputClass}
              value={homeConfig.connect_title}
              onChange={(e) => updateHome("connect_title", e.target.value)}
            />
          </Field>
          <Field label="Mô tả khối Kết nối">
            <input
              className={inputClass}
              value={homeConfig.connect_subtitle}
              onChange={(e) => updateHome("connect_subtitle", e.target.value)}
            />
          </Field>
          <Field label="Nhãn nút Kết nối">
            <input
              className={inputClass}
              value={homeConfig.connect_cta_label}
              onChange={(e) => updateHome("connect_cta_label", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* 4. THỨ TỰ & ẨN/HIỆN CÁC KHỐI TRANG CHỦ */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ink-900">
            4. Thứ tự &amp; Ẩn/Hiện các khối trên Trang chủ
          </h2>
          <p className="text-xs text-ink-500">
            Bật/tắt hiển thị hoặc thay đổi thứ tự các khối từ trên xuống dưới.
          </p>
        </div>

        <div className="divide-y divide-line rounded-[10px] border border-line bg-surface">
          {homeConfig.sections.map((sec, index) => (
            <div
              key={sec.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <label className="flex items-center gap-3 text-sm font-semibold text-ink-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sec.enabled}
                  onChange={() => toggleSection(sec.id)}
                  className="h-4 w-4 rounded border-line text-[#2864FF]"
                />
                <span>{sec.label}</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveSection(index, -1)}
                  className="rounded border border-line px-2.5 py-1 text-xs font-semibold text-ink-600 hover:bg-surface-soft disabled:opacity-40"
                >
                  ↑ Lên
                </button>
                <button
                  type="button"
                  disabled={index === homeConfig.sections.length - 1}
                  onClick={() => moveSection(index, 1)}
                  className="rounded border border-line px-2.5 py-1 text-xs font-semibold text-ink-600 hover:bg-surface-soft disabled:opacity-40"
                >
                  ↓ Xuống
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 5. THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI */}
      <Card className="space-y-5">
        <h2 className="text-lg font-bold text-ink-900">5. Thông tin Liên hệ &amp; Mạng xã hội</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" hint="Hiện ở footer và trang Liên hệ.">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="ban@example.com"
            />
          </Field>

          <Field label="Số điện thoại">
            <input
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="09xx xxx xxx"
            />
          </Field>
        </div>

        <Field label="Địa chỉ / Khu vực">
          <input
            className={inputClass}
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="TP. Hồ Chí Minh, Việt Nam"
          />
        </Field>

        <div className="grid gap-5 border-t border-line pt-4 sm:grid-cols-2">
          {SOCIALS.map((s) => (
            <Field key={s.key} label={s.label}>
              <input
                type="url"
                className={inputClass}
                value={(social[s.key] as string) ?? ""}
                placeholder={s.placeholder}
                onChange={(e) => {
                  setSocial((prev) => ({ ...prev, [s.key]: e.target.value }));
                  setSaveState("dirty");
                }}
              />
            </Field>
          ))}
        </div>
        <p className="text-xs text-ink-400">
          Chỉ những liên kết hợp lệ (`https://...`) mới hiển thị ở Footer và trang Liên hệ.
        </p>
      </Card>

      {/* 6. THƯƠNG HIỆU & SEO METADATA */}
      <Card className="space-y-5">
        <h2 className="text-lg font-bold text-ink-900">6. Thương hiệu &amp; SEO Metadata</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tên tác giả / Thương hiệu">
            <input
              className={inputClass}
              value={form.hero_title}
              onChange={(e) => setField("hero_title", e.target.value)}
              placeholder="Lê Xuân Thân"
            />
          </Field>
          <Field label="Khẩu hiệu ngắn (Subtitle)">
            <input
              className={inputClass}
              value={form.hero_subtitle}
              onChange={(e) => setField("hero_subtitle", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Mô tả ngắn ở Footer">
          <textarea
            className={`${inputClass} min-h-[72px] resize-y`}
            value={form.footer_text}
            onChange={(e) => setField("footer_text", e.target.value)}
          />
        </Field>

        <Field label="Site title (Thẻ tiêu đề trình duyệt & Google)">
          <input
            className={inputClass}
            value={form.site_title}
            onChange={(e) => setField("site_title", e.target.value)}
          />
        </Field>

        <Field label="Site description (Khoảng 150–160 ký tự)">
          <textarea
            className={`${inputClass} min-h-[84px] resize-y`}
            value={form.site_description}
            onChange={(e) => setField("site_description", e.target.value)}
          />
          <span className="mt-1 block text-right text-xs text-ink-400">
            {form.site_description.length} ký tự
          </span>
        </Field>
      </Card>

      {/* THANH TRẠNG THÁI & LƯU CỐ ĐỊNH PHÍA DƯỚI */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-line bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(23,36,58,0.06)] backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span
              data-testid="settings-save-status"
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusBadge.cls}`}
            >
              {statusBadge.label}
            </span>
            {message && (
              <p
                className={`text-xs font-semibold ${
                  message.ok ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={saveState === "saving"}
              onClick={() => persistSettings("draft")}
              className="rounded-[8px] border border-[#DCE3EE] bg-white px-4 py-2.5 text-xs font-bold text-[#17243A] transition hover:border-[#2864FF] hover:text-[#2864FF] disabled:opacity-60"
            >
              Lưu bản nháp
            </button>

            <Link
              href="/?preview=1"
              target="_blank"
              className="rounded-[8px] border border-[#2864FF] bg-[#F0F5FF] px-4 py-2.5 text-xs font-bold text-[#2864FF] transition hover:bg-[#E2ECFF]"
            >
              Xem trước nháp ↗
            </Link>

            <button
              type="submit"
              disabled={saveState === "saving"}
              className="rounded-[8px] bg-[#2864FF] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1E54E6] disabled:opacity-60"
            >
              {saveState === "saving" ? "Đang lưu…" : "Xuất bản lên Trang chủ"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
