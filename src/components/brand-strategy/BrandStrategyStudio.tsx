"use client";

import { useEffect, useState } from "react";
import {
  ARCHETYPES,
  CORE_VALUE_OPTIONS,
  generateBrandStrategy,
  INDUSTRY_OPTIONS,
  suggestArchetypeFromValues,
} from "@/lib/brand-strategy/engine";
import type {
  BrandInput,
  BrandStrategyResult,
  JungianArchetypeId,
} from "@/lib/brand-strategy/types";
import { Button, Card, Chip, IconTile } from "@/components/ui";
import { IconArrow, IconCheck, IconCopy, IconSparkle } from "@/components/ui/icons";

const STORAGE_KEY = "thansxuan_brand_strategy_input";

const DEFAULT_INPUT: BrandInput = {
  brandName: "Lê Xuân Thân Tech Lab",
  industry: "Sáng tạo nội dung & Truyền thông số",
  targetAudience: "Học sinh sinh viên, Marketer trẻ và các nhà sáng tạo nội dung",
  mission: "Ứng dụng AI thông minh để nâng tầm truyền thông thương hiệu và tối ưu hiệu suất công việc.",
  coreValues: ["Sáng tạo", "Đổi mới", "Thấu cảm", "Đáng tin cậy"],
  archetypeId: "creator",
  formality: 3,
  humor: 2,
  emotion: 4,
  assertiveness: 4,
};

