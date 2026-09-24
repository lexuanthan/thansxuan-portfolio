import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const BRANDING_CATEGORY_ID = "3f70b98f-353d-4a04-b407-7c21e43f462f"; // Chuyên mục "Thương hiệu"

export const aiBrandingArticles = [
  {
    title: "Chiến Lược Định Vị Thương Hiệu Kỷ Nguyên AI: Khi Brand Voice Trở Thành AI Persona Tự Hành",
    slug: "chien-luoc-dinh-vi-thuong-hieu-ky-nguyen-ai-brand-persona",
    category_id: BRANDING_CATEGORY_ID,
    cover_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    tags: ["Branding", "AI Strategy", "Brand Voice", "GenAI", "Quản trị thương hiệu"],
    featured: true,
    published: true,
    views: 345,
    published_at: "2026-09-22T08:00:00Z",
    excerpt: "Trong kỷ nguyên Generative AI, cẩm nang thương hiệu tĩnh (PDF Guidelines) không còn đủ sức bảo vệ tính nhất quán của nhãn hàng. Doanh nghiệp cần chuyển dịch sang 'AI Brand Persona' — một thực thể tự hành thấu hiểu trọn vẹn bản sắc, tông giọng và triết lý thương hiệu trên mọi điểm chạm số.",
    content: `<h2>Sự sụp đổ của Cẩm nang Thương hiệu Tĩnh (Static Brand Guidelines)</h2>
<p>Suốt nửa thế kỷ qua, quy chuẩn quản trị thương hiệu luôn xoay quanh một cuốn cẩm nang dày hàng trăm trang (Brand Identity Guidelines): quy định từ mã màu hex, khoảng cách an toàn của logo đến các tính từ miêu tả giọng điệu. Nhưng bước sang năm 2026, khi các doanh nghiệp xuất bản hàng ngàn mẩu nội dung mỗi tuần thông qua các công cụ Generative AI, cuốn cẩm nang PDF tĩnh ấy đã chính thức bất lực.</p>
<p>Khi mỗi nhân viên, mỗi agency và mỗi hệ thống tự động đều đang dùng ChatGPT, Claude hay Midjourney để sáng tạo nội dung, thương hiệu đối mặt với một cuộc khủng hoảng mới: <strong>sự phân mảnh nhận diện (Brand Dissolution)</strong>. Nội dung được sản xuất với tốc độ ánh sáng, nhưng nhạt nhòa, rập khuôn và đánh mất hoàn toàn linh hồn thương hiệu.</p>
<p>Giải pháp duy nhất không phải là cấm dùng AI, mà là nâng cấp cẩm nang thương hiệu thành một <strong>AI Brand Persona tự hành (Autonomous Brand Persona)</strong>.</p>

<h2>Cấu trúc 4 Tầng của một AI Brand Persona Hiện Đại</h2>
<p>Dưới góc nhìn nghiên cứu quản lý kinh tế và hệ thống thông tin, một AI Brand Persona không đơn thuần là một prompt dài, mà là một kiến trúc tri thức gồm 4 tầng vững chắc:</p>

<h3>1. Tầng Triết lý Cốt lõi & Hình mẫu Tâm lý (Core Philosophy & Archetype)</h3>
<p>Dựa trên thuyết 12 hình mẫu thương hiệu (Carl Jung Archetypes), doanh nghiệp cần xác định rõ ràng vai trò tâm lý của mình trong tâm trí khách hàng. Bạn là <em>The Sage</em> (người thông thái truyền trao tri thức như Google, BBC), <em>The Creator</em> (người kiến tạo giải pháp như Apple, Adobe) hay <em>The Outlaw</em> (kẻ thách thức lề thối cũ như Harley Davidson, Tesla)? Tầng này định hình mục đích tối thượng (Brand Purpose) và kim chỉ nam cho mọi hành vi phát ngôn.</p>

<h3>2. Hệ thống Quy tắc Tông giọng Động (Dynamic Tone & Voice Parameters)</h3>
<p>Thay vì những tính từ mơ hồ như "thân thiện nhưng chuyên nghiệp", AI Persona cần các tham số lượng hóa cụ thể trên ma trận 4 chiều:</p>
<ul>
  <li><strong>Độ trang trọng (Formality):</strong> Thang đo từ 1 (suồng sã, tiếng lóng) đến 5 (nghi thức học thuật, văn bản tài chính).</li>
  <li><strong>Độ hài hước (Humour):</strong> Từ 1 (nghiêm cẩn tuyệt đối) đến 5 (châm biếm, hóm hỉnh duyên dáng).</li>
  <li><strong>Cường độ cảm xúc (Emotional Intensity):</strong> Từ 1 (khách quan, dữ liệu thuần túy) đến 5 (truyền cảm hứng mãnh liệt, giàu hình ảnh thơ mộng).</li>
  <li><strong>Nhịp điệu câu cú (Syntax Rhythm):</strong> Câu ngắn dứt khoát hay câu ghép đa tầng giàu chiều sâu tư duy.</li>
</ul>

<h3>3. Ranh giới Đạo đức & Giao thức Khủng hoảng (Guardrails & Crisis Protocols)</h3>
<p>Một thương hiệu mạnh được định nghĩa bởi những gì nó <em>từ chối nói</em> cũng nhiều như những gì nó tuyên bố. Tầng này thiết lập danh sách từ ngữ cấm (negative vocabulary), các chủ đề nhạy cảm bị từ chối phát biểu, và kịch bản ứng phó khi xảy ra sự cố truyền thông.</p>

<h3>4. Bộ nhớ Bối cảnh & Dữ liệu Tri thức Nội bộ (Vector Context Memory)</h3>
<p>Sử dụng kỹ thuật RAG (Retrieval-Augmented Generation) kết nối AI Persona với toàn bộ kho dữ liệu thực chiến của doanh nghiệp: các case studies thành công, nghiên cứu thị trường, phản hồi khách hàng và lịch sử chiến dịch. Nhờ đó, AI không bao giờ nói chung chung mà luôn dẫn chứng bằng trải nghiệm thực của nhãn hàng.</p>

<h2>4 Bước Chuyển Đổi Thương Hiệu Thích Ứng AI</h2>
<ol>
  <li><strong>Số hóa Brand DNA thành System Prompt:</strong> Biên dịch toàn bộ tài liệu định vị thành tập lệnh ngữ cảnh có cấu trúc (Structured System Prompt) để nạp vào các mô hình LLM.</li>
  <li><strong>Thiết lập Few-shot Examples:</strong> Cung cấp ít nhất 10 cặp ví dụ mẫu (Prompt - Response chuẩn) thể hiện hoàn hảo phong cách của thương hiệu để mô hình bắt chước nhịp điệu tự nhiên.</li>
  <li><strong>Phân quyền AI Agent trong tổ chức:</strong> Tích hợp Persona vào các điểm chạm: trợ lý viết content cho team Marketing, chatbot CSKH hỗ trợ tư vấn, và bot rà soát chất lượng nội dung trước khi xuất bản (Brand Auditor).</li>
  <li><strong>Giữ vững vòng lặp Human-in-the-loop:</strong> Con người luôn là người duyệt cuối cùng (Final Gatekeeper). AI đề xuất 10 phương án, nhưng sự nhạy cảm văn hóa và trực giác thẩm mỹ của con người mới quyết định phương án nào được bước ra thế giới.</li>
</ol>

<blockquote>"Trong một thế giới nơi ai cũng có thể tạo ra nội dung bằng AI, sự khác biệt không nằm ở việc ai viết nhanh hơn, mà là ai giữ được bản sắc độc bản rõ nét hơn."</blockquote>

<h2>Lời kết cho các Nhà Chiến lược</h2>
<p>Công nghệ thay đổi, nhưng bản chất của thương hiệu vẫn là <strong>sự tin cậy và sự gắn kết cảm xúc</strong>. Hãy biến AI thành người đệ tử đắc lực nhất của thương hiệu, chứ không phải kẻ mạo danh nhạt nhòa.</p>`
  },
  {
    title: "Ứng Dụng Generative AI & Synthetic Personas: Cách Mạng Hóa Nghiên Cứu Thị Trường & Định Vị Khách Hàng",
    slug: "ung-dung-generative-ai-synthetic-personas-nghien-cuu-khach-hang",
    category_id: BRANDING_CATEGORY_ID,
    cover_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tags: ["Thương hiệu", "Market Research", "Synthetic Data", "AI Agent", "Hành vi người tiêu dùng"],
    featured: true,
    published: true,
    views: 289,
    published_at: "2026-09-23T09:00:00Z",
    excerpt: "Tạo lập chân dung khách hàng ảo (Synthetic Buyer Personas) bằng các mô hình ngôn ngữ lớn đang làm thay đổi căn bản cách các thương hiệu thử nghiệm thông điệp, khảo sát phản ứng sản phẩm và tối ưu chi phí R&D marketing trước khi tiếp cận thị trường thật.",
    content: `<h2>Nghịch lý của Nghiên cứu Thị trường Truyền thống</h2>
<p>Mọi nhà quản trị thương hiệu đều biết rõ tầm quan trọng sống còn của việc thấu hiểu khách hàng mục tiêu. Tuy nhiên, các phương pháp nghiên cứu truyền thống như Focus Group hay phỏng vấn định tính (In-depth Interviews) thường vấp phải 3 rào cản lớn:</p>
<ul>
  <li><strong>Chi phí đắt đỏ và thời gian kéo dài:</strong> Một vòng khảo sát chuyên sâu thường mất từ 4-8 tuần với ngân sách hàng trăm triệu đồng.</li>
  <li><strong>Hiệu ứng Hawthorne:</strong> Người tham gia phỏng vấn có xu hướng trả lời những điều họ nghĩ là "đúng đắn xã hội" thay vì cảm xúc thật trong tiềm thức.</li>
  <li><strong>Không thể thử nghiệm đa biến:</strong> Bạn không thể bắt một nhóm 10 khách hàng ngồi nghe và chấm điểm 50 phiên bản thông điệp quảng cáo khác nhau trong cùng một buổi chiều.</li>
</ul>
<p>Đó là lý do <strong>Synthetic Personas (Chân dung khách hàng ảo tổng hợp)</strong> đang trở thành vũ khí bí mật của các chiến lược gia thương hiệu hàng đầu thế giới.</p>

<h2>Synthetic Persona là gì?</h2>
<p>Synthetic Persona là một mô hình AI Agent được cấu hình với đầy đủ dữ liệu nhân khẩu học (demographics), tâm lý học hành vi (psychographics), hoàn cảnh sống, rào cản tâm lý và các thiên kiến nhận thức của một nhóm khách hàng mục tiêu cụ thể.</p>
<p>Khi được hỏi, Persona ảo này sẽ phản hồi dựa trên mô phỏng tâm lý học thực tế: nó biết do dự trước mức giá cao, biết hoài nghi trước những lời hứa quảng cáo quá đà, và có những mối quan tâm rất đời thường phản ánh đúng phân khúc khách hàng mà nó đại diện.</p>

<h2>3 Ứng Dụng Thực Chiến Trong Chiến Lược Thương Hiệu</h2>

<h3>1. Thử nghiệm thông điệp & Bao bì ảo (Virtual Message Testing)</h3>
<p>Trước khi chi hàng trăm triệu đồng chạy quảng cáo Facebook hay in ấn hàng vạn bao bì mới, bạn có thể đưa 5 bản phác thảo slogan và 3 phong cách thiết kế cho 100 Synthetic Personas đại diện cho các nhóm tuổi, giới tính và thu nhập khác nhau. AI sẽ chỉ ra chính xác từ ngữ nào gây phản cảm, ý niệm nào khó hiểu và thông điệp nào khơi gợi được hành động mua hàng.</p>

<h3>2. Mô phỏng phỏng vấn định tính 24/7 (Simulated In-depth Interviews)</h3>
<p>Bạn có thể trò chuyện với một "Synthetic Persona" là phụ nữ 35 tuổi, bận rộn với hai con nhỏ và thu nhập trung lưu lúc 2 giờ sáng. Bạn có thể hỏi sâu về cảm giác tội lỗi khi không có thời gian nấu ăn, những áp lực vô hình từ gia đình, và cách cô ấy chọn lựa các sản phẩm ăn liền. Đây là nguồn cảm hứng dồi dào để phát hiện các <strong>Unmet Needs (Nhu cầu chưa được đáp ứng)</strong> tiềm ẩn.</p>

<h3>3. Đóng vai đối thủ cạnh tranh (Red-Teaming the Brand)</h3>
<p>Một ứng dụng vô cùng giá trị là yêu cầu AI hóa thân thành khách hàng trung thành của thương hiệu đối thủ khó tính nhất. Hãy để Persona này vạch lá tìm sâu, chỉ ra mọi điểm yếu trong đề xuất giá trị (Value Proposition) của bạn. Khi bạn vượt qua được bài kiểm tra của khách hàng khó tính nhất trong môi trường ảo, bạn sẽ tự tin hơn gấp mười lần khi ra thị trường thật.</p>

<h2>Ma Trận Rủi Ro: Đừng Rơi Vào Bẫy "Ảo Giác Dữ Liệu"</h2>
<p>Dù Synthetic Personas mang lại lợi thế vượt trội, các nhà nghiên cứu cần nhận thức rõ 2 giới hạn cốt lõi:</p>
<ol>
  <li><strong>Thiên kiến mô hình (Model Bias):</strong> LLM có xu hướng cư xử lịch sự và đồng thuận hơn người thật. Cần thiết lập "Temperature" và prompt chỉ thị AI phải có tính phản biện và hoài nghi thực tế.</li>
  <li><strong>Không thể thay thế hoàn toàn con người:</strong> Synthetic Personas dùng để <em>loại bỏ 90% ý tưởng tồi một cách nhanh chóng</em> và tinh chỉnh 10% ý tưởng xuất sắc nhất. Bước kiểm chứng cuối cùng vẫn bắt buộc phải diễn ra trên con người thật bằng dữ liệu thực nghiệm (Empirical Validation).</li>
</ol>

<blockquote>"AI không thay thế việc bạn ra ngoài trò chuyện với khách hàng. AI giúp bạn chuẩn bị những câu hỏi thông minh nhất trước khi bước ra gặp họ."</blockquote>`
  }
];

