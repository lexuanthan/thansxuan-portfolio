import Link from "next/link";
import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, PageHeader } from "@/components/admin/ui";
import {
  IconArrow,
  IconChart,
  IconEye,
  IconFile,
  IconImage,
  IconMail,
  IconRocket,
  IconSparkle,
} from "@/components/ui/icons";
import { formatCount, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const TILE_TONES = {
  brand: "bg-brand-100 text-brand-700",
  sky: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
} as const;

type Tone = keyof typeof TILE_TONES;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    postsAll,
    postsPublished,
    projectsAll,
    projectsPublished,
    toolsAll,
    toolsPublished,
    mediaCount,
    messagesNew,
    viewsTotal,
    views7d,
    recentViews,
    recentPosts,
  ] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("ai_tools").select("id", { count: "exact", head: true }),
    supabase
      .from("ai_tools")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("media").select("id", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("handled", false),
    supabase.from("page_views").select("id", { count: "exact", head: true }),
    supabase
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDaysAgo(6)),
    supabase
      .from("page_views")
      .select("path, created_at")
      .gte("created_at", startOfDaysAgo(29))
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase
      .from("posts")
      .select("id, title, published, updated_at")
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const stats: {
    label: string;
    value: number;
    sub: string;
    tone: Tone;
    href?: string;
    Icon: (p: { className?: string }) => ReactElement;
  }[] = [
    {
      label: "Bài viết",
      value: postsAll.count ?? 0,
      sub: `${postsPublished.count ?? 0} đã xuất bản`,
      tone: "brand",
      href: "/admin/posts",
      Icon: IconFile,
    },
    {
      label: "Ứng dụng & Dự án",
      value: projectsAll.count ?? 0,
      sub: `${projectsPublished.count ?? 0} đang hiển thị`,
      tone: "violet",
      href: "/admin/projects",
      Icon: IconRocket,
    },
    {
      label: "Tool AI",
      value: toolsAll.count ?? 0,
      sub: `${toolsPublished.count ?? 0} đang hiển thị`,
      tone: "sky",
      href: "/admin/ai-tools",
      Icon: IconSparkle,
    },
    {
      label: "Lời nhắn mới",
      value: messagesNew.count ?? 0,
      sub: "chưa xử lý",
      tone: "rose",
      href: "/admin/messages",
      Icon: IconMail,
    },
  ];

  /* ---- Gộp lượt xem theo trang và theo ngày ---- */
  const viewRows = (recentViews.data ?? []) as { path: string; created_at: string }[];

  const byPath = new Map<string, number>();
  for (const row of viewRows) byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxPath = topPaths[0]?.[1] ?? 1;

  const days: { label: string; key: string; count: number }[] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      count: 0,
    });
  }
  const dayIndex = new Map(days.map((d, i) => [d.key, i]));
  for (const row of viewRows) {
    const idx = dayIndex.get(row.created_at.slice(0, 10));
    if (idx !== undefined) days[idx].count += 1;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const total14 = days.reduce((a, b) => a + b.count, 0);

  // Bảng posts/messages chỉ có sau khi chạy v2-giao-dien-moi.sql
  const missingV2 = Boolean(postsAll.error || messagesNew.error);
  const missingBase = Boolean(projectsAll.error || viewsTotal.error);

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Toàn cảnh nội dung và lượt truy cập website"
        action={<LinkButton href="/admin/posts/new">+ Viết bài mới</LinkButton>}
      />

      {missingBase && (
        <div className="mb-6 rounded-card border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed text-ink-700">
          Không đọc được dữ liệu từ Supabase. Kiểm tra lại đã chạy{" "}
          <code className="rounded bg-brand-100 px-1">supabase/schema.sql</code> trong SQL
          Editor chưa.
        </div>
      )}

      {!missingBase && missingV2 && (
        <div className="mb-6 rounded-card border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed text-ink-700">
          Chưa có bảng cho bài viết và lời nhắn. Chạy file{" "}
          <code className="rounded bg-brand-100 px-1">supabase/v2-giao-dien-moi.sql</code>{" "}
          trong SQL Editor là xong.
        </div>
      )}

      {/* Thẻ số liệu */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, tone, href, Icon }) => {
          const inner = (
            <div className="h-full rounded-card border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-lift">
              <div className="flex items-start justify-between">
                <span
                  aria-hidden="true"
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${TILE_TONES[tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {href && <IconArrow className="h-4 w-4 text-ink-400" />}
              </div>
              <p className="mt-4 text-3xl font-extrabold text-ink-900">{value}</p>
              <p className="mt-0.5 text-sm font-semibold text-ink-700">{label}</p>
              <p className="mt-0.5 text-xs text-ink-400">{sub}</p>
            </div>
          );

          return href ? (
            <Link key={label} href={href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Biểu đồ lượt xem */}
        <Card className="lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-bold text-ink-900">Lượt xem 14 ngày gần nhất</h2>
            <p className="text-xs text-ink-400">
              Tổng {formatCount(total14)} lượt · toàn thời gian{" "}
              {formatCount(viewsTotal.count ?? 0)} · 7 ngày {formatCount(views7d.count ?? 0)}
            </p>
          </div>

          <div className="flex h-48 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-brand-300 transition-colors group-hover:bg-brand-400"
                    // Tối thiểu 3% để ngày không có lượt xem vẫn thấy được vạch
                    style={{ height: `${Math.max(3, (d.count / maxDay) * 100)}%` }}
                    title={`${d.label}: ${d.count} lượt`}
                  />
                </div>
                <span className="text-[10px] text-ink-400">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Trang xem nhiều */}
        <Card>
          <h2 className="text-base font-bold text-ink-900">Trang xem nhiều</h2>
          <p className="mb-5 mt-0.5 text-xs text-ink-400">30 ngày gần nhất</p>

          {topPaths.length === 0 ? (
            <p className="text-sm text-ink-400">Chưa có dữ liệu lượt xem.</p>
          ) : (
            <ul className="space-y-3.5">
              {topPaths.map(([path, count]) => (
                <li key={path}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-ink-700" title={path}>
                      {path}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-ink-900">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
                    <div
                      className="h-full rounded-full bg-brand-400"
                      style={{ width: `${(count / maxPath) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Bài viết sửa gần đây */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink-900">Bài viết sửa gần đây</h2>
            <Link
              href="/admin/posts"
              className="whitespace-nowrap text-xs font-medium text-ink-500 transition-colors hover:text-brand-600"
            >
              Xem tất cả →
            </Link>
          </div>

          {(recentPosts.data ?? []).length === 0 ? (
            <p className="text-sm text-ink-400">
              Chưa có bài viết nào. Bấm “Viết bài mới” ở góc trên để bắt đầu.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {(
                recentPosts.data as {
                  id: string;
                  title: string;
                  published: boolean;
                  updated_at: string;
                }[]
              ).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-brand-700"
                  >
                    <span className="truncate text-sm font-medium text-ink-700">
                      {p.title}
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-xs text-ink-400">
                      {p.published ? "Đã xuất bản" : "Nháp"} · {formatDate(p.updated_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Lối tắt */}
        <Card>
          <h2 className="mb-4 text-base font-bold text-ink-900">Thao tác nhanh</h2>
          <div className="grid gap-2">
            {[
              { href: "/admin/posts/new", label: "Viết bài mới", Icon: IconFile },
              { href: "/admin/categories", label: "Thêm chuyên mục", Icon: IconChart },
              { href: "/admin/projects/new", label: "Thêm dự án", Icon: IconRocket },
              { href: "/admin/ai-tools/new", label: "Thêm Tool AI", Icon: IconSparkle },
              {
                href: "/admin/media",
                label: `Thư viện ảnh (${mediaCount.count ?? 0})`,
                Icon: IconImage,
              },
              { href: "/admin/stats", label: "Xem thống kê", Icon: IconEye },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-soft px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                <Icon className="h-4 w-4 shrink-0 text-brand-600" />
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
