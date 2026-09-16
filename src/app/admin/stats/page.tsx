import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/admin/ui";
import { formatCount } from "@/lib/format";

export const dynamic = "force-dynamic";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Bỏ giao thức và tham số để gom "google.com/search?q=…" về đúng một nguồn. */
function hostOf(referrer: string | null): string {
  if (!referrer) return "Truy cập thẳng";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Không rõ";
  }
}

export default async function AdminStatsPage() {
  const supabase = await createClient();

  const [totalRes, rowsRes] = await Promise.all([
    supabase.from("page_views").select("id", { count: "exact", head: true }),
    supabase
      .from("page_views")
      .select("path, referrer, created_at")
      .gte("created_at", isoDaysAgo(29))
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  const rows = (rowsRes.data ?? []) as {
    path: string;
    referrer: string | null;
    created_at: string;
  }[];

  /* ---- Gom theo ngày ---- */
  const days: { key: string; label: string; count: number }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
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
  for (const r of rows) {
    const idx = dayIndex.get(r.created_at.slice(0, 10));
    if (idx !== undefined) days[idx].count += 1;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  /* ---- Gom theo trang và theo nguồn ---- */
  function tally(pick: (r: (typeof rows)[number]) => string) {
    const map = new Map<string, number>();
    for (const r of rows) {
      const key = pick(r);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }

  const topPaths = tally((r) => r.path).slice(0, 12);
  const topSources = tally((r) => hostOf(r.referrer)).slice(0, 8);

  const total30 = rows.length;
  const last7 = days.slice(-7).reduce((a, b) => a + b.count, 0);
  const prev7 = days.slice(-14, -7).reduce((a, b) => a + b.count, 0);
  const delta = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);

  return (
    <>
      <PageHeader
        title="Thống kê"
        description="Lượt xem trang trong 30 ngày gần nhất. Số liệu do chính website tự ghi, không dùng dịch vụ theo dõi bên ngoài."
      />

      {rowsRes.error && (
        <div className="mb-6 rounded-card border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {rowsRes.error.message}
        </div>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Toàn thời gian", value: formatCount(totalRes.count ?? 0), sub: "lượt xem" },
          { label: "30 ngày qua", value: formatCount(total30), sub: "lượt xem" },
          {
            label: "7 ngày qua",
            value: formatCount(last7),
            sub:
              delta === null
                ? "chưa đủ dữ liệu để so sánh"
                : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}% so với tuần trước`,
          },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-ink-900">{s.value}</p>
            <p className="mt-0.5 text-xs text-ink-500">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-5">
        <h2 className="mb-5 text-base font-bold text-ink-900">Lượt xem theo ngày</h2>
        <div className="flex h-56 items-end gap-1">
          {days.map((d, i) => (
            <div key={d.key} className="group flex flex-1 flex-col items-center gap-1.5">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-brand-300 transition-colors group-hover:bg-brand-400"
                  style={{ height: `${Math.max(2, (d.count / maxDay) * 100)}%` }}
                  title={`${d.label}: ${d.count} lượt`}
                />
              </div>
              {/* 30 nhãn thì chật, chỉ ghi cách ngày một */}
              <span className="text-[9px] text-ink-400">
                {i % 3 === 0 ? d.label : ""}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-bold text-ink-900">Trang xem nhiều nhất</h2>
          {topPaths.length === 0 ? (
            <p className="text-sm text-ink-400">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-3">
              {topPaths.map(([path, count]) => (
                <li key={path}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-ink-700" title={path}>
                      {path}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-ink-900">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
                    <div
                      className="h-full rounded-full bg-brand-400"
                      style={{ width: `${(count / topPaths[0][1]) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-bold text-ink-900">Người xem đến từ đâu</h2>
          {topSources.length === 0 ? (
            <p className="text-sm text-ink-400">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-3">
              {topSources.map(([source, count]) => (
                <li key={source}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-ink-700">{source}</span>
                    <span className="shrink-0 text-sm font-bold text-ink-900">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
                    <div
                      className="h-full rounded-full bg-brand-400"
                      style={{ width: `${(count / topSources[0][1]) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
