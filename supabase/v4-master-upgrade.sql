-- =============================================================
--  NÂNG CẤP ĐỒNG BỘ v4 — Cấu hình Trang chủ, Hero 3D & Liên thông
--  Chạy idempotent (nhiều lần không lỗi, KHÔNG xoá dữ liệu hiện có).
-- =============================================================

-- 1. Bổ sung cột home_config (JSONB) vào bảng settings để lưu cấu hình
--    Hero, 3D preset, 3 thẻ nổi bật tham chiếu theo ID, thứ tự section và bản nháp.
alter table public.settings
  add column if not exists home_config jsonb default '{}'::jsonb;

-- 2. Bổ sung cột category_group cho bảng ai_tools để phân nhóm trên /ai-tools
alter table public.ai_tools
  add column if not exists category_group text default 'general';

-- 3. Cập nhật đường dẫn dự án Tra cứu đại học từ /#tra-cuu-dai-hoc sang /ai-tools/tra-cuu-dai-hoc
update public.projects
set link_url = '/ai-tools/tra-cuu-dai-hoc'
where link_url = '/#tra-cuu-dai-hoc';

-- =============================================================
--  ROLLBACK (chỉ chạy khi muốn hoàn tác cấu trúc v4):
--  update public.projects set link_url = '/#tra-cuu-dai-hoc' where link_url = '/ai-tools/tra-cuu-dai-hoc';
--  alter table public.ai_tools drop column if exists category_group;
--  alter table public.settings drop column if exists home_config;
-- =============================================================
