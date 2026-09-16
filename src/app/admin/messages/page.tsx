import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import type { ContactMessage } from "@/lib/types";
import MessagesList from "./MessagesList";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  const messages = (data ?? []) as ContactMessage[];
  const unhandled = messages.filter((m) => !m.handled).length;

  return (
    <>
      <PageHeader
        title="Lời nhắn"
        description={
          messages.length > 0
            ? `${messages.length} lời nhắn · ${unhandled} chưa xử lý`
            : "Lời nhắn gửi từ form ở trang Liên hệ"
        }
      />

      {error && (
        <div className="mb-6 rounded-card border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-700">
          {error.message}
          {error.message.includes("does not exist") && (
            <>
              {" "}
              — chạy file{" "}
              <code className="rounded bg-rose-100 px-1">
                supabase/v2-giao-dien-moi.sql
              </code>{" "}
              trong Supabase SQL Editor là xong.
            </>
          )}
        </div>
      )}

      {!error && <MessagesList initial={messages} />}
    </>
  );
}
