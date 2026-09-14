import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSettings } from "@/lib/queries";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.site_title || "Lê Xuân Thân - Brand & Communications",
    description:
      settings.site_description ||
      "Personal portfolio & AI tools by Lê Xuân Thân.",
    keywords: "branding, design, AI, content creation, portfolio",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
