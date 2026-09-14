import { createClient } from "@/lib/supabase/server";
import { FALLBACK_SETTINGS } from "@/lib/fallback";
import type { Settings } from "@/lib/types";
import { PageHeader } from "@/components/admin/ui";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const row = (data ?? {}) as Partial<Settings>;
  const settings: Settings = {
    ...FALLBACK_SETTINGS,
    ...row,
    id: 1,
    social:
      row.social && typeof row.social === "object" ? row.social : {},
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Thông tin liên hệ, social links và metadata của website"
      />
      <SettingsForm settings={settings} exists={Boolean(data)} />
    </>
  );
}
