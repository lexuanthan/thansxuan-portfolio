import { createClient } from "@/lib/supabase/server";
import { FALLBACK_ABOUT } from "@/lib/fallback";
import type { AboutPage } from "@/lib/types";
import { PageHeader } from "@/components/admin/ui";
import AboutForm from "./AboutForm";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_page")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const row = (data ?? {}) as Partial<AboutPage>;
  const about: AboutPage = {
    ...FALLBACK_ABOUT,
    ...row,
    id: 1,
    skills: Array.isArray(row.skills) ? row.skills : FALLBACK_ABOUT.skills,
    journey: Array.isArray(row.journey) ? row.journey : FALLBACK_ABOUT.journey,
    core_values: Array.isArray(row.core_values)
      ? row.core_values
      : FALLBACK_ABOUT.core_values,
  };

  return (
    <>
      <PageHeader
        title="About page"
        description="Chỉnh sửa bio, kỹ năng, hành trình và giá trị cốt lõi"
      />
      <AboutForm about={about} exists={Boolean(data)} />
    </>
  );
}
