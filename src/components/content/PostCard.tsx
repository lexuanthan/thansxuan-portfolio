import Link from "next/link";
import { Chip, Meta, MetaRow, toneForLabel } from "@/components/ui";
import { IconCalendar, IconEye } from "@/components/ui/icons";
import { formatCount, formatDate, plainText, truncate } from "@/lib/format";
import type { Post } from "@/lib/types";

/**
 * Ảnh bìa thay thế khi bài viết chưa có ảnh: một mảng màu chuyển sắc lấy theo
 * tên bài, kèm chữ cái đầu. Cùng một bài luôn ra cùng một màu nên trang không
 * nhấp nháy đổi màu mỗi lần tải lại.
 */
const COVER_GRADIENTS = [
  "from-amber-200 to-orange-300",
  "from-sky-200 to-cyan-300",
  "from-violet-200 to-fuchsia-300",
  "from-emerald-200 to-teal-300",
  "from-rose-200 to-pink-300",
  "from-indigo-200 to-blue-300",
];

function gradientFor(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i += 1) sum += seed.charCodeAt(i);
  return COVER_GRADIENTS[sum % COVER_GRADIENTS.length];
}

function Cover({ post, className }: { post: Post; className: string }) {
  if (post.cover_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.cover_url}
        alt=""
        loading="lazy"
        className={`${className} object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${className} flex items-center justify-center bg-gradient-to-br ${gradientFor(
        post.title
      )}`}
    >
      <span className="text-3xl font-extrabold text-white/80">
        {post.title.trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------
   Dạng thẻ đứng — dùng cho lưới bài viết nổi bật
   --------------------------------------------------------------- */

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-lift">
      <Link href={`/bai-viet/${post.slug}`} className="block">
        <div className="relative">
          <Cover post={post} className="h-36 w-full" />
          {post.category_name && (
            <span className="absolute left-3 top-3">
              <Chip tone={toneForLabel(post.category_name)}>{post.category_name}</Chip>
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
              {truncate(plainText(post.excerpt), 110)}
            </p>
          )}

          <div className="mt-3">
            <MetaRow>
              <Meta icon={<IconCalendar className="h-3.5 w-3.5" />}>
                {formatDate(post.published_at ?? post.created_at)}
              </Meta>
              <Meta icon={<IconEye className="h-3.5 w-3.5" />}>
                {formatCount(post.views)}
              </Meta>
            </MetaRow>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ---------------------------------------------------------------
   Dạng hàng ngang — dùng cho danh sách dài, tốn ít chiều cao hơn
   --------------------------------------------------------------- */

export function PostRow({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link href={`/bai-viet/${post.slug}`} className="flex gap-4">
        <Cover post={post} className="h-16 w-16 shrink-0 rounded-xl" />

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
            {post.title}
          </h3>
          <div className="mt-1.5">
            <MetaRow>
              <Meta>{formatDate(post.published_at ?? post.created_at)}</Meta>
              {post.category_name && <Meta>{post.category_name}</Meta>}
            </MetaRow>
          </div>
        </div>
      </Link>
    </article>
  );
}
