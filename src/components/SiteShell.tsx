import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ViewTracker from "@/components/ViewTracker";
import { getSettings } from "@/lib/queries";

/**
 * Khung chung cho toàn bộ trang public (navbar + footer + đếm lượt xem).
 * Trang /admin và /login KHÔNG dùng component này.
 */
export default async function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink-900">
      <ViewTracker />
      <Navbar brandName={settings.brand_name || "Lê Xuân Thân"} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
