import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { flattenPost } from "@/lib/queries";
import type { Category } from "@/lib/types";
import PostForm from "../PostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [postRes, catRes] = await Promise.all([
    supabase.from("posts").select("*, categories(name)").eq("id", id).maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  if (!postRes.data) notFound();

  const post = flattenPost(postRes.data as Record<string, unknown>);

  return (
    <>
      <PageHeader
        title="Sửa bài viết"
        description={post.title}
        action={
          post.published ? (
            <LinkButton href={`/bai-viet/${post.slug}`} variant="ghost" external>
              Xem ngoài web ↗
            </LinkButton>
          ) : undefined
        }
      />
      <PostForm post={post} categories={(catRes.data ?? []) as Category[]} />
    </>
  );
}
