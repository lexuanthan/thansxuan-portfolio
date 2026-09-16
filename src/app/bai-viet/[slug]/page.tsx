import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import RichText from "@/components/RichText";
import HtmlContent from "@/components/HtmlContent";
import { PostRow } from "@/components/content/PostCard";
import {
  Card,
  CardHeader,
  Chip,
  Container,
  Meta,
  MetaRow,
  toneForLabel,
} from "@/components/ui";
import { IconArrow, IconCalendar, IconEye, IconFile } from "@/components/ui/icons";
import { getPostBySlug, getPosts } from "@/lib/queries";
import { formatCount, formatDate } from "@/lib/format";
import { looksLikeHtml } from "@/lib/html";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Không tìm thấy bài viết" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function BaiVietChiTiet({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const others = (await getPosts(6)).filter((p) => p.id !== post.id).slice(0, 4);

  return (
    <SiteShell>
      <Container className="py-10">
        <Link
          href="/bai-viet"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
        >
          <IconArrow className="h-4 w-4 rotate-180" />
          Tất cả bài viết
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <article>
            {post.category_name && (
              <Chip tone={toneForLabel(post.category_name)}>{post.category_name}</Chip>
            )}

            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl">
              {post.title}
            </h1>

            <div className="mt-4">
              <MetaRow>
                <Meta icon={<IconCalendar className="h-3.5 w-3.5" />}>
                  {formatDate(post.published_at ?? post.created_at)}
                </Meta>
                <Meta icon={<IconEye className="h-3.5 w-3.5" />}>
                  {formatCount(post.views)} lượt xem
                </Meta>
              </MetaRow>
            </div>

            {post.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_url}
                alt=""
                className="mt-6 w-full rounded-card-lg object-cover"
              />
            )}

            {post.excerpt && (
              <p className="mt-6 rounded-card border-l-4 border-brand-400 bg-brand-50 p-4 text-[15px] font-medium leading-relaxed text-ink-700">
                {post.excerpt}
              </p>
            )}

            {post.content ? (
              /**
               * Bài soạn bằng trình soạn thảo mới lưu HTML; bài cũ lưu chữ
               * thuần. Nhận diện rồi dựng bằng đúng bộ render, để bài cũ không
               * hiện ra nguyên đống thẻ.
               */
              looksLikeHtml(post.content) ? (
                <HtmlContent html={post.content} className="mt-6" />
              ) : (
                <RichText
                  text={post.content}
                  className="mt-6 space-y-4"
                  paragraphClassName="text-[15px] leading-[1.9] text-ink-700"
                />
              )
            ) : (
              <p className="mt-6 text-ink-400">Bài viết này chưa có nội dung.</p>
            )}

            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-1.5 border-t border-line pt-6">
                {post.tags.map((t) => (
                  <Chip key={t} tone={toneForLabel(t)}>
                    #{t}
                  </Chip>
                ))}
              </div>
            )}
          </article>

          <aside className="space-y-6">
            {others.length > 0 && (
              <Card>
                <CardHeader
                  icon={<IconFile className="h-4 w-4" />}
                  title="Bài viết khác"
                  actionHref="/bai-viet"
                />
                <div className="space-y-4">
                  {others.map((p) => (
                    <PostRow key={p.id} post={p} />
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </Container>
    </SiteShell>
  );
}
