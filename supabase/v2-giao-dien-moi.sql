-- =============================================================
--  NÂNG CẤP v2 — bộ giao diện mới + các module nội dung
--
--  Chạy MỘT LẦN trong Supabase Dashboard > SQL Editor.
--  Chạy lại nhiều lần cũng không sao: mọi lệnh đều có "if not exists"
--  hoặc "drop ... if exists" đứng trước.
--
--  File này KHÔNG xoá dữ liệu nào. Phần dọn nội dung mẫu nằm riêng ở
--  cuối, đã chú thích sẵn, anh tự bỏ dấu chú thích khi muốn chạy.
-- =============================================================

-- ----------------------------------------------------------------
--  1. Thêm câu tâm đắc vào phần cài đặt
-- ----------------------------------------------------------------
alter table public.settings
  add column if not exists quote text default 'Học hỏi mỗi ngày, tạo ra giá trị mỗi ngày!';

-- ----------------------------------------------------------------
--  2. CHUYÊN MỤC
-- ----------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
--  3. BÀI VIẾT
--
--  Xoá chuyên mục thì bài viết KHÔNG bị xoá theo (on delete set null) —
--  mất một cái nhãn phân loại không đáng để mất luôn bài viết.
-- ----------------------------------------------------------------
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text default '',
  content      text default '',
  cover_url    text,
  category_id  uuid references public.categories(id) on delete set null,
  tags         text[] not null default '{}',
  featured     boolean not null default false,
  published    boolean not null default false,
  views        integer not null default 0,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Trang danh sách luôn lọc published rồi sắp theo ngày đăng.
create index if not exists posts_published_idx
  on public.posts (published_at desc nulls last)
  where published;

create index if not exists posts_category_idx on public.posts (category_id);

-- ----------------------------------------------------------------
--  4. TÀI NGUYÊN
-- ----------------------------------------------------------------
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text default '',
  url         text,
  kind        text not null default 'link',   -- link | file | template | course | tool
  icon        text not null default '📦',
  tags        text[] not null default '{}',
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
--  5. HẠNG MỤC TƯ VẤN
-- ----------------------------------------------------------------
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text default '',
  bullets     jsonb not null default '[]'::jsonb,   -- ["ý 1", "ý 2", ...]
  icon        text not null default '💡',
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
--  6. LỜI NHẮN TỪ FORM LIÊN HỆ
-- ----------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  content    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_unhandled_idx
  on public.messages (created_at desc)
  where not handled;

-- ----------------------------------------------------------------
--  7. Tự cập nhật updated_at
-- ----------------------------------------------------------------
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at before update on public.resources
  for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------
--  8. PHÂN QUYỀN (RLS)
--
--  Nguyên tắc: khách chỉ đọc được thứ đã xuất bản. Riêng bảng lời nhắn
--  thì ngược lại — khách được GHI nhưng tuyệt đối không được ĐỌC, nếu
--  không ai cũng xem được lời nhắn của người khác.
-- ----------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.posts      enable row level security;
alter table public.resources  enable row level security;
alter table public.services   enable row level security;
alter table public.messages   enable row level security;

-- CHUYÊN MỤC
drop policy if exists "categories public read" on public.categories;
drop policy if exists "categories admin all"   on public.categories;
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin all" on public.categories
  for all to authenticated using (true) with check (true);

-- BÀI VIẾT
drop policy if exists "posts public read" on public.posts;
drop policy if exists "posts admin all"   on public.posts;
create policy "posts public read" on public.posts
  for select using (published = true or auth.role() = 'authenticated');
create policy "posts admin all" on public.posts
  for all to authenticated using (true) with check (true);

-- TÀI NGUYÊN
drop policy if exists "resources public read" on public.resources;
drop policy if exists "resources admin all"   on public.resources;
create policy "resources public read" on public.resources
  for select using (published = true or auth.role() = 'authenticated');
create policy "resources admin all" on public.resources
  for all to authenticated using (true) with check (true);

-- TƯ VẤN
drop policy if exists "services public read" on public.services;
drop policy if exists "services admin all"   on public.services;
create policy "services public read" on public.services
  for select using (published = true or auth.role() = 'authenticated');
create policy "services admin all" on public.services
  for all to authenticated using (true) with check (true);

-- LỜI NHẮN: khách gửi được, chỉ admin đọc và xử lý
drop policy if exists "messages anyone insert" on public.messages;
drop policy if exists "messages admin read"    on public.messages;
drop policy if exists "messages admin write"   on public.messages;
create policy "messages anyone insert" on public.messages
  for insert to anon, authenticated with check (true);
create policy "messages admin read" on public.messages
  for select to authenticated using (true);
create policy "messages admin write" on public.messages
  for update to authenticated using (true) with check (true);
-- Không có policy DELETE cho ai cả: lời nhắn chỉ đánh dấu đã xử lý,
-- không xoá, để về sau còn tra lại được.

-- ----------------------------------------------------------------
--  9. Vài chuyên mục khởi đầu
--     Chỉ chèn khi bảng còn trống, để không đè lên chuyên mục anh tự đặt.
-- ----------------------------------------------------------------
insert into public.categories (name, slug, sort_order)
select * from (values
  ('Công nghệ',        'cong-nghe',        1),
  ('AI & Công cụ',     'ai-va-cong-cu',    2),
  ('Sáng tạo nội dung','sang-tao-noi-dung', 3),
  ('Thương hiệu',      'thuong-hieu',      4),
  ('Kỹ năng',          'ky-nang',          5)
) as seed(name, slug, sort_order)
where not exists (select 1 from public.categories);

-- ----------------------------------------------------------------
--  10. Đếm lượt xem cho từng bài viết
--
--  Khách phải tăng được số đếm, nhưng KHÔNG được quyền sửa bảng posts —
--  mở quyền UPDATE cho khách thì ai cũng đổi được nội dung bài. Hàm
--  security definer là lối thoát: nó chạy bằng quyền của người tạo hàm,
--  và chỉ làm đúng một việc là cộng thêm 1.
-- ----------------------------------------------------------------
create or replace function public.increment_post_views(post_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
     set views = views + 1
   where slug = post_slug
     and published;
$$;

grant execute on function public.increment_post_views(text) to anon, authenticated;

-- ----------------------------------------------------------------
--  11. Kiểm tra
-- ----------------------------------------------------------------
select
  (select count(*) from public.categories) as so_chuyen_muc,
  (select count(*) from public.posts)      as so_bai_viet,
  (select count(*) from public.resources)  as so_tai_nguyen,
  (select count(*) from public.services)   as so_muc_tu_van,
  (select count(*) from public.messages)   as so_loi_nhan;

-- =============================================================
--  DỌN NỘI DUNG MẪU  —  CHỈ CHẠY KHI ANH ĐÃ CHẮC CHẮN
--
--  Hai lệnh dưới đây XOÁ THẬT và không hoàn tác được. Chúng giữ lại
--  đúng tool ghép logo, xoá mọi dự án và công cụ mẫu còn lại.
--
--  Muốn chạy: bôi đen hai lệnh, bỏ hai dấu -- ở đầu mỗi dòng, rồi Run.
--  Nên xem trước bằng lệnh select ngay bên dưới.
-- =============================================================

-- Xem trước những gì sẽ bị xoá:
-- select 'ai_tools' as bang, title from public.ai_tools where link_url is distinct from '/ai-tools/logo-composer'
-- union all
-- select 'projects', title from public.projects;

-- delete from public.ai_tools where link_url is distinct from '/ai-tools/logo-composer';
-- delete from public.projects;
