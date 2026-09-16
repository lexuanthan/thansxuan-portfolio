-- =============================================================
--  NÂNG CẤP v3 — ảnh bìa trang chủ
--
--  Chạy MỘT LẦN trong Supabase Dashboard > SQL Editor, sau file v2.
--  Chạy lại nhiều lần cũng không sao.
--
--  Phần soạn thảo văn bản và công cụ xoá đối tượng không cần đổi database:
--  nội dung bài viết vẫn nằm ở cột `content` như cũ, chỉ khác là giờ lưu HTML
--  thay vì chữ thuần. Bài cũ vẫn hiển thị bình thường vì web tự nhận ra đâu là
--  HTML, đâu là chữ thuần.
-- =============================================================

alter table public.settings
  add column if not exists hero_image_url text;

comment on column public.settings.hero_image_url is
  'Ảnh bìa hiện bên phải phần giới thiệu đầu trang chủ. Bỏ trống thì web dùng khối trang trí vẽ sẵn.';

-- Kiểm tra
select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'settings'
  and column_name in ('quote', 'hero_image_url')
order by column_name;
-- Kết quả mong đợi: hai dòng, quote và hero_image_url, đều kiểu text