async function seed() {
  console.log("🚀 Đang cập nhật các bài viết về AI & Thương hiệu vào Supabase...");

  for (const article of aiBrandingArticles) {
    const { data: existing } = await supabase
      .from("posts")
      .select("id, slug")
      .eq("slug", article.slug)
      .maybeSingle();

    if (existing) {
      console.log(`  Updating: ${article.slug}`);
      const { error } = await supabase
        .from("posts")
        .update(article)
        .eq("id", existing.id);
      if (error) console.error("  ❌ Error:", error.message);
      else console.log("  ✅ Cập nhật thành công!");
    } else {
      console.log(`  Inserting: ${article.slug}`);
      const { error } = await supabase
        .from("posts")
        .insert(article);
      if (error) console.error("  ❌ Error:", error.message);
      else console.log("  ✅ Đăng bài viết mới thành công!");
    }
  }

  // Dọn dẹp các dự án/bài viết rác (test)
  console.log("🧹 Kiểm tra và dọn dẹp các mục test trong database...");
  const { error: delErr } = await supabase
    .from("projects")
    .delete()
    .eq("slug", "test");
  if (!delErr) {
    console.log("  ✅ Đã dọn dẹp dự án test mẫu trong projects.");
  }

  const { data: allPosts } = await supabase.from("posts").select("id, title, slug, published, views");
  console.log(`\n🎉 Tổng số bài viết hiện tại trong hệ thống: ${allPosts ? allPosts.length : 0}`);
}

seed().catch(console.error);
