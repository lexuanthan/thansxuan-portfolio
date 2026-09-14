-- =============================================================
--  thansxuan-portfolio — Supabase schema
--  Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor
-- =============================================================

-- ----------------------------- PROJECTS -----------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique,
  description text default '',
  content     text default '',
  image_url   text,
  tags        text[] not null default '{}',
  color       text not null default 'from-blue-100 to-cyan-100',
  link_url    text,
  featured    boolean not null default false,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------- AI TOOLS -----------------------
create table if not exists public.ai_tools (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text default '',
  icon         text not null default '🤖',
  color        text not null default 'from-blue-100 to-cyan-100',
  status       text not null default 'Coming Soon',
  status_color text not null default 'yellow',
  link_url     text,
  published    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ----------------------------- ABOUT PAGE ---------------------
create table if not exists public.about_page (
  id         integer primary key default 1,
  heading    text default '👋 Hi, I''m Thân',
  bio        text default '',
  skills     jsonb not null default '[]'::jsonb,  -- [{category, items:[...]}]
  journey    jsonb not null default '[]'::jsonb,  -- [{year, title, desc}]
  core_values jsonb not null default '[]'::jsonb, -- [{icon, title, desc}]
  updated_at timestamptz not null default now(),
  constraint about_page_singleton check (id = 1)
);

-- ----------------------------- SETTINGS -----------------------
create table if not exists public.settings (
  id               integer primary key default 1,
  site_title       text default 'Lê Xuân Thân - Brand & Communications',
  site_description text default 'Personal portfolio & AI tools by Lê Xuân Thân.',
  brand_name       text default 'Thế giới của Thân LX',
  hero_title       text default 'Lê Xuân Thân',
  hero_subtitle    text default 'Brand strategist · Designer · Content creator · AI enthusiast',
  email            text default '',
  phone            text default '',
  location         text default '',
  footer_text      text default '',
  social           jsonb not null default '{}'::jsonb, -- {twitter, linkedin, github, facebook, youtube, tiktok}
  updated_at       timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

-- ----------------------------- MEDIA --------------------------
create table if not exists public.media (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  path       text not null unique,        -- đường dẫn trong storage bucket
  url        text not null,
  size       bigint default 0,
  mime_type  text default '',
  created_at timestamptz not null default now()
);

-- ----------------------------- PAGE VIEWS ---------------------
create table if not exists public.page_views (
  id         bigserial primary key,
  path       text not null,
  referrer   text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

-- ----------------------------- updated_at trigger -------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists ai_tools_set_updated_at on public.ai_tools;
create trigger ai_tools_set_updated_at before update on public.ai_tools
  for each row execute function public.set_updated_at();

drop trigger if exists about_page_set_updated_at on public.about_page;
create trigger about_page_set_updated_at before update on public.about_page
  for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- =============================================================
--  ROW LEVEL SECURITY
--  Đọc: ai cũng đọc được (chỉ bản published).
--  Ghi: chỉ user đã đăng nhập (authenticated).
-- =============================================================
alter table public.projects   enable row level security;
alter table public.ai_tools   enable row level security;
alter table public.about_page enable row level security;
alter table public.settings   enable row level security;
alter table public.media      enable row level security;
alter table public.page_views enable row level security;

-- PROJECTS
drop policy if exists "projects public read"  on public.projects;
drop policy if exists "projects admin all"    on public.projects;
create policy "projects public read" on public.projects
  for select using (published = true or auth.role() = 'authenticated');
create policy "projects admin all" on public.projects
  for all to authenticated using (true) with check (true);

-- AI TOOLS
drop policy if exists "ai_tools public read" on public.ai_tools;
drop policy if exists "ai_tools admin all"   on public.ai_tools;
create policy "ai_tools public read" on public.ai_tools
  for select using (published = true or auth.role() = 'authenticated');
create policy "ai_tools admin all" on public.ai_tools
  for all to authenticated using (true) with check (true);

-- ABOUT
drop policy if exists "about public read" on public.about_page;
drop policy if exists "about admin all"   on public.about_page;
create policy "about public read" on public.about_page for select using (true);
create policy "about admin all"   on public.about_page
  for all to authenticated using (true) with check (true);

-- SETTINGS
drop policy if exists "settings public read" on public.settings;
drop policy if exists "settings admin all"   on public.settings;
create policy "settings public read" on public.settings for select using (true);
create policy "settings admin all"   on public.settings
  for all to authenticated using (true) with check (true);

-- MEDIA
drop policy if exists "media public read" on public.media;
drop policy if exists "media admin all"   on public.media;
create policy "media public read" on public.media for select using (true);
create policy "media admin all"   on public.media
  for all to authenticated using (true) with check (true);

-- PAGE VIEWS  (ai cũng ghi được 1 lượt xem, chỉ admin mới đọc)
drop policy if exists "page_views anyone insert" on public.page_views;
drop policy if exists "page_views admin read"    on public.page_views;
create policy "page_views anyone insert" on public.page_views
  for insert to anon, authenticated with check (true);
create policy "page_views admin read" on public.page_views
  for select to authenticated using (true);

-- =============================================================
--  STORAGE BUCKET cho Media library
-- =============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media bucket public read"   on storage.objects;
drop policy if exists "media bucket admin insert"  on storage.objects;
drop policy if exists "media bucket admin update"  on storage.objects;
drop policy if exists "media bucket admin delete"  on storage.objects;

create policy "media bucket public read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media bucket admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "media bucket admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "media bucket admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- =============================================================
--  SEED — dữ liệu khởi tạo (chạy 1 lần)
-- =============================================================
insert into public.settings (id) values (1) on conflict (id) do nothing;

insert into public.about_page (id, heading, bio, skills, journey, core_values)
values (
  1,
  '👋 Hi, I''m Thân',
  E'Tôi là **Lê Xuân Thân**, sinh ngày 20/04/1992 — brand strategist, designer và người mê ứng dụng AI vào truyền thông thương hiệu.\n\nBan ngày tôi phụ trách mảng thiết kế và đổi mới sáng tạo trong quản trị thương hiệu & truyền thông: xây dựng câu chuyện thương hiệu, thiết kế bộ nhận diện, dựng video và sáng tạo nội dung.\n\nBan đêm (và cuối tuần) tôi là **nghiên cứu sinh tiến sĩ ngành Quản lý kinh tế**, tập trung vào cách AI và công nghệ thay đổi cách làm marketing, branding và chiến lược kinh doanh.\n\nĐiều thúc đẩy tôi là **sự đổi mới và sáng tạo không ngừng**. Tôi tin tương lai của branding nằm ở giao điểm giữa sáng tạo của con người và trí tuệ nhân tạo.',
  '[
    {"category":"Brand & Design","items":["Brand Strategy","Visual Identity","UI/UX Design","Design Systems"]},
    {"category":"Content Creation","items":["Copywriting","Video Storytelling","Social Media","Content Strategy"]},
    {"category":"AI & Technology","items":["AI/ML Integration","Data Analysis","Automation","Web Development"]},
    {"category":"Research","items":["Consumer Research","Market Analysis","Data Visualization","Business Intelligence"]}
  ]'::jsonb,
  '[
    {"year":"2012-2016","title":"Undergraduate Studies","desc":"Nền tảng về kinh doanh và nguyên lý thiết kế"},
    {"year":"2017-2022","title":"Professional Work in Branding","desc":"Dẫn dắt đội ngũ sáng tạo, quản lý chiến dịch thương hiệu, xây dựng design system"},
    {"year":"2023-Present","title":"PhD Student + AI Innovator","desc":"Nghiên cứu giao điểm AI và quản trị thương hiệu, song song xây dựng các AI tools"},
    {"year":"2024-Future","title":"Creator & Entrepreneur","desc":"Xây dựng thương hiệu cá nhân, tạo giải pháp AI, mở rộng giới hạn sáng tạo"}
  ]'::jsonb,
  '[
    {"icon":"✨","title":"Creativity","desc":"Luôn phá vỡ giới hạn, nghĩ khác đi"},
    {"icon":"🎯","title":"Strategy","desc":"Quyết định dựa trên dữ liệu, không chỉ đẹp mắt"},
    {"icon":"🚀","title":"Innovation","desc":"Đón nhận công nghệ và phương pháp mới"}
  ]'::jsonb
) on conflict (id) do nothing;

