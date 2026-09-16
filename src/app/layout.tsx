import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { getSettings } from "@/lib/queries";
import "./globals.css";

/**
 * Be Vietnam Pro được thiết kế riêng cho tiếng Việt — dấu hỏi, dấu ngã, chữ đ
 * đều có bản vẽ riêng thay vì ghép tạm như phần lớn font Latin.
 */
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.site_title || "Lê Xuân Thân — Content Creator & Tech Builder",
    description:
      settings.site_description ||
      "Nội dung về công nghệ, AI, sáng tạo và các công cụ web tự phát triển.",
    keywords: "sáng tạo nội dung, AI, thương hiệu, công cụ web, Lê Xuân Thân",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body>{children}</body>
    </html>
  );
}
