"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type {
  AboutPage,
  CoreValue,
  JourneyItem,
  SkillGroup,
} from "@/lib/types";
import { Card, Field, inputClass } from "@/components/admin/ui";
import RichEditor from "@/components/admin/RichEditor";

export default function AboutForm({
  about,
  exists,
}: {
  about: AboutPage;
  exists: boolean;
}) {
  const router = useRouter();

  const [heading, setHeading] = useState(about.heading ?? "");
  const [bio, setBio] = useState(about.bio ?? "");
  const [skills, setSkills] = useState<SkillGroup[]>(about.skills);
  const [journey, setJourney] = useState<JourneyItem[]>(about.journey);
  const [coreValues, setCoreValues] = useState<CoreValue[]>(about.core_values);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const payload = {
      id: 1,
      heading: heading.trim(),
      bio,
      skills: skills.filter((s) => s.category.trim()),
      journey: journey.filter((j) => j.title.trim() || j.year.trim()),
      core_values: coreValues.filter((v) => v.title.trim()),
    };

    const { error } = exists
      ? await supabase.from("about_page").update(payload).eq("id", 1)
      : await supabase.from("about_page").upsert(payload);

    setSaving(false);
    if (error) {
      setMessage({ ok: false, text: error.message });
      return;
    }
    setMessage({ ok: true, text: "Đã lưu. Trang About ngoài website đã cập nhật." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {/* BIO */}
      <Card className="space-y-5">
        <h2 className="text-lg font-semibold text-ink-900">Giới thiệu</h2>

        <Field label="Tiêu đề khối bio">
          <input
            className={inputClass}
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="👋 Hi, I'm Thân"
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">
            Nội dung bio
          </span>
          <RichEditor value={bio} onChange={setBio} />
          <span className="mt-1.5 block text-xs leading-relaxed text-ink-400">
            Bôi đen phần chữ rồi chọn định dạng ở thanh trên. Nội dung cũ viết bằng
            **hai dấu sao** vẫn giữ nguyên, chỉ cần bôi đen và bấm B là thành chữ đậm
            thật.
          </span>
        </div>
      </Card>

      {/* SKILLS */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Skills & Expertise</h2>
          <button
            type="button"
            onClick={() =>
              setSkills((s) => [...s, { category: "", items: [] }])
            }
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
          >
            + Thêm nhóm
          </button>
        </div>

        <div className="space-y-4">
          {skills.map((group, i) => (
            <div
              key={i}
              className="rounded-lg border border-line bg-surface-soft p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <input
                  className={inputClass}
                  value={group.category}
                  placeholder="Tên nhóm, VD: Brand & Design"
                  onChange={(e) =>
                    setSkills((s) =>
                      s.map((g, gi) =>
                        gi === i ? { ...g, category: e.target.value } : g
                      )
                    )
                  }
                />
                <RowButtons
                  index={i}
                  length={skills.length}
                  onMove={(dir) => setSkills((s) => move(s, i, dir))}
                  onRemove={() =>
                    setSkills((s) => s.filter((_, gi) => gi !== i))
                  }
                />
              </div>
              <textarea
                className={`${inputClass} min-h-[90px] resize-y`}
                value={group.items.join("\n")}
                placeholder={"Mỗi kỹ năng 1 dòng\nBrand Strategy\nVisual Identity"}
                onChange={(e) =>
                  setSkills((s) =>
                    s.map((g, gi) =>
                      gi === i
                        ? {
                            ...g,
                            items: e.target.value
                              .split("\n")
                              .map((t) => t.trim())
                              .filter(Boolean),
                          }
                        : g
                    )
                  )
                }
              />
            </div>
          ))}
          {skills.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-400">
              Chưa có nhóm kỹ năng nào.
            </p>
          )}
        </div>
      </Card>

      {/* JOURNEY */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">My Journey</h2>
          <button
            type="button"
            onClick={() =>
              setJourney((j) => [...j, { year: "", title: "", desc: "" }])
            }
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
          >
            + Thêm mốc
          </button>
        </div>

        <div className="space-y-4">
          {journey.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-line bg-surface-soft p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <input
                  className={`${inputClass} sm:max-w-[180px]`}
                  value={item.year}
                  placeholder="2023-Present"
                  onChange={(e) =>
                    setJourney((j) =>
                      j.map((x, xi) =>
                        xi === i ? { ...x, year: e.target.value } : x
                      )
                    )
                  }
                />
                <input
                  className={inputClass}
                  value={item.title}
                  placeholder="Tiêu đề mốc"
                  onChange={(e) =>
                    setJourney((j) =>
                      j.map((x, xi) =>
                        xi === i ? { ...x, title: e.target.value } : x
                      )
                    )
                  }
                />
                <RowButtons
                  index={i}
                  length={journey.length}
                  onMove={(dir) => setJourney((j) => move(j, i, dir))}
                  onRemove={() =>
                    setJourney((j) => j.filter((_, xi) => xi !== i))
                  }
                />
              </div>
              <textarea
                className={`${inputClass} min-h-[70px] resize-y`}
                value={item.desc}
                placeholder="Mô tả ngắn về giai đoạn này"
                onChange={(e) =>
                  setJourney((j) =>
                    j.map((x, xi) =>
                      xi === i ? { ...x, desc: e.target.value } : x
                    )
                  )
                }
              />
            </div>
          ))}
          {journey.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-400">
              Chưa có mốc hành trình nào.
            </p>
          )}
        </div>
      </Card>

      {/* CORE VALUES */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Core Values</h2>
          <button
            type="button"
            onClick={() =>
              setCoreValues((v) => [...v, { icon: "✨", title: "", desc: "" }])
            }
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
          >
            + Thêm giá trị
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coreValues.map((v, i) => (
            <div
              key={i}
              className="rounded-lg border border-line bg-surface-soft p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <input
                  className={`${inputClass} w-16 text-center text-xl`}
                  value={v.icon}
                  maxLength={8}
                  onChange={(e) =>
                    setCoreValues((cv) =>
                      cv.map((x, xi) =>
                        xi === i ? { ...x, icon: e.target.value } : x
                      )
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setCoreValues((cv) => cv.filter((_, xi) => xi !== i))
                  }
                  className="ml-auto rounded-md border border-rose-200 px-2 py-1.5 text-xs text-rose-700 transition hover:bg-rose-50"
                >
                  Xoá
                </button>
              </div>
              <input
                className={`${inputClass} mb-2`}
                value={v.title}
                placeholder="Tiêu đề"
                onChange={(e) =>
                  setCoreValues((cv) =>
                    cv.map((x, xi) =>
                      xi === i ? { ...x, title: e.target.value } : x
                    )
                  )
                }
              />
              <textarea
                className={`${inputClass} min-h-[70px] resize-y`}
                value={v.desc}
                placeholder="Mô tả ngắn"
                onChange={(e) =>
                  setCoreValues((cv) =>
                    cv.map((x, xi) =>
                      xi === i ? { ...x, desc: e.target.value } : x
                    )
                  )
                }
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Save bar */}
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
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </form>
  );
}

function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= arr.length) return arr;
  const next = [...arr];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function RowButtons({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number;
  length: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        aria-label="Lên"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        className="rounded-md border border-line px-2 py-1.5 text-xs text-ink-700 transition hover:bg-brand-50 disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        aria-label="Xuống"
        disabled={index === length - 1}
        onClick={() => onMove(1)}
        className="rounded-md border border-line px-2 py-1.5 text-xs text-ink-700 transition hover:bg-brand-50 disabled:opacity-30"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md border border-rose-200 px-2 py-1.5 text-xs text-rose-700 transition hover:bg-rose-50"
      >
        ✕
      </button>
    </div>
  );
}