insert into public.projects (title, slug, description, tags, color, sort_order, featured)
values
  ('AI Content Generator','ai-content-generator','Tool tạo content marketing sáng tạo bằng AI. Giúp tự động hóa quá trình viết bài, tạo ý tưởng, và tối ưu hóa copy.','{AI,NLP,Content}','from-blue-100 to-cyan-100',1,true),
  ('Brand Strategy Analyzer','brand-strategy-analyzer','Phân tích brand positioning, competitor analysis, và tư vấn chiến lược branding toàn diện cho doanh nghiệp.','{Strategy,Design,Analytics}','from-purple-100 to-pink-100',2,true),
  ('Video Script Generator','video-script-generator','Tự động tạo script video, storyboard, và content outline từ ý tưởng ban đầu. Tối ưu cho YouTube, TikTok, Instagram.','{Video,AI,Creative}','from-orange-100 to-red-100',3,false),
  ('Social Media Calendar','social-media-calendar','Lên lịch content social media, tối ưu posting time, và track engagement metrics một cách tự động.','{"Social Media",Automation}','from-green-100 to-emerald-100',4,false),
  ('Design System Documentation','design-system-documentation','Xây dựng design system toàn diện cho brand, bao gồm color palette, typography, components, và guidelines.','{Design,"UI/UX",Documentation}','from-yellow-100 to-amber-100',5,false),
  ('Data Visualization Dashboard','data-visualization-dashboard','Dashboard phân tích dữ liệu marketing, sales metrics, và business insights với visualization tương tác.','{Data,Analytics,Dashboard}','from-indigo-100 to-blue-100',6,false)
on conflict (slug) do nothing;

insert into public.ai_tools (title, description, icon, color, status, status_color, sort_order)
values
  ('Content Generator','Tạo content marketing, social media posts, blog articles bằng AI','✍️','from-blue-100 to-cyan-100','Coming Soon','yellow',1),
  ('Brand Advisor','Tư vấn branding, brand positioning, visual identity strategy','🎨','from-purple-100 to-pink-100','Coming Soon','yellow',2),
  ('Video Script Writer','Viết script video chuyên nghiệp, storyboard, shot list tự động','🎬','from-orange-100 to-red-100','Coming Soon','yellow',3),
  ('Data Analyzer','Phân tích dữ liệu, tạo insights, generate reports tự động','📊','from-green-100 to-emerald-100','Coming Soon','yellow',4),
  ('Idea Brainstormer','Brainstorm ý tưởng campaign, content themes, creative concepts','💡','from-yellow-100 to-amber-100','Coming Soon','yellow',5),
  ('SEO Optimizer','Tối ưu hóa content cho SEO, keyword research, meta tags generation','🔍','from-indigo-100 to-blue-100','Coming Soon','yellow',6)
on conflict do nothing;
