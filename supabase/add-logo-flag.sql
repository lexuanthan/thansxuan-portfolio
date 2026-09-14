-- =============================================================
--  CÀI ĐẶT CHO TOOL "GHÉP LOGO & CHỮ LÊN ẢNH"
--  Chạy 1 lần trong Supabase > SQL Editor. Chạy lại nhiều lần không sao.
--
--  Gồm 2 việc:
--    1. Thêm cột đánh dấu logo cho Media library
--    2. Đưa tool lên trang AI Tools của website
-- =============================================================

-- ---------- 1. Đánh dấu ảnh nào trong Media library là LOGO ----------
alter table public.media
  add column if not exists is_logo boolean not null default false;

-- Chỉ đánh index phần logo cho gọn, vì số logo luôn ít hơn ảnh thường rất nhiều.
create index if not exists media_is_logo_idx
  on public.media (created_at desc)
  where is_logo;

-- ---------- 2. Đăng ký tool vào trang AI Tools ----------
insert into public.ai_tools
  (title, description, icon, color, status, status_color, link_url, published, sort_order)
select
  'Ghép logo & chữ lên ảnh',
  E'Ghép logo gốc và chữ lên ảnh ngay trên trình duyệt. Kéo thả, phóng to, xoay tự do.\nLogo giữ nguyên từng pixel vì không hề bị AI vẽ lại. Xuất PNG đúng kích thước mạng xã hội.',
  '🖼️',
  'from-blue-100 to-cyan-100',
  'Live',
  'green',
  '/ai-tools/logo-composer',
  true,
  0
where not exists (
  select 1 from public.ai_tools where link_url = '/ai-tools/logo-composer'
);

-- ---------- Kiểm tra ----------
select
  (select count(*) from public.media where is_logo)                                as so_logo_da_danh_dau,
  (select count(*) from public.ai_tools where link_url = '/ai-tools/logo-composer') as tool_da_dang_ky;
-- Kết quả mong đợi: tool_da_dang_ky = 1
-- (so_logo_da_danh_dau = 0 là bình thường, anh đánh dấu logo trong /admin/media sau)
