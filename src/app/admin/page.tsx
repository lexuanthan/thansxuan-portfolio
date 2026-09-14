import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

type Stat = {
  label: string;
  value: number | string;
  icon: string;
  sub?: string;
  href?: string;
  gradient: string;
};

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    projectsAll,
    projectsPublished,
    toolsAll,
    toolsPublished,
    mediaCount,
    viewsTotal,
    views7d,
    views30d,
    recentViews,
    recentProjects,
  ] = await Promise.all([
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
    supabase.from("page_views").select("id", { count: "exact", head: true }),
    supabase
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDaysAgo(6)),
    supabase
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfDaysAgo(29)),
    supabase
      .from("page_views")
      .select("path, created_at")
      .gte("created_at", startOfDaysAgo(29))
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("projects")
      .select("id, title, published, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const stats: Stat[] = [
    {
      label: "Projects",
      value: projectsAll.count ?? 0,
      sub: `${projectsPublished.count ?? 0} đang hiển thị`,
      icon: "📂",
      href: "/admin/projects",
      gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
      label: "AI Tools",
      value: toolsAll.count ?? 0,
      sub: `${toolsPublished.count ?? 0} đang hiển thị`,
      icon: "🤖",
      href: "/admin/ai-tools",
      gradient: "from-purple-500/20 to-pink-500/10",
    },
    {
      label: "Media",
      value: mediaCount.count ?? 0,
      sub: "ảnh trong thư viện",
      icon: "🖼️",
      href: "/admin/media",
      gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
      label: "Lượt xem",
      value: viewsTotal.count ?? 0,
      sub: `${views7d.count ?? 0} trong 7 ngày · ${views30d.count ?? 0} trong 30 ngày`,
      icon: "👁️",
      gradient: "from-emerald-500/20 to-teal-500/10",
    },
  ];

  // Top trang trong 30 ngày
  const viewRows = (recentViews.data ?? []) as { path: string; created_at: string }[];
  const byPath = new Map<string, number>();
  for (const row of viewRows) byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxPath = topPaths[0]?.[1] ?? 1;

  // Biểu đồ 14 ngày gần nhất
  const days: { label: string; key: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}`, count: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.key, i]));
  for (const row of viewRows) {
    const key = row.created_at.slice(0, 10);
    const idx = dayIndex.get(key);
    if (idx !== undefined) days[idx].count += 1;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  const dbError =
    projectsAll.error || toolsAll.error || viewsTotal.error ? true : false;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Tổng quan nội dung và lượt truy cập website"
        action={<LinkButton href="/admin/projects/new">+ Thêm project</LinkButton>}
      />

      {dbError && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Không đọc được dữ liệu từ Supabase. Hãy chắc chắn đã chạy file{" "}
          <code>supabase/schema.sql</code> trong SQL Editor.
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <div
              className={`h-full rounded-xl border border-white/10 bg-gradient-to-br ${s.gradient} p-5 transition hover:border-white/20`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{s.icon}</span>
                {s.href && <span className="text-xs text-slate-400">→</span>}
              </div>
              <p className="mt-4 text-3xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-300">{s.label}</p>
              {s.sub && <p className="mt-1 text-xs text-slate-400">{s.sub}</p>}
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <h2 className="mb-1 text-lg font-semibold text-white">
            Lượt xem 14 ngày gần nhất
          </h2>
          <p className="mb-6 text-xs text-slate-400">
            Tổng {days.reduce((a, b) => a + b.count, 0)} lượt
          </p>
          <div className="flex h-48 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-blue-600 to-purple-500 transition-all group-hover:from-blue-500 group-hover:to-purple-400"
                    style={{ height: `${Math.max(3, (d.count / maxDay) * 100)}%` }}
                    title={`${d.label}: ${d.count} lượt`}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top pages */}
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Trang xem nhiều</h2>
          <p className="mb-5 text-xs text-slate-400">30 ngày gần nhất</p>
          {topPaths.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có dữ liệu lượt xem.</p>
          ) : (
            <ul className="space-y-3.5">
              {topPaths.map(([path, count]) => (
                <li key={path}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-slate-300">{path}</span>
                    <span className="shrink-0 text-sm font-semibold text-white">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${(count / maxPath) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent projects */}
      <Card className="mt-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Sửa gần đây</h2>
          <Link
            href="/admin/projects"
            className="text-sm text-blue-400 transition hover:text-blue-300"
          >
            Xem tất cả →
          </Link>
        </div>
        {(recentProjects.data ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có project nào.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {(recentProjects.data as {
              id: string;
              title: string;
              published: boolean;
              updated_at: string;
            }[]).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition hover:text-white"
                >
                  <span className="truncate text-sm text-slate-300">{p.title}</span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {p.published ? "Hiển thị" : "Nháp"} ·{" "}
                    {new Date(p.updated_at).toLocaleDateString("vi-VN")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
