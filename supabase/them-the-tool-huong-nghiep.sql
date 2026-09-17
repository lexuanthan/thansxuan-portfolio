-- Thêm thẻ công cụ Hướng nghiệp vào trang /ai-tools
--
-- Trang /ai-tools liệt kê từ bảng ai_tools chứ không quét thư mục, nên tạo
-- route thôi thì chưa đủ để thẻ hiện ra. Chạy câu này trong Supabase SQL Editor.

insert into ai_tools (title, description, icon, color, status, status_color, link_url, published, sort_order)
values (
  'Hồ sơ xu hướng học tập & nghề nghiệp',
  E'Bộ khảo sát 62 câu dựng hồ sơ về sở thích, năng lực, cách học và giá trị nghề nghiệp, rồi đối chiếu với đặc trưng ngành đào tạo.\nKết quả là một góc nhìn dựa trên dữ liệu, không phải lời khuyên chọn ngành.',
  '🧭',
  'from-brand-100 to-brand-200',
  'Bản dựng thử',
  'orange',
  '/ai-tools/huong-nghiep',
  true,
  1
);
