import { ButtonLink } from "@/components/ui";
import { IconArrow, IconFile } from "@/components/ui/icons";
import type { Settings } from "@/lib/types";

/**
 * Khối trang trí dùng khi chưa có ảnh bìa.
 * Dựng bằng khối màu và ký hiệu thay cho ảnh: web mới dựng chưa có ảnh vẫn
 * trông hoàn chỉnh, không để lỗ trống hay ô ảnh vỡ.
 */
function HeroArt() {
  const tiles = [
    { label: "AI", tone: "bg-violet-100 text-violet-700", span: "col-span-2" },
    { label: "◷", tone: "bg-sky-100 text-sky-700", span: "" },
    { label: "✎", tone: "bg-rose-100 text-rose-700", span: "" },
    { label: "◧", tone: "bg-emerald-100 text-emerald-700", span: "" },
    { label: "⌘", tone: "bg-amber-100 text-amber-700", span: "col-span-2" },
  ];

  return (
    <div aria-hidden="true" className="relative hidden lg:block">
      <div className="absolute -inset-6 rounded-full bg-white/45 blur-2xl" />

      <div className="relative rounded-card-lg bg-white/70 p-5 shadow-soft backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {tiles.map((t, i) => (
            <div
              key={i}
              className={`flex h-16 items-center justify-center rounded-2xl text-xl font-bold ${t.tone} ${t.span}`}
            >
              {t.label}
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <div className="h-2.5 w-4/5 rounded-full bg-brand-100" />
          <div className="h-2.5 w-3/5 rounded-full bg-brand-100" />
        </div>
      </div>
    </div>
  );
}

export default function Hero({ settings }: { settings: Settings }) {
  const name = settings.hero_title || "Lê Xuân Thân";
  const role =
    settings.hero_subtitle || "Người sáng tạo nội dung & xây dựng ứng dụng công nghệ";
  const cover = settings.hero_image_url?.trim() || null;

  return (
    <section className="overflow-hidden rounded-card-lg bg-gradient-to-br from-brand-200 via-brand-100 to-brand-50 px-6 py-10 sm:px-10 sm:py-12">
      <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <span className="inline-flex items-center rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">
            Xin chào!
          </span>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl lg:text-5xl">
            Tôi là <span className="text-brand-700">{name}</span>
          </h1>

          <p className="mt-3 text-base font-semibold text-ink-700 lg:text-lg">{role}</p>

          <p className="mt-4 max-w-xl leading-relaxed text-ink-700/85">
            {settings.site_description ||
              "Tôi chia sẻ những nội dung hữu ích về công nghệ, AI, sáng tạo và truyền thông. Đồng thời tôi cũng phát triển các công cụ, ứng dụng web giúp tối ưu công việc và học tập."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/gioi-thieu" tone="primary">
              Khám phá về tôi
              <IconArrow className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/bai-viet" tone="outline">
              <IconFile className="h-4 w-4" />
              Xem bài viết mới nhất
            </ButtonLink>
          </div>
        </div>

        {cover ? (
          /**
           * aspect-[4/3] + object-cover: ảnh nào cũng lấp đầy đúng khung, không
           * kéo méo và không làm cả hero cao vống lên khi anh tải ảnh dọc.
           */
          <div className="overflow-hidden rounded-card-lg bg-white/60 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              className="aspect-[4/3] w-full object-cover"
              // Ảnh này luôn nằm ngay đầu trang nên tải ngay, đừng hoãn
              loading="eager"
            />
          </div>
        ) : (
          <HeroArt />
        )}
      </div>
    </section>
  );
}
