"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconArrow, IconArrowUpRight, IconSearch } from "@/components/ui/icons";
import { statusClassName, type AiTool } from "@/lib/types";

export type ToolCategoryGroup =
  | "all"
  | "career"
  | "design"
  | "content"
  | "learning";

export type ToolStatusFilter = "all" | "active" | "coming_soon";

const CATEGORY_LABELS: { id: ToolCategoryGroup; label: string }[] = [
  { id: "all", label: "Tất cả tiện ích" },
  { id: "career", label: "Hướng nghiệp & Tuyển sinh" },
  { id: "design", label: "Thiết kế & Thương hiệu" },
  { id: "content", label: "Nội dung & Truyền thông" },
  { id: "learning", label: "Học tập & Tập huấn" },
];

export function classifyToolGroup(tool: AiTool): Exclude<ToolCategoryGroup, "all"> {
  const haystack = `${tool.id} ${tool.title} ${tool.description} ${tool.link_url}`.toLowerCase();
  if (
    haystack.includes("career") ||
    haystack.includes("hướng nghiệp") ||
    haystack.includes("huong-nghiep") ||
    haystack.includes("riasec") ||
    haystack.includes("edupath") ||
    haystack.includes("đại học") ||
    haystack.includes("dai-hoc") ||
    haystack.includes("điểm chuẩn")
  ) {
    return "career";
  }
  if (
    haystack.includes("canvas") ||
    haystack.includes("brand") ||
    haystack.includes("thiết kế") ||
    haystack.includes("banner") ||
    haystack.includes("poster") ||
    haystack.includes("thương hiệu")
  ) {
    return "design";
  }
  if (
    haystack.includes("quiz") ||
    haystack.includes("tập huấn") ||
    haystack.includes("trò chơi") ||
    haystack.includes("game")
  ) {
    return "learning";
  }
  return "content";
}

export function isComingSoonTool(tool?: AiTool | null): boolean {
  if (!tool) return true;
  const status = (tool.status || "").toLowerCase();
  if (!tool.link_url || !tool.link_url.trim()) return true;
  return (
    status.includes("coming soon") ||
    status.includes("thử nghiệm") ||
    status.includes("sắp ra mắt")
  );
}

export function normalizeToolLink(linkUrl?: string | null): string {
  const trimmed = (linkUrl || "").trim();
  if (trimmed === "#tra-cuu-dai-hoc" || trimmed === "/#tra-cuu-dai-hoc") {
    return "/ai-tools/tra-cuu-dai-hoc";
  }
  return trimmed;
}

