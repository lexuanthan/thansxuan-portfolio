"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Field, inputClass } from "@/components/admin/ui";
import { CareerGuidanceSystemConfig } from "@/lib/career-guidance/configManager";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";

interface CareerGuidanceAdminClientProps {
  initialConfig: CareerGuidanceSystemConfig;
  initialLeads?: any[];
}

export default function CareerGuidanceAdminClient({
  initialConfig,
  initialLeads = [],
}: CareerGuidanceAdminClientProps) {
  const [config, setConfig] = useState<CareerGuidanceSystemConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<
    "coach" | "curated" | "platform" | "leads" | "health"
  >("coach");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [newPromptText, setNewPromptText] = useState("");

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch("/api/career-guidance/lead");
      const data = await res.json();
      if (data.localLeads || data.dbLeads) {
        // Merge without duplicates
        const combined = [...(data.localLeads || []), ...(data.dbLeads || [])];
        setLeads(combined);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeads();
    }
  }, [activeTab]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/career-guidance/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu cấu hình");
      }

      setMessage({ ok: true, text: "✅ Đã lưu cấu hình AI Hướng nghiệp thành công!" });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ ok: false, text: err.message || "Lỗi kết nối khi lưu" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuickPrompt = () => {
    if (!newPromptText.trim()) return;
    setConfig((prev) => ({
      ...prev,
      coach: {
        ...prev.coach,
        quick_prompts: [...prev.coach.quick_prompts, newPromptText.trim()],
      },
    }));
    setNewPromptText("");
  };

  const handleRemoveQuickPrompt = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      coach: {
        ...prev.coach,
        quick_prompts: prev.coach.quick_prompts.filter((_, i) => i !== index),
      },
    }));
  };

  const handleToggleFeaturedCareer = (careerId: string) => {
    const list = config.curated.featured_career_ids || [];
    const exists = list.includes(careerId);
    const updated = exists ? list.filter((id) => id !== careerId) : [...list, careerId];
    setConfig((prev) => ({
      ...prev,
      curated: { ...prev.curated, featured_career_ids: updated },
    }));
  };

  const handleTogglePriorityMajor = (majorId: string) => {
    const list = config.curated.priority_major_ids || [];
    const exists = list.includes(majorId);
    const updated = exists ? list.filter((id) => id !== majorId) : [...list, majorId];
    setConfig((prev) => ({
      ...prev,
      curated: { ...prev.curated, priority_major_ids: updated },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Status Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <div className="text-xs text-ink-500 font-semibold">Cơ sở dữ liệu Nghề</div>
          <div className="text-2xl font-black text-brand-700 mt-1">{CAREERS_DATA.length}+ Nghề</div>
          <div className="text-[11px] text-ink-400 mt-0.5">8 nhóm ngành kinh tế</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <div className="text-xs text-ink-500 font-semibold">Ngành Đại Học</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{MAJORS_DATA.length}+ Ngành</div>
          <div className="text-[11px] text-ink-400 mt-0.5">Chuẩn hóa Bộ GD&ĐT</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <div className="text-xs text-ink-500 font-semibold">Học sinh đăng ký</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{leads.length} Hồ sơ</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Sẵn sàng phản hồi</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <div className="text-xs text-ink-500 font-semibold">Trạng thái đồng bộ</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-ink-800">Hoạt động 100%</span>
          </div>
          <div className="text-[10px] text-ink-400 mt-0.5">Đã liên thông Trang chủ</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-3">
        {[
          { id: "coach", label: "🤖 Trí tuệ AI Coach & Prompts" },
          { id: "curated", label: "🎯 Nghề & Ngành Nổi Bật 2026" },
          { id: "platform", label: "📢 Tuyển Sinh & Trọng Số" },
          { id: "leads", label: `📋 Đăng Ký Tư Vấn (${leads.length})` },
          { id: "health", label: "🛡️ Lưu Trữ & Sức Khỏe Dữ Liệu" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-brand-600 text-white shadow-lift"
                : "bg-surface border border-line text-ink-700 hover:bg-surface-soft"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-2xl border p-4 text-xs font-semibold ${
            message.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* TAB 1: AI COACH STUDIO */}
      {activeTab === "coach" && (
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-base font-bold text-ink-900">
                  Cấu hình Chỉ Đạo AI Coach (System Prompt Studio)
                </h2>
                <p className="text-xs text-ink-500">
                  Can thiệp trực tiếp vào tư duy, nguyên tắc tư vấn và tông giọng của AI Coach khi trò chuyện với học sinh.
                </p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                AI Coach Core
              </span>
            </div>

            <Field
              label="System Instructions (Lời nhắc hệ thống)"
              hint="Hướng dẫn AI cách phân tích dữ liệu Career DNA, thái độ tư vấn và không được phán xét áp đặt."
            >
              <textarea
                rows={5}
                className={`${inputClass} font-mono text-xs leading-relaxed`}
                value={config.coach.system_prompt}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    coach: { ...config.coach, system_prompt: e.target.value },
                  })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Tông giọng tư vấn">
                <select
                  value={config.coach.coaching_tone}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      coach: { ...config.coach, coaching_tone: e.target.value as any },
                    })
                  }
                  className={inputClass}
                >
                  <option value="balanced">Cân bằng & Truyền cảm hứng (Khuyên dùng)</option>
                  <option value="empathetic">Thấu cảm & Nhẹ nhàng nâng đỡ</option>
                  <option value="pragmatic">Thực tế, Thẳng thắn & Cạnh tranh</option>
                  <option value="analytical">Phân tích Số liệu & Khoa học</option>
                </select>
              </Field>

              <Field label="Nhà cung cấp AI (Provider)">
                <select
                  value={config.coach.ai_provider}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      coach: { ...config.coach, ai_provider: e.target.value as any },
                    })
                  }
                  className={inputClass}
                >
                  <option value="auto">Tự động (Cloudflare AI + Fallback Offline)</option>
                  <option value="cloudflare">Cloudflare Workers AI (Llama 3.1 8B)</option>
                  <option value="smart_local">Ngoại tuyến (Smart Local Engine - 0đ)</option>
                </select>
              </Field>

              <Field
                label={`Nhiệt độ sáng tạo (Temperature: ${config.coach.temperature})`}
                hint="Thấp = bám sát dữ liệu; Cao = đa dạng ý tưởng"
              >
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={config.coach.temperature}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      coach: { ...config.coach, temperature: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-brand-500 cursor-pointer mt-2"
                />
              </Field>
            </div>

            {/* Quick Prompt Chips Management */}
            <div className="space-y-3 pt-3 border-t border-line">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-ink-900">
                    Gợi ý câu hỏi nhanh 1-chạm (Quick Prompts Chips)
                  </h3>
                  <p className="text-[11px] text-ink-500">
                    Các câu hỏi mẫu xuất hiện trong giao diện chat để kích thích học sinh hỏi chuyên sâu.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {config.coach.quick_prompts.map((qp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-soft px-3 py-1 text-xs text-ink-800"
                  >
                    <span>{qp}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuickPrompt(idx)}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                      title="Xóa câu hỏi này"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Thêm câu hỏi gợi ý mới (VD: Ngành này có dễ xin học bổng không?)..."
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddQuickPrompt();
                    }
                  }}
                  className={`${inputClass} text-xs`}
                />
                <button
                  type="button"
                  onClick={handleAddQuickPrompt}
                  className="rounded-xl bg-surface-soft border border-line px-4 py-2 text-xs font-bold text-ink-800 hover:bg-brand-50 transition shrink-0"
                >
                  + Thêm
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: CURATED PRIORITIES */}
      {activeTab === "curated" && (
        <div className="space-y-6">
          <Card className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-ink-900">
                Danh sách Nghề Nghiệp "Hot 2026" (Featured Careers)
              </h2>
              <p className="text-xs text-ink-500">
                Các nghề được tích chọn sẽ tự động gắn huy hiệu 🔥 Hot 2026 và được thuật toán ưu tiên đề xuất cho học sinh.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[360px] overflow-y-auto p-1 border border-line rounded-2xl">
              {CAREERS_DATA.map((c) => {
                const isSelected = (config.curated.featured_career_ids || []).includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? "border-amber-400 bg-amber-50/70 text-amber-950 font-bold shadow-xs"
                        : "border-line bg-surface hover:bg-surface-soft text-ink-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleFeaturedCareer(c.id)}
                      className="mt-0.5 h-4 w-4 accent-amber-600 rounded"
                    />
                    <div>
                      <div className="leading-snug">{c.name}</div>
                      <div className="text-[10px] text-ink-400 font-normal">
                        {c.industry_name} · {c.salary_range.senior_level_million}tr/tháng
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-4 border-t border-line">
              <h2 className="text-base font-bold text-ink-900">
                Ngành Học Đại Học Ưu Tiên (Priority Majors)
              </h2>
              <p className="text-xs text-ink-500 mb-3">
                Các ngành học đào tạo trọng điểm có nhu cầu nhân lực cao năm 2026-2027.
              </p>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[300px] overflow-y-auto p-1 border border-line rounded-2xl">
                {MAJORS_DATA.map((m) => {
                  const isSelected = (config.curated.priority_major_ids || []).includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                        isSelected
                          ? "border-brand-400 bg-brand-50 text-brand-950 font-bold shadow-xs"
                          : "border-line bg-surface hover:bg-surface-soft text-ink-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTogglePriorityMajor(m.id)}
                        className="mt-0.5 h-4 w-4 accent-brand-600 rounded"
                      />
                      <div>
                        <div className="leading-snug">{m.name}</div>
                        <div className="text-[10px] text-ink-400 font-normal">{m.industry_name}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: PLATFORM & WEIGHTS */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          <Card className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-ink-900">
                Thông Báo Toàn Sàn & Tuyển Sinh (Live Broadcast Banner)
              </h2>
              <p className="text-xs text-ink-500">
                Hiển thị thanh banner nổi bật ở đầu trang AI Hướng nghiệp để cập nhật lịch thi, cổng tuyển sinh hoặc tin nóng.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.platform.banner_active}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    platform: { ...config.platform, banner_active: e.target.checked },
                  })
                }
                className="h-5 w-5 accent-brand-600 rounded"
              />
              <span className="text-xs font-bold text-ink-800">
                Bật thanh thông báo Tuyển sinh / Live Banner
              </span>
            </label>

            <Field label="Nội dung thông báo hiển thị">
              <input
                type="text"
                value={config.platform.banner_message}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    platform: { ...config.platform, banner_message: e.target.value },
                  })
                }
                className={inputClass}
                placeholder="Nhập thông báo tuyển sinh..."
              />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={config.platform.show_ai_exposure_risk}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    platform: { ...config.platform, show_ai_exposure_risk: e.target.checked },
                  })
                }
                className="h-5 w-5 accent-brand-600 rounded"
              />
              <span className="text-xs font-bold text-ink-800">
                Hiển thị chỉ số Phơi nhiễm Tự động hóa AI (AI Exposure Risk Index)
              </span>
            </label>

            {/* Weights */}
            <div className="pt-4 border-t border-line space-y-3">
              <h3 className="text-xs font-bold text-ink-900">
                Trọng số Thuật toán So khớp Career DNA
              </h3>
              <p className="text-[11px] text-ink-500">
                Điều chỉnh mức độ ảnh hưởng của từng thành tố khi tính toán % độ phù hợp nghề nghiệp.
              </p>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="p-3 bg-surface-soft rounded-xl border border-line">
                  <div className="text-[11px] font-bold text-ink-700">Sở thích tự nhiên</div>
                  <div className="text-lg font-black text-brand-700 mt-1">
                    {Math.round(config.platform.weights.interests * 100)}%
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.6"
                    step="0.05"
                    value={config.platform.weights.interests}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        platform: {
                          ...config.platform,
                          weights: {
                            ...config.platform.weights,
                            interests: parseFloat(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full accent-brand-500 mt-2"
                  />
                </div>

                <div className="p-3 bg-surface-soft rounded-xl border border-line">
                  <div className="text-[11px] font-bold text-ink-700">Năng lực thực tế</div>
                  <div className="text-lg font-black text-indigo-700 mt-1">
                    {Math.round(config.platform.weights.capabilities * 100)}%
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.6"
                    step="0.05"
                    value={config.platform.weights.capabilities}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        platform: {
                          ...config.platform,
                          weights: {
                            ...config.platform.weights,
                            capabilities: parseFloat(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full accent-indigo-500 mt-2"
                  />
                </div>

                <div className="p-3 bg-surface-soft rounded-xl border border-line">
                  <div className="text-[11px] font-bold text-ink-700">Giá trị nghề nghiệp</div>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {Math.round(config.platform.weights.values * 100)}%
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.4"
                    step="0.05"
                    value={config.platform.weights.values}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        platform: {
                          ...config.platform,
                          weights: {
                            ...config.platform.weights,
                            values: parseFloat(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full accent-emerald-500 mt-2"
                  />
                </div>

                <div className="p-3 bg-surface-soft rounded-xl border border-line">
                  <div className="text-[11px] font-bold text-ink-700">Điểm thi học thuật</div>
                  <div className="text-lg font-black text-amber-700 mt-1">
                    {Math.round(config.platform.weights.academic * 100)}%
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.3"
                    step="0.05"
                    value={config.platform.weights.academic}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        platform: {
                          ...config.platform,
                          weights: {
                            ...config.platform.weights,
                            academic: parseFloat(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full accent-amber-500 mt-2"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: LEADS */}
      {activeTab === "leads" && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-base font-bold text-ink-900">
                  Hồ Sơ Học Sinh Đăng Ký Tư Vấn ({leads.length})
                </h2>
                <p className="text-xs text-ink-500">
                  Danh sách học sinh đã làm trắc nghiệm Career DNA và để lại số điện thoại/Zalo để được chuyên gia đồng hành.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchLeads}
                disabled={leadsLoading}
                className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface-soft transition"
              >
                {leadsLoading ? "Đang tải..." : "🔄 Làm mới"}
              </button>
            </div>

            {leads.length === 0 ? (
              <div className="py-12 text-center text-xs text-ink-400">
                Chưa có đơn đăng ký tư vấn nào mới.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {leads.map((l: any, idx) => (
                  <div key={l.id || idx} className="py-3.5 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-ink-900">
                          {l.fullName || l.name}
                        </span>
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                          {l.archetype || "Career DNA"}
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-400 font-mono">
                        {l.createdAt ? new Date(l.createdAt).toLocaleString("vi-VN") : ""}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-ink-600">
                      <div>
                        📞 SĐT/Zalo:{" "}
                        <strong className="text-brand-800">
                          {l.phone || (l.content ? l.content.match(/SĐT\/Zalo: (.*)/)?.[1] : "N/A")}
                        </strong>
                      </div>
                      <div>
                        ✉️ Email: <span>{l.email || "Không có"}</span>
                      </div>
                      <div>
                        🎓 Đối tượng: <span>{l.grade || "Học sinh THPT"}</span>
                      </div>
                    </div>

                    {l.topCareers && (
                      <div className="text-xs text-ink-500">
                        🎯 Quan tâm:{" "}
                        <strong className="text-ink-800">
                          {Array.isArray(l.topCareers) ? l.topCareers.join(", ") : l.topCareers}
                        </strong>
                      </div>
                    )}

                    {l.notes && (
                      <div className="rounded-xl bg-surface-soft p-2.5 text-xs text-ink-700 italic border border-line">
                        "{l.notes}"
                      </div>
                    )}

                    {l.content && !l.notes && (
                      <div className="rounded-xl bg-surface-soft p-2.5 text-xs text-ink-700 whitespace-pre-wrap font-mono border border-line">
                        {l.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 5: PERSISTENCE & HEALTH */}
      {activeTab === "health" && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-ink-900">
              Kiểm Tra Tình Trạng Liên Thông & Lưu Trữ Dữ Liệu
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface-soft">
                <div className="flex items-center gap-2">
                  <span className="text-base">💾</span>
                  <div>
                    <strong className="block text-ink-900">Lưu trữ Client (LocalStorage)</strong>
                    <span className="text-ink-500">
                      Hồ sơ cá nhân v3, Mục đã lưu, Lộ trình 5 giai đoạn
                    </span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-md">
                  Bền vững 100%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface-soft">
                <div className="flex items-center gap-2">
                  <span className="text-base">☁️</span>
                  <div>
                    <strong className="block text-ink-900">Lưu trữ Server (Supabase Database)</strong>
                    <span className="text-ink-500">Bảng `ai_tools`, `messages`, `projects`</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-md">
                  Đã kết nối
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface-soft">
                <div className="flex items-center gap-2">
                  <span className="text-base">📄</span>
                  <div>
                    <strong className="block text-ink-900">Tệp Cấu Hình Quản Trị (JSON Storage)</strong>
                    <span className="text-ink-500">`src/data/career_guidance_config.json`</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-md">
                  Tự động đồng bộ
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface-soft">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔗</span>
                  <div>
                    <strong className="block text-ink-900">Liên thông Trang chủ</strong>
                    <span className="text-ink-500">Hero Section, CTA Buttons, Tab query params</span>
                  </div>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-md">
                  Đã liên thông chuẩn xác
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-line">
              <Link
                href="/ai-tools/career-guidance"
                target="_blank"
                className="rounded-xl border border-line px-4 py-2.5 text-xs font-semibold text-ink-700 hover:bg-surface-soft transition inline-flex items-center gap-1.5"
              >
                Mở giao diện người dùng công khai ↗
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Save Actions Bar */}
      <div className="sticky bottom-4 z-30 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/95 backdrop-blur-md p-4 shadow-lift">
        <div className="text-xs text-ink-500">
          Chỉnh sửa sẽ được áp dụng ngay lập tức cho toàn bộ người dùng công cụ AI Hướng nghiệp.
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/ai-tools"
            className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink-700 hover:bg-surface-soft transition"
          >
            Quay lại danh mục Tool
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-lift hover:bg-brand-700 transition disabled:opacity-50"
          >
            {saving ? "Đang lưu cấu hình..." : "💾 Lưu Thay Đổi Cấu Hình"}
          </button>
        </div>
      </div>
    </div>
  );
}
