import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ViewTracker from "@/components/ViewTracker";
import { getSettings } from "@/lib/queries";

/**
 * Khung chung cho toàn bộ trang public (navbar + footer + tracking).
 * Trang /admin và /login KHÔNG dùng component này.
 */
export default async function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="bg-white text-gray-900">
      <ViewTracker />
      <Navbar brandName={settings.brand_name || "Thế giới của Thân LX"} />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