export default function BrandStrategyStudio() {
  const [input, setInput] = useState<BrandInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<BrandStrategyResult | null>(null);
  const [copiedType, setCopiedType] = useState<"prompt" | "markdown" | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "voice" | "prompt" | "content">("overview");

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setInput(parsed);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Compute result whenever input changes
  useEffect(() => {
    const res = generateBrandStrategy(input);
    setResult(res);
  }, [input]);

  // Save to LocalStorage
  const handleSaveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
      alert("✅ Đã lưu cấu hình thương hiệu vào trình duyệt của bạn!");
    } catch {
      // Ignore
    }
  };

  const handleToggleValue = (val: string) => {
    const current = input.coreValues;
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    
    // Tự gợi ý archetype nếu chọn thêm giá trị mới
    const suggested = suggestArchetypeFromValues(next);
    setInput((prev) => ({
      ...prev,
      coreValues: next,
      archetypeId: next.length > 0 ? suggested : prev.archetypeId,
    }));
  };

  const copyToClipboard = async (text: string, type: "prompt" | "markdown") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
      alert("Không thể sao chép tự động, vui lòng chọn văn bản và sao chép thủ công.");
    }
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result.fullMarkdownDoc], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chien-luoc-thuong-hieu-${input.brandName.toLowerCase().replace(/\s+/g, "-") || "brand"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) return null;

  return (
    <div className="space-y-8">
      {/* THANH ĐIỀU KHIỂN & GIỚI THIỆU */}
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-sm">
                ⚡
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                AI Brand Architect
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-ink-900 sm:text-3xl">
              Kiến Tạo Bản Sắc Thương Hiệu &amp; AI System Prompt
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Biến triết lý thương hiệu thành bộ lệnh AI tự hành, giữ trọn 100% bản sắc trên mọi kênh nội dung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveToStorage}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-surface-soft"
              title="Lưu lại cấu hình trên máy để lần sau quay lại không bị mất"
            >
              💾 Lưu cấu hình
            </button>
            <button
              onClick={downloadMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-3.5 py-2 text-xs font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
            >
              📥 Xuất tài liệu (.md)
            </button>
          </div>
        </div>
      </section>

      {/* BỐ CỤC 2 CỘT: CẤU HÌNH BÊN TRÁI — KẾT QUẢ BÊN PHẢI */}
      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* ================= CỘT TRÁI: NHẬP DỮ LIỆU (5 CỘT) ================= */}
        <div className="space-y-6 lg:col-span-5">
          {/* 1. THÔNG TIN CƠ BẢN */}
          <Card>
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-700">
                1
              </span>
              Thông tin Thương hiệu
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-ink-600">
                  Tên thương hiệu / Dự án
                </label>
                <input
                  type="text"
                  value={input.brandName}
                  onChange={(e) => setInput({ ...input, brandName: e.target.value })}
                  placeholder="Ví dụ: Lê Xuân Thân Studio"
                  className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-ink-600">
                  Lĩnh vực hoạt động
                </label>
                <input
                  type="text"
                  list="industry-suggestions"
                  value={input.industry}
                  onChange={(e) => setInput({ ...input, industry: e.target.value })}
                  placeholder="Chọn hoặc nhập ngành nghề"
                  className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                />
                <datalist id="industry-suggestions">
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-ink-600">
                  Khách hàng / Độc giả mục tiêu
                </label>
                <input
                  type="text"
                  value={input.targetAudience}
                  onChange={(e) => setInput({ ...input, targetAudience: e.target.value })}
                  placeholder="Ví dụ: Học sinh sinh viên, người làm sáng tạo..."
                  className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-ink-600">
                  Sứ mệnh / Mục tiêu cốt lõi
                </label>
                <textarea
                  rows={2}
                  value={input.mission}
                  onChange={(e) => setInput({ ...input, mission: e.target.value })}
                  placeholder="Thương hiệu tồn tại để giải quyết điều gì?"
                  className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* 2. GIÁ TRỊ CỐT LÕI */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-ink-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-700">
                  2
                </span>
                Giá trị cốt lõi
              </h3>
              <span className="text-xs text-ink-400">Chọn 2-5 giá trị</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {CORE_VALUE_OPTIONS.map((val) => {
                const active = input.coreValues.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleToggleValue(val)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-brand-500 text-ink-950 shadow-sm"
                        : "border border-line bg-surface-soft text-ink-600 hover:border-brand-200"
                    }`}
                  >
                    {active ? `✓ ${val}` : val}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 3. 12 HÌNH MẪU THƯƠNG HIỆU */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-ink-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-700">
                  3
                </span>
                Hình mẫu tâm lý (Carl Jung)
              </h3>
              <span className="text-xs text-brand-700 font-semibold">12 Archetypes</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.values(ARCHETYPES).map((arch) => {
                const active = input.archetypeId === arch.id;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setInput({ ...input, archetypeId: arch.id })}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all ${
                      active
                        ? "border-2 border-brand-500 bg-brand-50 shadow-sm"
                        : "border border-line bg-surface hover:border-brand-200"
                    }`}
                  >
                    <span className="text-2xl">{arch.icon}</span>
                    <span className="mt-1 text-xs font-bold text-ink-900">{arch.nameVi}</span>
                    <span className="text-[10px] text-ink-400">{arch.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 4. CĂN CHỈNH TÔNG GIỌNG (SLIDERS) */}
          <Card>
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-700">
                4
              </span>
              Thước đo Tông giọng (Voice Matrix)
            </h3>

            <div className="space-y-4">
              {/* Trang trọng */}
              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold">
                  <span className="text-ink-500">Gần gũi, đời thường</span>
                  <span className="text-brand-700">Trang trọng ({input.formality}/5)</span>
                  <span className="text-ink-500">Chuẩn mực học thuật</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={input.formality}
                  onChange={(e) => setInput({ ...input, formality: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Hài hước */}
              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold">
                  <span className="text-ink-500">Nghiêm cẩn, điềm đạm</span>
                  <span className="text-brand-700">Hài hước ({input.humor}/5)</span>
                  <span className="text-ink-500">Dí dỏm, hóm hỉnh</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={input.humor}
                  onChange={(e) => setInput({ ...input, humor: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Cảm xúc */}
              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold">
                  <span className="text-ink-500">Lý trí, dữ liệu</span>
                  <span className="text-brand-700">Cảm xúc ({input.emotion}/5)</span>
                  <span className="text-ink-500">Truyền cảm hứng</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={input.emotion}
                  onChange={(e) => setInput({ ...input, emotion: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Quyết đoán */}
              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold">
                  <span className="text-ink-500">Khiêm tốn, gợi mở</span>
                  <span className="text-brand-700">Dẫn dắt ({input.assertiveness}/5)</span>
                  <span className="text-ink-500">Quyết đoán, thẳng thắn</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={input.assertiveness}
                  onChange={(e) => setInput({ ...input, assertiveness: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ================= CỘT PHẢI: KẾT QUẢ CHIẾN LƯỢC & SYSTEM PROMPT (7 CỘT) ================= */}
        <div className="space-y-6 lg:col-span-7">
          {/* THANH CHUYỂN TAB KẾT QUẢ */}
          <div className="flex border-b border-line pb-2 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "overview"
                  ? "bg-brand-500 text-ink-950"
                  : "bg-surface text-ink-500 hover:text-ink-900"
              }`}
            >
              🏛️ Bản sắc &amp; Hình mẫu
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "voice"
                  ? "bg-brand-500 text-ink-950"
                  : "bg-surface text-ink-500 hover:text-ink-900"
              }`}
            >
              🎙️ Quy tắc Tông giọng
            </button>
            <button
              onClick={() => setActiveTab("prompt")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "prompt"
                  ? "bg-brand-500 text-ink-950"
                  : "bg-surface text-ink-500 hover:text-ink-900"
              }`}
            >
              🤖 AI System Prompt (Chuẩn)
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === "content"
                  ? "bg-brand-500 text-ink-950"
                  : "bg-surface text-ink-500 hover:text-ink-900"
              }`}
            >
              📝 Trụ cột &amp; Viral Hooks
            </button>
          </div>

          {/* TAB 1: BẢN SẮC & HÌNH MẪU */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* HERO CARD HÌNH MẪU */}
              <div
                className={`rounded-2xl border border-line bg-gradient-to-br p-6 shadow-soft ${result.archetype.colorTheme}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{result.archetype.icon}</span>
                    <div>
                      <h4 className="text-xl font-black text-ink-900">
                        {result.archetype.nameVi} ({result.archetype.nameEn})
                      </h4>
                      <p className="text-xs font-medium text-ink-600">
                        Hình mẫu đại diện cho {input.brandName || "Thương hiệu"}
                      </p>
                    </div>
                  </div>
                  <Chip tone="emerald">Khớp 98%</Chip>
                </div>

                <blockquote className="mt-4 border-l-4 border-ink-900/30 pl-3 italic text-ink-800 text-sm">
                  "{result.archetype.motto}"
                </blockquote>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl bg-white/70 p-3">
                    <p className="font-bold text-ink-900">🎯 Khát vọng cốt lõi</p>
                    <p className="mt-1 text-ink-700">{result.archetype.coreDesire}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <p className="font-bold text-ink-900">⚠️ Nỗi sợ cần tránh</p>
                    <p className="mt-1 text-ink-700">{result.archetype.greatestFear}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-ink-700">
                  <span className="font-bold">Các thương hiệu cùng hình mẫu:</span>
                  {result.archetype.iconicBrands.map((b) => (
                    <span key={b} className="rounded-md bg-white/80 px-2 py-0.5 font-semibold text-ink-900">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* TUYÊN BỐ ĐỊNH VỊ 1 CÂU */}
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400">
                  Tuyên Bố Định Vị Chiến Lược (Positioning Statement)
                </h4>
                <p className="mt-2 text-sm leading-relaxed font-semibold text-ink-900 bg-surface-soft p-3.5 rounded-xl border border-line">
                  "{result.positioningStatement}"
                </p>
              </Card>

              {/* GỢI Ý KHẨU HIỆU (TAGLINES) */}
              <Card>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
                  Gợi Ý Khẩu Hiệu (Taglines)
                </h4>
                <div className="space-y-2">
                  {result.taglineSuggestions.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-sm text-ink-800 transition-colors hover:border-brand-300"
                    >
                      <span className="font-medium">"{t}"</span>
                      <button
                        onClick={() => copyToClipboard(t, "prompt")}
                        className="text-xs text-ink-400 hover:text-brand-700"
                        title="Sao chép câu này"
                      >
                        <IconCopy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: QUY TẮC TÔNG GIỌNG (DO'S & DON'TS) */}
          {activeTab === "voice" && (
            <div className="space-y-5 animate-fade-in">
              <Card>
                <h4 className="mb-4 text-base font-bold text-ink-900">
                  Ma Trận Hướng Dẫn Phát Ngôn (Do's &amp; Don'ts)
                </h4>
                <div className="space-y-4">
                  {result.voiceRules.map((r, i) => (
                    <div key={i} className="rounded-xl border border-line bg-surface-soft p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-ink-900">{r.dimension}</span>
                        <span className="text-xs font-medium text-brand-700">{r.levelDesc}</span>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200/60 p-2.5">
                          <p className="font-bold text-emerald-800">✅ NÊN LÀM (Do's):</p>
                          <ul className="mt-1.5 space-y-1 text-emerald-900">
                            {r.dos.map((d, di) => (
                              <li key={di}>• {d}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg bg-rose-50 border border-rose-200/60 p-2.5">
                          <p className="font-bold text-rose-800">❌ TRÁNH (Don'ts):</p>
                          <ul className="mt-1.5 space-y-1 text-rose-900">
                            {r.donts.map((d, di) => (
                              <li key={di}>• {d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* TỪ KHÓA NÊN & KHÔNG NÊN DÙNG */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <p className="text-xs font-bold text-emerald-800 uppercase mb-2">
                    🌟 Từ vựng quyền năng (Power Words)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.powerWords.map((pw) => (
                      <span key={pw} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                        {pw}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card>
                  <p className="text-xs font-bold text-rose-800 uppercase mb-2">
                    🚫 Từ ngữ cấm kỵ (Words to Avoid)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.wordsToAvoid.map((wa) => (
                      <span key={wa} className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-900">
                        {wa}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: AI SYSTEM PROMPT */}
          {activeTab === "prompt" && (
            <div className="space-y-4 animate-fade-in">
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">
                      Production AI System Prompt
                    </h4>
                    <p className="text-xs text-ink-500">
                      Dán đoạn prompt này vào System Instructions của ChatGPT, Claude Projects hoặc Gemini.
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.aiSystemPrompt, "prompt")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-xs font-bold text-ink-950 shadow-soft hover:bg-brand-400 transition-colors"
                  >
                    {copiedType === "prompt" ? (
                      <>
                        <IconCheck className="h-4 w-4" /> Đã sao chép!
                      </>
                    ) : (
                      <>
                        <IconCopy className="h-4 w-4" /> Sao chép Prompt
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="max-h-[460px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-surface-soft p-4 font-mono text-xs leading-relaxed text-ink-800">
                    {result.aiSystemPrompt}
                  </pre>
                </div>
              </Card>

              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-xs text-brand-900">
                <p className="font-bold">💡 Mẹo từ Lê Xuân Thân:</p>
                <p className="mt-1 leading-relaxed">
                  Khi tạo một bài viết mới, hãy yêu cầu AI:{" "}
                  <em>
                    "Hãy đóng vai AI Brand Persona ở trên, viết cho tôi một bài phân tích chuyên sâu 800 chữ về chủ đề [Chủ đề của bạn]."
                  </em>{" "}
                  Bạn sẽ nhận được bài viết chuẩn xác từng sắc thái mà không cần chỉnh sửa nhiều.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TRỤ CỘT NỘI DUNG & HOOKS */}
          {activeTab === "content" && (
            <div className="space-y-5 animate-fade-in">
              <Card>
                <h4 className="mb-3 text-base font-bold text-ink-900">
                  4 Trụ Cột Nội Dung Đa Kênh (Content Pillars)
                </h4>
                <div className="space-y-3">
                  {result.contentPillars.map((p, i) => (
                    <div key={i} className="rounded-xl border border-line bg-surface p-3.5">
                      <p className="font-bold text-sm text-ink-900">{p.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500 italic">{p.purpose}</p>
                      <ul className="mt-2 space-y-1 text-xs text-ink-700">
                        {p.exampleTopics.map((topic, ti) => (
                          <li key={ti}>• {topic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h4 className="mb-3 text-base font-bold text-ink-900">
                  5 Tiêu Đề Mở Đầu Hút Người Đọc (Viral Hooks)
                </h4>
                <div className="space-y-2">
                  {result.viralHooks.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-line bg-surface p-3 text-xs text-ink-800"
                    >
                      <span className="font-medium">
                        <strong className="text-brand-700">#{i + 1}:</strong> "{h}"
                      </span>
                      <button
                        onClick={() => copyToClipboard(h, "prompt")}
                        className="text-ink-400 hover:text-brand-700"
                        title="Sao chép hook này"
                      >
                        <IconCopy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
