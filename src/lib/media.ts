import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET } from "@/lib/supabase/config";
import { slugify } from "@/lib/slug";
import type { MediaItem } from "@/lib/types";

/** Bỏ dấu tiếng Việt + ký tự lạ để tên file an toàn trên storage. */
export function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "bin";

  const slug = slugify(base, 60);

  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${slug || "file"}-${stamp}${rand}.${ext}`;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

/** Upload 1 file lên bucket `media` và ghi record vào bảng `media`. */
export async function uploadMedia(
  supabase: SupabaseClient,
  file: File
): Promise<MediaItem> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" không phải file ảnh.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `"${file.name}" nặng ${formatBytes(file.size)} — tối đa ${formatBytes(
        MAX_UPLOAD_BYTES
      )}.`
    );
  }

  const path = `uploads/${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("media")
    .insert({
      name: file.name,
      path,
      url: publicUrl,
      size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (error) {
    // Rollback file đã upload để không mồ côi
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    throw new Error(error.message);
  }

  return data as MediaItem;
}

/** Xoá file khỏi storage + record trong bảng media. */
export async function deleteMedia(
  supabase: SupabaseClient,
  item: Pick<MediaItem, "id" | "path">
): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([item.path]);
  if (storageError) throw new Error(storageError.message);

  const { error } = await supabase.from("media").delete().eq("id", item.id);
  if (error) throw new Error(error.message);
}
