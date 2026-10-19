"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import rawUniversities from "../data/universities.json";
import { searchKey } from "@/lib/format";
import { IconBook, IconSearch, IconClose, IconArrow } from "@/components/ui/icons";
import { IconTile } from "@/components/ui";

export interface Major {
  major_name: string;
  major_code?: string;
  admission_codes?: string;
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

/**
 * Nhận diện ngữ cảnh thang điểm từ điểm số gốc trong dataset mà KHÔNG tự ý
 * quy đổi hay làm tròn sai bản chất dữ liệu.
 */
export function describeScoreScale(score: number): {
  scaleLabel: string;
  methodHint: string;
  isNonStandard30: boolean;
} {
  if (score <= 30) {
    return {
      scaleLabel: "Thang 30",
      methodHint: "Xét điểm thi THPT / Học bạ (3 môn)",
      isNonStandard30: false,
    };
  }
  if (score <= 40) {
    return {
      scaleLabel: "Thang 40",
      methodHint: "Có môn nhân hệ số 2 hoặc điểm quy đổi",
      isNonStandard30: true,
    };
  }
  if (score <= 100) {
    return {
      scaleLabel: "Thang 100",
      methodHint: "Điểm đánh giá tư duy / Xét tuyển kết hợp",
      isNonStandard30: true,
    };
  }
  if (score <= 150) {
    return {
      scaleLabel: "Thang 150",
      methodHint: "Đánh giá năng lực chuyên biệt",
      isNonStandard30: true,
    };
  }
  return {
    scaleLabel: "Thang 1200",
    methodHint: "Đánh giá năng lực (ĐGNL)",
    isNonStandard30: true,
  };
}

export const UniversityLookup = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [displayCount, setDisplayCount] = useState<number>(INITIAL_DISPLAY_COUNT);

