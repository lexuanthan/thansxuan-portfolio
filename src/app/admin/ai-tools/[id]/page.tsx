import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AiTool } from "@/lib/types";
import { PageHeader } from "@/components/admin/ui";
import ToolForm from "../ToolForm";

export const dynamic = "force-dynamic";

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_tools")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <>
      <PageHeader title="Sửa AI Tool" description={(data as AiTool).title} />
      <ToolForm tool={data as AiTool} />
    </>
  );
}
