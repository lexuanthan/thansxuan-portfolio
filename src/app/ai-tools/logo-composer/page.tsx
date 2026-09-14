import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import ImageComposer, { type PresetLogo } from "@/components/composer/ImageComposer";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ghép logo & chữ lên ảnh · Lê Xuân Thân",
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
      <div className="min-h-screen bg-slate-900 py-10 text-white">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/ai-tools"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Tất cả AI Tools
            </Link>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Ghép logo &amp; chữ lên ảnh
            </h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              Các công cụ AI luôn <em>vẽ lại</em> logo theo trí nhớ nên chữ méo, tỷ lệ
              lệch, màu trật. Tool này làm ngược lại: lấy đúng file logo gốc ghép đè
              lên ảnh bằng canvas, nên logo giữ nguyên từng pixel. Mọi thứ chạy ngay
              trên máy anh — ảnh không được gửi đi đâu cả.
            </p>
          </div>

          <ImageComposer presetLogos={logos} />
        </div>
      </div>
    </SiteShell>
  );
}
