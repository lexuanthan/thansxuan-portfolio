"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import rawUniversities from "../data/universities.json";
import { searchKey } from "@/lib/format";
import { IconBook, IconSearch, IconClose, IconArrow } from "@/components/ui/icons";
import { IconTile } from "@/components/ui";

export interface Major {
  major_name: string;
  major_code?: string;
  cutoff_score: number;
}

export interface University {
  id: string;
  code: string;
  name: string;
  shortName: string;
  city: string;
  region: "BAC" | "TRUNG" | "NAM";
  cutoff: number;
  tuition: number;
  employmentRate: number;
  type: "Công lập" | "Tư thục";
  highlight: string;
  majors: Major[];
}

const universities = rawUniversities as unknown as University[];

const REGIONS: { key: string; label: string }[] = [
  { key: "ALL", label: "Toàn quốc" },
  { key: "BAC", label: "Miền Bắc" },
  { key: "TRUNG", label: "Miền Trung" },
  { key: "NAM", label: "Miền Nam" },
];

const TYPES: { key: string; label: string }[] = [
  { key: "ALL", label: "Mọi loại hình" },
  { key: "Công lập", label: "Công lập" },
  { key: "Tư thục", label: "Tư thục" },
];

const INITIAL_DISPLAY_COUNT = 12;

export const UniversityLookup = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [displayCount, setDisplayCount] = useState<number>(INITIAL_DISPLAY_COUNT);

  const filteredList = useMemo(() => {
    const term = searchTerm.trim();
    const queryKey = term ? searchKey(term) : "";

    return universities.filter((uni) => {
      if (selectedRegion !== "ALL" && uni.region !== selectedRegion) return false;
      if (selectedType !== "ALL" && uni.type !== selectedType) return false;

      if (!queryKey) return true;

      const searchable = searchKey(
        [
          uni.name ?? "",
          uni.code ?? "",
          uni.shortName ?? "",
          uni.city ?? "",
          ...(uni.majors?.map((m) => m.major_name) ?? []),
        ].join(" ")
      );

      return searchable.includes(queryKey);
    });
  }, [searchTerm, selectedRegion, selectedType]);

  const visibleList = useMemo(() => {
    return filteredList.slice(0, displayCount);
  }, [filteredList, displayCount]);

  function handleFilterChange(type: "region" | "type", value: string) {
    if (type === "region") setSelectedRegion(value);
    if (type === "type") setSelectedType(value);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  }

  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  }

  return (
    <div className="w-full">
      {/* Tiêu đề khu vực chuẩn SEO & Nhận diện */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <IconTile tone="brand" size="md">
            <IconBook className="h-5 w-5" />
          </IconTile>
          <div>
            <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">
              Tra cứu Điểm chuẩn &amp; Trường Đại học
            </h2>
            <p className="mt-0.5 text-xs text-ink-500 sm:text-sm">
              Dữ liệu tổng hợp {universities.length} trường đại học tiêu biểu trên toàn quốc
            </p>
          </div>
        </div>

        <Link
          href="/ai-tools/edupath"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100 hover:text-brand-900"
        >
          <span>🎯 Phân tích nguyện vọng với EduPath</span>
          <IconArrow className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Thanh tìm kiếm & bộ lọc đồng bộ */}
      <div className="mb-6 space-y-3 rounded-card border border-line bg-surface-soft p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative min-w-[260px] flex-1">
            <label htmlFor="uni-search-input" className="sr-only">
              Tìm kiếm trường đại học
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200">
              <IconSearch className="h-4 w-4 shrink-0 text-ink-400" />
              <input
                id="uni-search-input"
                type="text"
                placeholder="Nhập tên trường, mã trường (BKA, KHTN...) hoặc thành phố..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Xóa tìm kiếm"
                  className="rounded p-0.5 text-ink-400 hover:text-ink-700"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Chọn loại hình */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-ink-500">Loại hình:</span>
            <select
              value={selectedType}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-semibold text-ink-700 outline-none transition-colors focus:border-brand-400"
            >
              {TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lọc theo miền (Pills) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-400">
            Khu vực:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((r) => {
              const active = selectedRegion === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleFilterChange("region", r.key)}
                  className={
                    active
                      ? "rounded-full bg-brand-400 px-3 py-1 text-xs font-bold text-ink-900 shadow-xs"
                      : "rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
                  }
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Số lượng kết quả */}
      <div className="mb-4 flex items-center justify-between text-xs text-ink-500">
        <span>
          Tìm thấy <strong className="font-bold text-ink-900">{filteredList.length}</strong> trường
          phù hợp
          {filteredList.length > displayCount && (
            <span> (đang hiển thị {displayCount} trường đầu tiên)</span>
          )}
        </span>
        {searchTerm && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            Bỏ tìm kiếm
          </button>
        )}
      </div>

      {/* Danh sách thẻ trường học */}
      {filteredList.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-10 text-center">
          <p className="text-3xl" aria-hidden="true">
            🔍
          </p>
          <h3 className="mt-3 text-base font-bold text-ink-900">
            Không tìm thấy trường nào phù hợp
          </h3>
          <p className="mt-1 text-xs text-ink-500">
            Hãy thử tìm bằng từ khoá khác, hoặc chọn lại khu vực &amp; loại hình.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleList.map((uni, idx) => (
            <article
              key={`${uni.id || uni.code}-${idx}`}
              className="flex flex-col justify-between rounded-card border border-line bg-surface p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
            >
              <div>
                {/* Header thẻ: Mã trường + Địa điểm */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                    {uni.code || uni.shortName}
                  </span>
                  <span className="truncate text-xs font-medium text-ink-400">
                    📍 {uni.city} ({uni.region})
                  </span>
                </div>

                {/* Tên trường */}
                <h3 className="mt-3 font-bold leading-snug text-ink-900 transition-colors">
                  {uni.name}
                </h3>

                {/* Khối điểm chuẩn & loại hình */}
                <div className="mt-3 rounded-xl border border-line bg-surface-soft p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-500">Điểm chuẩn tham khảo:</span>
                    <span className="font-black text-rose-600">{uni.cutoff} điểm</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-ink-500">Loại hình:</span>
                    <span className="font-semibold text-ink-700">{uni.type}</span>
                  </div>
                </div>

                {/* Danh sách ngành tiêu biểu */}
                {uni.majors && uni.majors.length > 0 ? (
                  <div className="mt-3.5 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Ngành đào tạo tiêu biểu:
                    </p>
                    <ul className="space-y-1 text-xs text-ink-700">
                      {uni.majors.slice(0, 3).map((m: Major, mIdx: number) => (
                        <li key={mIdx} className="flex items-center justify-between gap-1">
                          <span className="truncate">• {m.major_name}</span>
                          <span className="shrink-0 font-bold text-brand-800">
                            {m.cutoff_score}đ
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-3 text-xs italic text-ink-400">Đang cập nhật danh sách ngành</p>
                )}
              </div>

              {/* Ghi chú điểm nổi bật */}
              {uni.highlight && (
                <div className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-500">
                  {uni.highlight}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Nút Xem thêm */}
      {filteredList.length > displayCount && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setDisplayCount((prev) => prev + 12)}
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink-700 shadow-soft transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-900"
          >
            <span>Xem thêm trường phù hợp ({filteredList.length - displayCount} trường còn lại)</span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      )}
    </div>
  );
};