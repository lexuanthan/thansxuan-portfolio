import { createElement, type ReactNode } from "react";
import { parseHtml, styleToObject, type HNode } from "@/lib/html";

/**
 * Dựng nội dung bài viết từ HTML đã được lọc.
 *
 * Không dùng dangerouslySetInnerHTML ở bất cứ đâu: cây phần tử do React tạo
 * từ dữ liệu đã lọc, nên không có đường nào để mã lạ chạy được.
 */

/** Kiểu chữ cho từng loại thẻ — thay cho plugin typography. */
const CLASSES: Record<string, string> = {
  p: "mb-4 text-[15px] leading-[1.9] text-ink-700",
  h2: "mb-3 mt-8 text-2xl font-extrabold text-ink-900",
  h3: "mb-2.5 mt-7 text-xl font-bold text-ink-900",
  h4: "mb-2 mt-6 text-lg font-bold text-ink-900",
  ul: "mb-4 list-disc space-y-1.5 pl-6 text-[15px] leading-[1.9] text-ink-700",
  ol: "mb-4 list-decimal space-y-1.5 pl-6 text-[15px] leading-[1.9] text-ink-700",
  li: "pl-1",
  blockquote:
    "mb-4 rounded-card border-l-4 border-brand-400 bg-brand-50 px-4 py-3 text-[15px] italic leading-relaxed text-ink-700",
  pre: "mb-4 overflow-x-auto rounded-card border border-line bg-surface-soft p-4 text-[13px] leading-relaxed",
  code: "rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[13px] text-brand-800",
  a: "font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600",
  img: "my-5 w-full rounded-card",
  hr: "my-8 border-line",
  strong: "font-bold text-ink-900",
  b: "font-bold text-ink-900",
  mark: "rounded bg-brand-100 px-1",
  table: "mb-4 w-full border-collapse text-sm",
  th: "border border-line bg-surface-soft px-3 py-2 text-left font-bold text-ink-900",
  td: "border border-line px-3 py-2 text-ink-700",
  div: "mb-4 text-[15px] leading-[1.9] text-ink-700",
};

const VOID_TAGS = new Set(["br", "hr", "img"]);

function renderNodes(nodes: HNode[]): ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === "text") return node.value;

    const { tag, attrs, children } = node;

    const props: Record<string, unknown> = { key: i };
    if (CLASSES[tag]) props.className = CLASSES[tag];
    if (attrs.style) props.style = styleToObject(attrs.style);

    if (tag === "a") {
      props.href = attrs.href;
      if (attrs.title) props.title = attrs.title;
      // Liên kết ra ngoài mở tab mới; rel chặn trang đích với tới tab gốc
      if (/^https?:/i.test(attrs.href ?? "")) {
        props.target = "_blank";
        props.rel = "noopener noreferrer";
      }
    }

    if (tag === "img") {
      props.src = attrs.src;
      props.alt = attrs.alt ?? "";
      props.loading = "lazy";
    }

    if (tag === "td" || tag === "th") {
      if (attrs.colspan) props.colSpan = Number(attrs.colspan) || undefined;
      if (attrs.rowspan) props.rowSpan = Number(attrs.rowspan) || undefined;
    }

    if (VOID_TAGS.has(tag)) return createElement(tag, props);

    return createElement(tag, props, ...renderNodes(children));
  });
}

export default function HtmlContent({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const nodes = parseHtml(html);
  if (nodes.length === 0) return null;

  return <div className={className}>{renderNodes(nodes)}</div>;
}
