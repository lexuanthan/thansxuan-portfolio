import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import ImageComposer, { type PresetLogo } from "@/components/composer/ImageComposer";
import { Chip } from "@/components/ui";
import { IconArrow } from "@/components/ui/icons";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ghép logo & chữ lên ảnh",
  description:
    "Công cụ ghép logo gốc và chữ lên ảnh ngay trên trình duyệt. Logo giữ nguyên từng pixel, không bị AI vẽ lại sai.",
};

async function getLogos(): Promise<PresetLogo[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("media")
      .select("id, name, url")
      .eq("is_logo", true)
      .order("created_at", { ascending: false })
      .limit(48);

    if (error || !data) return [];
    return data as PresetLogo[];
  } catch {
    return [];
  }
}

export default async function LogoComposerPage() {
  const logos = await getLogos();

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href="/ai-tools"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
          >
            <IconArrow className="h-4 w-4 rotate-180" />
            Tất cả AI Tools
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
              Ghép logo &amp; chữ lên ảnh
            </h1>
            <Chip tone="emerald">Đang chạy</Chip>
          </div>

          <p className="mt-3 max-w-3xl leading-relaxed text-ink-500">
            Các công cụ AI luôn <em>vẽ lại</em> logo theo trí nhớ nên chữ méo, tỷ lệ
            lệch, màu trật. Tool này làm ngược lại: lấy đúng file logo gốc ghép đè lên
            ảnh bằng canvas, nên logo giữ nguyên từng pixel. Mọi thứ chạy ngay trên máy
            anh — ảnh không được gửi đi đâu cả.
          </p>
        </header>

        <ImageComposer presetLogos={logos} />
      </div>
    </SiteShell>
  );
}
