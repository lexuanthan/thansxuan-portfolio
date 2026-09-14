-- =============================================================
--  VÁ NỐT ICON BỊ HỎNG MÃ
--
--  Lần sửa encoding trước chỉ đụng tới cột description, bỏ sót cột icon
--  của bảng ai_tools. Hậu quả: ngoài trang AI Tools các emoji hiện thành
--  "âœï¸", "ðŸŽ¨", "ðŸŽ¬"... thay vì ✍️ 🎨 🎬
--
--  Chạy 1 lần trong Supabase > SQL Editor. Chạy lại nhiều lần không sao.
-- =============================================================

update public.ai_tools set icon = '✍️' where title = 'Content Generator';
update public.ai_tools set icon = '🎨' where title = 'Brand Advisor';
update public.ai_tools set icon = '🎬' where title = 'Video Script Writer';
update public.ai_tools set icon = '📊' where title = 'Data Analyzer';
update public.ai_tools set icon = '💡' where title = 'Idea Brainstormer';
update public.ai_tools set icon = '🔍' where title = 'SEO Optimizer';

-- ---------- Kiểm tra ----------
-- Cột icon phải hiện emoji bình thường, không còn ký tự lạ.
select title, icon, status from public.ai_tools order by sort_order, created_at;