export function AiToolsDirectory({ tools }: { tools: AiTool[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<ToolCategoryGroup>("all");
  const [statusFilter, setStatusFilter] = useState<ToolStatusFilter>("all");

  // Ensure University Lookup tool is present and normalized
  const normalizedTools = useMemo(() => {
    const list = tools
      .filter((t) => t.published !== false)
      .map((t) => ({
        ...t,
        link_url: normalizeToolLink(t.link_url),
      }));

    const hasUniLookup = list.some(
      (t) =>
        t.id === "tra-cuu-dai-hoc-hub" ||
        t.link_url === "/ai-tools/tra-cuu-dai-hoc"
    );

    if (!hasUniLookup) {
      list.push({
        id: "tra-cuu-dai-hoc-hub",
        title: "Tra cứu Tuyển sinh & Điểm chuẩn Đại học",
        description:
          "Hệ thống dữ liệu thông tin tuyển sinh, danh mục ngành và điểm chuẩn các trường đại học trên toàn quốc.",
        icon: "🏛️",
        status: "Free Access",
        status_color: "sky",
        color: "from-sky-100 to-blue-200",
        link_url: "/ai-tools/tra-cuu-dai-hoc",
        sort_order: 5,
        published: true,
        created_at: "1970-01-01T00:00:00.000Z",
        updated_at: "1970-01-01T00:00:00.000Z",
      });
    }

    return list;
  }, [tools]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalizedTools.filter((tool) => {
      if (group !== "all" && classifyToolGroup(tool) !== group) {
        return false;
      }
      const comingSoon = isComingSoonTool(tool);
      if (statusFilter === "active" && comingSoon) return false;
      if (statusFilter === "coming_soon" && !comingSoon) return false;

      if (!q) return true;
      const text = `${tool.title} ${tool.description} ${tool.status}`.toLowerCase();
      return text.includes(q);
    });
  }, [normalizedTools, query, group, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="rounded-[10px] border border-[#E5EAF2] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A879B]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm công cụ theo tên, nhu cầu sử dụng (VD: hướng nghiệp, banner, điểm chuẩn)..."
              aria-label="Tìm kiếm công cụ"
              className="w-full rounded-[8px] border border-[#DCE3EE] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-[#17243A] placeholder:text-[#7A879B] focus:border-[#2864FF] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="tool-status-filter" className="text-xs font-semibold text-[#4F5D73]">
              Trạng thái:
            </label>
            <select
              id="tool-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ToolStatusFilter)}
              className="rounded-[8px] border border-[#DCE3EE] bg-white px-3 py-2 text-xs font-semibold text-[#17243A] focus:border-[#2864FF] focus:outline-none"
            >
              <option value="all">Tất cả ({normalizedTools.length})</option>
              <option value="active">Đang mở sử dụng</option>
              <option value="coming_soon">Đang thử nghiệm / Sắp ra mắt</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORY_LABELS.map((cat) => {
            const active = group === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setGroup(cat.id)}
                className={`rounded-[8px] px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#2864FF] text-white shadow-sm"
                    : "border border-[#E5EAF2] bg-[#F8FAFC] text-[#4F5D73] hover:border-[#2864FF] hover:text-[#2864FF]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => {
            const comingSoon = isComingSoonTool(tool);
            const hasLink = Boolean(tool.link_url);
            const isExternal = hasLink && tool.link_url.startsWith("http");
            const categoryId = classifyToolGroup(tool);
            const categoryLabel =
              CATEGORY_LABELS.find((c) => c.id === categoryId)?.label || "Tiện ích";

            const cardContent = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div
                    aria-hidden="true"
                    className={`flex h-12 w-12 items-center justify-center rounded-[10px] bg-gradient-to-br text-2xl ${
                      tool.color || "from-brand-100 to-brand-200"
                    }`}
                  >
                    {tool.icon || "✨"}
                  </div>

                  {tool.status && (
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName(
                        tool.status_color
                      )}`}
                    >
                      {tool.status}
                    </span>
                  )}
                </div>

                <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#7A879B]">
                  {categoryLabel}
                </span>

                <h2 className="mt-1 text-[17px] font-extrabold leading-snug text-[#17243A] group-hover:text-[#2864FF]">
                  {tool.title}
                </h2>

                {tool.description && (
                  <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-[#4F5D73]">
                    {tool.description}
                  </p>
                )}

                <div className="mt-5 border-t border-[#EEF2F8] pt-3.5">
                  {hasLink && !comingSoon ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2864FF]">
                      <span>Mở công cụ</span>
                      {isExternal ? (
                        <IconArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A879B]">
                      <span>Đang hoàn thiện — Sắp ra mắt</span>
                    </span>
                  )}
                </div>
              </>
            );

            const cls =
              "group flex flex-col rounded-[10px] border border-[#E5EAF2] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBD7EE] hover:shadow-[var(--shadow-card-hover)]";

            if (!hasLink || comingSoon) {
              return (
                <article
                  key={tool.id}
                  className="flex flex-col rounded-[10px] border border-[#E5EAF2] bg-[#FAFBFD] p-5 opacity-95"
                >
                  {cardContent}
                </article>
              );
            }

            if (isExternal) {
              return (
                <a
                  key={tool.id}
                  href={tool.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link key={tool.id} href={tool.link_url} className={cls}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-[#DCE3EE] bg-white px-6 py-12 text-center">
          <p className="text-base font-bold text-[#17243A]">
            Không tìm thấy công cụ phù hợp với bộ lọc hiện tại
          </p>
          <p className="mt-1 text-sm text-[#4F5D73]">
            Hãy thử từ khóa khác hoặc đặt lại bộ lọc để xem toàn bộ kho tiện ích.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGroup("all");
              setStatusFilter("all");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-[#2864FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E54E6]"
          >
            Xem tất cả tiện ích
          </button>
        </div>
      )}
    </div>
  );
}