  // Đồng bộ tham số tìm kiếm từ URL (hỗ trợ truy cập trực tiếp và Back/Forward)
  useEffect(() => {
    function syncFromUrl() {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") ?? "";
      const region = params.get("region") ?? "ALL";
      const type = params.get("type") ?? "ALL";
      setSearchTerm(q);
      if (REGIONS.some((r) => r.key === region)) setSelectedRegion(region);
      if (TYPES.some((t) => t.key === type)) setSelectedType(type);
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  function updateUrlParams(nextQ: string, nextRegion: string, nextType: string) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (nextQ.trim()) url.searchParams.set("q", nextQ.trim());
    else url.searchParams.delete("q");

    if (nextRegion !== "ALL") url.searchParams.set("region", nextRegion);
    else url.searchParams.delete("region");

    if (nextType !== "ALL") url.searchParams.set("type", nextType);
    else url.searchParams.delete("type");

    window.history.replaceState({}, "", url.toString());
  }

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
    const nextRegion = type === "region" ? value : selectedRegion;
    const nextType = type === "type" ? value : selectedType;
    if (type === "region") setSelectedRegion(value);
    if (type === "type") setSelectedType(value);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
    updateUrlParams(searchTerm, nextRegion, nextType);
  }

  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
    updateUrlParams(value, selectedRegion, selectedType);
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
              Dữ liệu tổng hợp {universities.length} trường đại học trên toàn quốc · Giữ nguyên điểm gốc theo từng thang xét tuyển
            </p>
          </div>
        </div>

        <Link
          href="/ai-tools/edupath"
          className="inline-flex items-center gap-1.5 rounded-btn bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-100"
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
            <div className="flex items-center gap-2.5 rounded-btn border border-line bg-surface px-3.5 py-2.5 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <IconSearch className="h-4 w-4 shrink-0 text-ink-400" />
              <input
                id="uni-search-input"
                type="text"
                placeholder="Nhập tên trường, mã trường (BKA, KHTN...), ngành hoặc thành phố..."
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
            <label htmlFor="uni-type-select" className="text-xs font-semibold text-ink-500">
              Loại hình:
            </label>
            <select
              id="uni-type-select"
              value={selectedType}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="rounded-btn border border-line bg-surface px-3 py-2.5 text-xs font-semibold text-ink-700 outline-none transition-colors focus:border-brand-500"
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
                      ? "rounded-btn bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                      : "rounded-btn border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
                  }
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ghi chú minh bạch về thang điểm & phương thức */}
      <div className="mb-4 rounded-card border border-brand-100 bg-brand-50/60 px-4 py-2.5 text-xs text-ink-700">
        <strong>Lưu ý ngữ cảnh dữ liệu:</strong> Điểm công bố của các trường có thể thuộc nhiều phương thức và thang điểm khác nhau (Thang 30 THPT, Thang 40 nhân hệ số, Thang 100/1200 ĐGNL). Hệ thống hiển thị nguyên vẹn điểm gốc và gắn nhãn thang điểm tương ứng cho từng ngành để tránh hiểu nhầm.
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
            className="text-xs font-semibold text-brand-600 hover:underline"
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
          {visibleList.map((uni, idx) => {
            const scaleInfo = describeScoreScale(uni.cutoff);
            const locationNeedsVerify = !uni.city || uni.city === "Khác";
            return (
              <article
                key={`${uni.id || uni.code}-${idx}`}
                className="flex flex-col justify-between rounded-card border border-line bg-surface p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
              >
                <div>
                  {/* Header thẻ: Mã trường + Địa điểm */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                      {uni.code || uni.shortName}
                    </span>
                    <span
                      className="truncate text-xs font-medium text-ink-400"
                      title={
                        locationNeedsVerify
                          ? "Thông tin tỉnh/thành trong bộ dữ liệu gốc đang để trống, phân vùng tự động cần đối chiếu"
                          : `${uni.city} (${uni.region})`
                      }
                    >
                      📍 {locationNeedsVerify ? `Khu vực ${uni.region} (Cần đối chiếu tỉnh/TP)` : `${uni.city} (${uni.region})`}
                    </span>
                  </div>

                  {/* Tên trường */}
                  <h3 className="mt-3 font-bold leading-snug text-ink-900">
                    {uni.name}
                  </h3>

                  {/* Khối điểm tham chiếu kèm ngữ cảnh thang điểm */}
                  <div className="mt-3 rounded-card border border-line bg-surface-soft p-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-ink-500">Mức điểm trung vị ngành:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-brand-600">{uni.cutoff}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            scaleInfo.isNonStandard30
                              ? "bg-amber-100 text-amber-800"
                              : "bg-brand-100 text-brand-800"
                          }`}
                          title={scaleInfo.methodHint}
                        >
                          {scaleInfo.scaleLabel}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-ink-500">Loại hình:</span>
                      <span className="font-semibold text-ink-700">{uni.type}</span>
                    </div>
                  </div>

                  {/* Danh sách ngành tiêu biểu kèm thang điểm từng ngành */}
                  {uni.majors && uni.majors.length > 0 ? (
                    <div className="mt-3.5 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                        Ngành đào tạo tiêu biểu ({uni.majors.length} ngành):
                      </p>
                      <ul className="space-y-1.5 text-xs text-ink-700">
                        {uni.majors.slice(0, 3).map((m: Major, mIdx: number) => {
                          const mScale = describeScoreScale(m.cutoff_score);
                          return (
                            <li
                              key={mIdx}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="truncate" title={m.major_name}>
                                • {m.major_name}
                              </span>
                              <span className="shrink-0 whitespace-nowrap font-bold text-ink-900">
                                {m.cutoff_score}{" "}
                                <span className="text-[10px] font-normal text-ink-400">
                                  ({mScale.scaleLabel})
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs italic text-ink-400">
                      Đang cập nhật danh sách ngành
                    </p>
                  )}
                </div>

                {/* Nguồn / Ghi chú điểm nổi bật */}
                {uni.highlight && (
                  <div className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-ink-400">
                    Nguồn tham chiếu: {uni.highlight}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Nút Xem thêm */}
      {filteredList.length > displayCount && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setDisplayCount((prev) => prev + 12)}
            className="inline-flex items-center gap-2 rounded-btn border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink-700 shadow-soft transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <span>
              Xem thêm trường phù hợp ({filteredList.length - displayCount} trường còn lại)
            </span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      )}
    </div>
  );
};