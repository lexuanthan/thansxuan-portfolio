-- =============================================================
--  SỬA LỖI ENCODING
--  Ghi đè lại toàn bộ nội dung tiếng Việt bằng UTF-8 đúng chuẩn.
--  KHÔNG xoá dữ liệu — chỉ UPDATE, nên project anh tự thêm vẫn còn.
--  Chạy 1 lần trong Supabase > SQL Editor.
-- =============================================================

-- ----------------------- PROJECTS ----------------------------
update public.projects set description =
  'Tool tạo content marketing sáng tạo bằng AI. Giúp tự động hóa quá trình viết bài, tạo ý tưởng, và tối ưu hóa copy.'
  where slug = 'ai-content-generator';

update public.projects set description =
  'Phân tích brand positioning, competitor analysis, và tư vấn chiến lược branding toàn diện cho doanh nghiệp.'
  where slug = 'brand-strategy-analyzer';

update public.projects set description =
  'Tự động tạo script video, storyboard, và content outline từ ý tưởng ban đầu. Tối ưu cho YouTube, TikTok, Instagram.'
  where slug = 'video-script-generator';

update public.projects set description =
  'Lên lịch content social media, tối ưu posting time, và track engagement metrics một cách tự động.'
  where slug = 'social-media-calendar';

update public.projects set description =
  'Xây dựng design system toàn diện cho brand, bao gồm color palette, typography, components, và guidelines.'
  where slug = 'design-system-documentation';

update public.projects set description =
  'Dashboard phân tích dữ liệu marketing, sales metrics, và business insights với visualization tương tác.'
  where slug = 'data-visualization-dashboard';

-- ----------------------- AI TOOLS ----------------------------
update public.ai_tools set description =
  'Tạo content marketing, social media posts, blog articles bằng AI'
  where title = 'Content Generator';

update public.ai_tools set description =
  'Tư vấn branding, brand positioning, visual identity strategy'
  where title = 'Brand Advisor';

update public.ai_tools set description =
  'Viết script video chuyên nghiệp, storyboard, shot list tự động'
  where title = 'Video Script Writer';

update public.ai_tools set description =
  'Phân tích dữ liệu, tạo insights, generate reports tự động'
  where title = 'Data Analyzer';

update public.ai_tools set description =
  'Brainstorm ý tưởng campaign, content themes, creative concepts'
  where title = 'Idea Brainstormer';

update public.ai_tools set description =
  'Tối ưu hóa content cho SEO, keyword research, meta tags generation'
  where title = 'SEO Optimizer';

-- ----------------------- ABOUT PAGE --------------------------
update public.about_page set
  heading = '👋 Hi, I''m Thân',
  bio = E'Tôi là **Lê Xuân Thân**, sinh ngày 20/04/1992 — brand strategist, designer và người mê ứng dụng AI vào truyền thông thương hiệu.\n\nBan ngày tôi phụ trách mảng thiết kế và đổi mới sáng tạo trong quản trị thương hiệu & truyền thông: xây dựng câu chuyện thương hiệu, thiết kế bộ nhận diện, dựng video và sáng tạo nội dung.\n\nBan đêm (và cuối tuần) tôi là **nghiên cứu sinh tiến sĩ ngành Quản lý kinh tế**, tập trung vào cách AI và công nghệ thay đổi cách làm marketing, branding và chiến lược kinh doanh.\n\nĐiều thúc đẩy tôi là **sự đổi mới và sáng tạo không ngừng**. Tôi tin tương lai của branding nằm ở giao điểm giữa sáng tạo của con người và trí tuệ nhân tạo.',
  skills = '[
    {"category":"Brand & Design","items":["Brand Strategy","Visual Identity","UI/UX Design","Design Systems"]},
    {"category":"Content Creation","items":["Copywriting","Video Storytelling","Social Media","Content Strategy"]},
    {"category":"AI & Technology","items":["AI/ML Integration","Data Analysis","Automation","Web Development"]},
    {"category":"Research","items":["Consumer Research","Market Analysis","Data Visualization","Business Intelligence"]}
  ]'::jsonb,
  journey = '[
    {"year":"2012-2016","title":"Undergraduate Studies","desc":"Nền tảng về kinh doanh và nguyên lý thiết kế"},
    {"year":"2017-2022","title":"Professional Work in Branding","desc":"Dẫn dắt đội ngũ sáng tạo, quản lý chiến dịch thương hiệu, xây dựng design system"},
    {"year":"2023-Present","title":"PhD Student + AI Innovator","desc":"Nghiên cứu giao điểm AI và quản trị thương hiệu, song song xây dựng các AI tools"},
    {"year":"2024-Future","title":"Creator & Entrepreneur","desc":"Xây dựng thương hiệu cá nhân, tạo giải pháp AI, mở rộng giới hạn sáng tạo"}
  ]'::jsonb,
  core_values = '[
    {"icon":"✨","title":"Creativity","desc":"Luôn phá vỡ giới hạn, nghĩ khác đi"},
    {"icon":"🎯","title":"Strategy","desc":"Quyết định dựa trên dữ liệu, không chỉ đẹp mắt"},
    {"icon":"🚀","title":"Innovation","desc":"Đón nhận công nghệ và phương pháp mới"}
  ]'::jsonb
where id = 1;

-- ----------------------- SETTINGS ----------------------------
update public.settings set
  site_title    = 'Lê Xuân Thân - Brand & Communications',
  brand_name    = 'Thế giới của Thân LX',
  hero_title    = 'Lê Xuân Thân',
  hero_subtitle = 'Brand strategist · Designer · Content creator · AI enthusiast'
where id = 1;

-- ----------------------- KIỂM TRA ----------------------------
-- Chạy xong, kết quả bên dưới phải hiện chữ tiếng Việt có dấu bình thường.
select brand_name, hero_title, hero_subtitle from public.settings where id = 1;
