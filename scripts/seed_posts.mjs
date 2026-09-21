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

const articles = [
  {
    title: "Định Hướng Nghề Nghiệp Kỷ Nguyên AI: 5 Nhóm Ngành Bền Vững & Bộ Kỹ Năng Bất Tử",
    slug: "dinh-huong-nghe-nghiep-ky-nguyen-ai-5-nhom-nganh-bat-tu",
    category_id: "091e245b-c798-4427-9308-0d39ed886346", // Kỹ năng
    cover_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Định hướng nghề nghiệp", "AI & Tương lai", "Kỹ năng mềm", "Thị trường lao động"],
    featured: true,
    published: true,
    views: 142,
    published_at: "2026-09-16T08:30:00Z",
    excerpt: "Bức tranh việc làm 2026-2030 đang biến chuyển với tốc độ chưa từng có. Đâu là 5 nhóm ngành sở hữu hào bảo vệ tự nhiên trước làn sóng tự động hóa, và bộ kỹ năng nào giúp bạn duy trì lợi thế cạnh tranh độc bản?",
    content: `<h2>Bối cảnh mới: Khi AI không thay thế con người, nhưng người làm chủ AI sẽ thay thế phần còn lại</h2>
<p>Báo cáo Tương lai Việc làm (Future of Jobs) của Diễn đàn Kinh tế Thế giới (WEF) chỉ ra rằng đến năm 2030, hơn 85 triệu công việc truyền thống sẽ biến mất hoặc tái định hình, trong khi gần 97 triệu vai trò mới xuất hiện xoay quanh sự hợp tác giữa người và máy móc. Làn sóng Generative AI và các hệ thống AI Agent tự hành không còn là câu chuyện viễn tưởng mà đã len lỏi vào từng ngõ ngách văn phòng: từ viết mã, dịch thuật, phân tích tài chính đến thiết kế đồ họa.</p>
<p>Điều này đặt học sinh, sinh viên và người đi làm trẻ trước một câu hỏi sinh tử: <em>"Học ngành gì để không bị lỗi thời sau 4 năm đại học?"</em></p>

<h2>5 Nhóm ngành sở hữu sức đề kháng cao nhất trước tự động hoá</h2>
<h3>1. Nhóm ngành Công nghệ lõi & Điều phối hệ thống AI (Core Tech & AI Orchestration)</h3>
<p>AI không tự xuất hiện và tự duy trì. Các chuyên gia nghiên cứu thuật toán học sâu (Deep Learning), kỹ sư hạ tầng đám mây (Cloud & MLOps), bảo mật thông tin (Cybersecurity) và các kiến trúc sư tích hợp AI vào quy trình doanh nghiệp luôn nằm trong danh sách săn đón hàng đầu với mức đãi ngộ vượt trội.</p>

<h3>2. Y tế, Chăm sóc sức khỏe & Trị liệu tâm lý (Healthcare & Wellbeing)</h3>
<p>Dù AI có thể đọc phim X-quang chuẩn xác hay gợi ý phác đồ điều trị, nó không bao giờ có thể thay thế cái nắm tay an ủi của người điều dưỡng, sự thấu cảm của bác sĩ lâm sàng hay ánh mắt đồng cảm của chuyên gia tâm lý. Nhu cầu chăm sóc sức khỏe tinh thần và thể chất toàn diện tại Việt Nam đang tăng trưởng theo cấp số nhân.</p>

<h3>3. Sáng tạo chiến lược & Quản trị thương hiệu (Strategic Creative & Branding)</h3>
<p>AI có thể vẽ một bức tranh trong 5 giây, nhưng AI không biết tại sao bức tranh đó lại chạm đến trái tim của một phân khúc khách hàng mục tiêu tại một thời điểm văn hóa cụ thể. Những nhà chiến lược thương hiệu, giám đốc nghệ thuật và chuyên gia kể chuyện (storyteller) kết hợp tư duy kinh doanh sẽ luôn là linh hồn của mọi chiến dịch.</p>

<h3>4. Giáo dục khai phóng & Khai vấn nhân tài (Education & Coaching)</h3>
<p>Khi kiến thức được phổ cập miễn phí ở khắp mọi nơi trên Internet, vai trò của người thầy chuyển dịch từ "người truyền thụ kiến thức" sang "người truyền cảm hứng, định hướng tư duy phản biện và đồng hành khai mở tiềm năng". Huấn luyện viên cá nhân, cố vấn học đường và chuyên gia hướng nghiệp là những ngành nghề ngày càng được trân trọng.</p>

<h3>5. Kinh tế xanh, Năng lượng tái tạo & Phát triển bền vững (ESG)</h3>
<p>Biến đổi khí hậu và cam kết Net Zero 2050 mở ra một đại dương xanh về việc làm: từ kỹ sư năng lượng gió/mặt trời, chuyên gia thẩm định dấu chân carbon, đến nhà quản lý chuỗi cung ứng tuần hoàn. Đây là lĩnh vực đòi hỏi sự kết hợp phức tạp giữa chính sách vĩ mô, khoa học tự nhiên và kinh tế học.</p>

<h2>Bộ tứ kỹ năng "bất tử" trong kỷ nguyên AI</h2>
<ul>
  <li><strong>Tư duy phản biện sắc bén (Critical Thinking):</strong> Khả năng phân biệt sự thật và ảo giác (hallucination) của AI, đặt câu hỏi ngược lại vấn đề và đánh giá tính xác thực của dữ liệu.</li>
  <li><strong>Trí tuệ cảm xúc & Thấu cảm (High-EQ & Empathy):</strong> Lắng nghe thấu hiểu, xây dựng niềm tin giữa người với người và điều hướng các mối quan hệ xã hội phức tạp.</li>
  <li><strong>Năng lực điều phối & Làm chủ AI (AI Orchestration):</strong> Biến các mô hình ngôn ngữ lớn và công cụ tự động hóa thành đòn bẩy nhân đôi, nhân ba năng suất cá nhân thay vì sợ hãi bị thay thế.</li>
  <li><strong>Tư duy học tập suốt đời (Lifelong Learning & Agility):</strong> Sẵn sàng từ bỏ những kiến thức cũ đã lỗi thời (unlearn) và nhanh chóng tiếp thu những công cụ mới (relearn).</li>
</ul>

<blockquote>"Trong thế giới nơi câu trả lời trở nên dễ dàng và rẻ mạt nhờ AI, giá trị của con người nằm ở khả năng đặt ra những câu hỏi sâu sắc và dũng cảm hành động vì chúng."</blockquote>

<h2>Lời khuyên thực chiến cho các bạn trẻ</h2>
<p>Đừng chọn ngành chỉ vì trào lưu hay điểm chuẩn năm trước tăng vọt. Hãy bắt đầu từ việc thấu hiểu bản thân thông qua các công cụ khoa học như trắc nghiệm Holland RIASEC và bản đồ hướng nghiệp EduPath 2026 ngay trên website này. Khi bạn chọn đúng điểm giao thoa giữa <strong>điều bạn giỏi</strong>, <strong>điều bạn yêu thích</strong> và <strong>nhu cầu thực của xã hội</strong>, bạn sẽ luôn vững vàng trước mọi biến động công nghệ.</p>`
  },
  {
    title: "Top 7 Ứng Dụng AI Đột Phá Giúp Học Sinh & Sinh Viên Tăng Gấp 3 Lần Hiệu Suất Tự Học 2026",
    slug: "top-7-ung-dung-ai-tang-gap-3-hieu-suat-hoc-tap-2026",
    category_id: "b28f47e6-d754-4721-8f04-56d382b1c8ef", // AI & Công cụ
    cover_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    tags: ["AI Tools", "Phương pháp học tập", "GenAI", "Năng suất"],
    featured: true,
    published: true,
    views: 218,
    published_at: "2026-09-17T09:15:00Z",
    excerpt: "Tổng hợp 7 công cụ Trí tuệ nhân tạo hàng đầu hỗ trợ nghiên cứu tài liệu, giải toán logic, tóm tắt giáo trình học thuật và xây dựng lộ trình ôn thi cá nhân hóa cực kỳ hiệu quả.",
    content: `<h2>Kỷ nguyên tự học với gia sư AI 1-kèm-1 thông minh</h2>
<p>Nếu bạn vẫn chỉ dùng AI như một công cụ để copy-paste đáp án bài tập về nhà, bạn đang bỏ lỡ 95% tiềm năng thực sự của công nghệ này. Những học sinh, sinh viên xuất sắc nhất năm 2026 xem AI như một người cố vấn học tập cá nhân, một người bạn phản biện tư duy theo phương pháp Socrates (Socratic questioning) và một trợ lý nghiên cứu không bao giờ biết mệt mỏi.</p>
<p>Dưới đây là 7 công cụ AI đột phá nhất đã được kiểm nghiệm thực tế, giúp bạn rút ngắn thời gian học tập mà vẫn nắm sâu bản chất vấn đề.</p>

<h2>7 Ứng dụng AI định hình lại việc học tập</h2>
<h3>1. Perplexity AI — Cỗ máy nghiên cứu và trích dẫn học thuật thời gian thực</h3>
<p>Khắc phục hoàn toàn nhược điểm bịa đặt nguồn của các chatbot thông thường, Perplexity AI hoạt động như một công cụ tìm kiếm tri thức thế hệ mới. Mỗi câu trả lời đều đi kèm các trích dẫn số trang, đường link bài báo khoa học từ arXiv, Nature hay Google Scholar, giúp bạn làm tiểu luận nghiên cứu chuẩn mực.</p>

<h3>2. Claude 3.5 Sonnet & Claude Projects — Bậc thầy đọc hiểu tài liệu chuyên sâu</h3>
<p>Với khả năng tiếp nhận ngữ cảnh lên đến 200.000 tokens và năng lực tư duy logic vượt trội, Claude là lựa chọn số 1 khi bạn cần phân tích các cuốn giáo trình dày hàng trăm trang, bản cáo bạch tài chính hay các đề thi thử đại học môn Toán, Lý, Hóa phức tạp.</p>

<h3>3. NotebookLM (Google) — Biến giáo trình khô khan thành cuộc hội thoại sinh động</h3>
<p>NotebookLM cho phép bạn tải lên tài liệu học tập của riêng mình (PDF, Google Docs, link YouTube). Tính năng <em>Audio Overview</em> kỳ diệu có thể biến toàn bộ nội dung tài liệu thành một chương trình podcast sinh động giữa hai người dẫn chuyện AI, giúp bạn nghe ôn bài mọi lúc mọi nơi.</p>

<h3>4. ChatGPT Plus (Advanced Voice & Canvas) — Luyện phản xạ ngoại ngữ và phỏng vấn</h3>
<p>Chế độ giọng nói thời gian thực với độ trễ siêu thấp cho phép bạn đàm thoại tiếng Anh bản xứ hàng giờ liền với ngữ điệu tự nhiên, được sửa phát âm và ngữ pháp tức thì. Tính năng Canvas giúp bạn vừa viết vừa tinh chỉnh cấu trúc bài luận từng câu chữ.</p>

<h3>5. Wolfram Alpha — Vũ khí tối thượng cho Toán học và Khoa học chính xác</h3>
<p>Khi các mô hình ngôn ngữ lớn có thể tính nhầm ma trận hoặc đạo hàm, Wolfram Alpha mang lại độ chính xác toán học tuyệt đối 100%. Tích hợp các bước giải chi tiết từng bước, vẽ đồ thị hàm số 3D và phân tích công thức hóa học chuẩn xác.</p>

<h3>6. Gamma App — Thiết kế Slide thuyết trình chuyên nghiệp trong 60 giây</h3>
<p>Thay vì mất cả buổi tối loay hoay căn chỉnh font chữ và màu sắc trên PowerPoint, Gamma cho phép bạn nhập dàn ý bài học và tự động tạo ra một bản trình chiếu chuẩn nhận diện thị giác, bố cục cân đối và hình ảnh minh họa sắc nét.</p>

<h3>7. Anki tích hợp AI Flashcards — Ghi nhớ ngắt quãng đỉnh cao</h3>
<p>Phương pháp lặp lại ngắt quãng (Spaced Repetition) kết hợp thuật toán FSRS được tăng tốc bằng AI giúp bạn tự động trích xuất các câu hỏi trắc nghiệm từ bài giảng, đảm bảo kiến thức được khắc sâu vào trí nhớ dài hạn trước mỗi kỳ thi quan trọng.</p>

<h2>Nguyên tắc vàng: Dùng AI như chiếc kính lúp, không phải chiếc nạng</h2>
<blockquote>"Hãy dùng AI để đào sâu câu hỏi 'Tại sao', tìm kiếm phản biện và làm sáng tỏ những chỗ khúc mắc, đừng biến nó thành cái cớ để dừng suy nghĩ."</blockquote>
<p>Bí quyết nằm ở câu lệnh: Thay vì hỏi <em>"Cho tôi đáp án câu này"</em>, hãy prompt: <em>"Hãy đóng vai trò một giảng viên kiên nhẫn, hãy đặt cho tôi 3 câu hỏi gợi ý để tôi tự suy luận ra hướng giải quyết bài toán sau đây..."</em>. Bạn sẽ bất ngờ trước bước nhảy vọt về năng lực tư duy của chính mình!</p>`
  },
  {
    title: "Giải Mã Mô Hình Holland (RIASEC): Mật Mã 6 Nhóm Tính Cách Để Chọn Đúng Ngành Đại Học",
    slug: "giai-ma-mo-hinh-holland-riasec-chon-dung-nganh-dai-hoc",
    category_id: "091e245b-c798-4427-9308-0d39ed886346", // Kỹ năng
    cover_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    tags: ["Holland RIASEC", "Chọn ngành đại học", "Hướng nghiệp 2026", "Tâm lý học"],
    featured: true,
    published: true,
    views: 310,
    published_at: "2026-09-17T14:20:00Z",
    excerpt: "Tại sao hơn 60% sinh viên ra trường làm trái ngành? Hướng dẫn chi tiết cách ứng dụng trắc nghiệm Holland RIASEC để tìm ra mã ADN nghề nghiệp, chọn trường đại học phù hợp và bền vững.",
    content: `<h2>Thực trạng đáng báo động: Chọn ngành theo cảm tính</h2>
<p>Theo khảo sát của Trung tâm Dự báo Nhu cầu Nhân lực, có đến hơn 60% cử nhân đại học tại Việt Nam ra trường làm việc không đúng chuyên ngành đào tạo, và gần 40% cảm thấy chán nản, mất phương hướng ngay từ năm hai đại học. Lý do phổ biến nhất? <em>Chọn ngành vì nghe tên oai, vì bạn bè rủ rê, hoặc vì kỳ vọng của gia đình mà chưa từng một lần tìm hiểu xem tính cách bẩm sinh của mình tương thích với môi trường nào.</em></p>

<h2>Mô hình Holland RIASEC là gì?</h2>
<p>Được phát triển bởi tiến sĩ tâm lý học người Mỹ John L. Holland, lý thuyết RIASEC là một trong những hệ thống hướng nghiệp khoa học uy tín nhất thế giới, được áp dụng chính thức tại Bộ Lao động Hoa Kỳ (O*NET) và nhiều trường đại học danh tiếng. Mô hình phân chia tính cách con người và môi trường làm việc thành 6 nhóm chủ đạo:</p>

<h2>6 Mảnh ghép tính cách trong lục giác Holland</h2>
<h3>1. Nhóm R (Realistic - Thực tế / Kỹ thuật)</h3>
<p><strong>Đặc điểm:</strong> Thích làm việc với đồ vật cụ thể, máy móc, công cụ, yêu thích hoạt động ngoài trời, có tư duy thực tiễn và tính khéo léo.<br>
<strong>Ngành học tiêu biểu:</strong> Kỹ thuật Cơ điện tử, Tự động hóa, Xây dựng, Lâm nghiệp & Nông nghiệp công nghệ cao, Kiến trúc công trình, Công nghệ ô tô.</p>

<h3>2. Nhóm I (Investigative - Nghiên cứu / Khám phá)</h3>
<p><strong>Đặc điểm:</strong> Say mê tìm hiểu bản chất quy luật của sự vật hiện tượng, thích phân tích dữ liệu, tò mò khoa học và giải quyết các bài toán hóc búa.<br>
<strong>Ngành học tiêu biểu:</strong> Khoa học máy tính, Trí tuệ nhân tạo, Công nghệ sinh học, Dược học, Y đa khoa, Toán ứng dụng, Kinh tế lượng.</p>

<h3>3. Nhóm A (Artistic - Nghệ thuật / Sáng tạo)</h3>
<p><strong>Đặc điểm:</strong> Trực giác nhạy bén, giàu trí tưởng tượng, không thích khuôn khổ gò bó, thể hiện bản thân qua âm nhạc, chữ viết, hình ảnh hoặc thiết kế.<br>
<strong>Ngành học tiêu biểu:</strong> Thiết kế đồ họa & UI/UX, Truyền thông đa phương tiện, Đạo diễn & Biên kịch, Quan hệ công chúng (PR), Mỹ thuật ứng dụng.</p>

<h3>4. Nhóm S (Social - Xã hội / Giúp đỡ)</h3>
<p><strong>Đặc điểm:</strong> Thấu hiểu, nhân ái, có khả năng giao tiếp và lắng nghe xuất sắc, thích giúp đỡ, giảng dạy và phát triển con người.<br>
<strong>Ngành học tiêu biểu:</strong> Sư phạm, Tâm lý học lâm sàng, Công tác xã hội, Quản trị nhân sự, Điều dưỡng, Du lịch & Khách sạn.</p>

<h3>5. Nhóm E (Enterprising - Quản lý / Khởi xướng)</h3>
<p><strong>Đặc điểm:</strong> Năng động, tự tin, có tham vọng và tố chất lãnh đạo, thích thuyết phục người khác và sẵn sàng chấp nhận rủi ro kinh doanh.<br>
<strong>Ngành học tiêu biểu:</strong> Quản trị kinh doanh, Marketing chiến lược, Kinh doanh quốc tế, Tài chính doanh nghiệp, Luật thương mại, Bất động sản.</p>

<h3>6. Nhóm C (Conventional - Nghiệp vụ / Quy củ)</h3>
<p><strong>Đặc điểm:</strong> Cẩn thận, chi tiết, thích sự ngăn nắp, làm việc chuẩn xác theo quy trình và các con số cụ thể.<br>
<strong>Ngành học tiêu biểu:</strong> Kế toán - Kiểm toán, Hệ thống thông tin quản lý (MIS), Quản trị chuỗi cung ứng & Logistics, Thống kê, Hành chính công.</p>

<h2>Cách kết hợp 3 chữ cái để tạo thành "Mật mã Holland" (Holland Code)</h2>
<p>Không ai hoàn toàn thuộc về một nhóm duy nhất. Mỗi cá nhân là sự tổng hòa của 3 nhóm tính cách nổi trội nhất, ví dụ: <strong>SEC</strong> (Xã hội - Quản lý - Nghiệp vụ), <strong>IRA</strong> (Nghiên cứu - Thực tế - Nghệ thuật), hay <strong>EAC</strong> (Quản lý - Nghệ thuật - Nghiệp vụ).</p>

<h2>Trải nghiệm ngay bộ công cụ định hướng trên website</h2>
<p>Để biết chính xác mật mã 3 chữ cái của bạn và đối chiếu với ngân hàng hơn 200 trường đại học tại Việt Nam, hãy làm bài test tại công cụ <strong>Khảo sát Hướng nghiệp RIASEC</strong> và <strong>EduPath 2026</strong> được tích hợp sẵn trong mục AI Tools của chúng tôi. Một bản báo cáo trực quan kèm điểm mạnh, ngành học tối ưu và gợi ý nguyện vọng sẽ được gửi đến bạn hoàn toàn miễn phí!</p>`
  },
  {
    title: "Kỹ Sư Prompt & Quản Trị AI Agent 2026: Nghề Mới Nghìn USD Hay Chỉ Là Trào Lưu Nhất Thời?",
    slug: "ky-su-prompt-va-ai-agent-2026-nghe-nghin-usd-hay-trao-luu",
    category_id: "069abd25-b0aa-4b6f-bead-c176cc3e0592", // Công nghệ
    cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    tags: ["Prompt Engineering", "AI Agents", "Công nghệ mới", "Tự động hoá"],
    featured: false,
    published: true,
    views: 185,
    published_at: "2026-09-18T06:00:00Z",
    excerpt: "Giải mã sự chuyển dịch ngoạn mục từ những câu lệnh prompt đơn lẻ sang kỷ nguyên AI Agent tự hành: Yêu cầu chuyên môn thực tế, mức đãi ngộ và lộ trình chuẩn bị cho kỹ sư trẻ.",
    content: `<h2>Từ "Thợ gõ prompt" đến "Kiến trúc sư hệ thống AI Agent"</h2>
<p>Năm 2023, khi ChatGPT bùng nổ, cụm từ <em>"Prompt Engineer với mức lương 330.000 USD/năm"</em> từng làm chấn động giới truyền thông toàn cầu. Nhiều người vội vã mở các khóa học dạy viết câu lệnh dài dòng và tin rằng chỉ cần gõ vài từ ngữ thần bí là có thể đổi đời.</p>
<p>Bước sang năm 2026, khi các mô hình ngôn ngữ lớn (LLM) ngày càng thông minh hơn và có thể tự tối ưu câu lệnh, cái gọi là "nghề gõ prompt đơn giản" đã chết. Thay vào đó là sự trỗi dậy mạnh mẽ của một vị trí kỹ thuật cấp cao: <strong>AI Agent Architect / Systems Orchestrator</strong>.</p>

<h2>Bản chất công việc của một AI Agent Architect là gì?</h2>
<p>Một AI Agent không chỉ là một khung chat trả lời câu hỏi. Nó là một thực thể phần mềm có khả năng:</p>
<ul>
  <li>Nhận thức mục tiêu tổng thể và tự động phân rã thành các nhiệm vụ con (Planning & Decomposition).</li>
  <li>Truy xuất dữ liệu nghiệp vụ thời gian thực qua hệ thống RAG (Retrieval-Augmented Generation) và cơ sở dữ liệu vector.</li>
  <li>Chủ động gọi các API bên ngoài qua giao thức MCP (Model Context Protocol) để thực thi hành động: gửi email, đặt vé máy bay, truy vấn cơ sở dữ liệu SQL, hoặc deploy code lên cloud.</li>
  <li>Tự đánh giá kết quả và tự sửa sai nếu gặp lỗi (Self-reflection & Error recovery).</li>
</ul>

<h2>Những kỹ năng kỹ thuật bắt buộc để đón đầu làn sóng này</h2>
<h3>1. Nền tảng lập trình vững chắc (Python & TypeScript)</h3>
<p>Không có đường tắt nào không cần code. Bạn cần làm chủ Python (chuẩn mực cho AI/ML) hoặc TypeScript/Node.js để xây dựng các pipeline tích hợp, quản lý bất đồng bộ và kiểm soát dữ liệu đầu vào/đầu ra.</p>

<h3>2. Hiểu sâu về Frameworks Agent (LangChain, LangGraph, CrewAI, AutoGen)</h3>
<p>Cách tổ chức mô hình nhiều Agent cộng tác (Multi-agent collaboration): Agent A đóng vai trò Researcher, Agent B đóng vai trò Coder, Agent C làm Reviewer và Agent D tổng hợp kết quả.</p>

<h3>3. Kỹ thuật Evals & Kiểm soát an toàn (Guardrails)</h3>
<p>Làm sao để đo lường độ chính xác của Agent qua từng phiên bản? Làm sao để ngăn chặn lỗi Prompt Injection hay dữ liệu nhạy cảm rò rỉ ra ngoài? Đây là bài toán sống còn mà các doanh nghiệp sẵn sàng chi trả lương rất cao cho người giải quyết được.</p>

<blockquote>"Một mô hình AI mạnh mẽ sẽ vô dụng nếu thiếu đi một kiến trúc phần mềm tin cậy bao bọc xung quanh nó."</blockquote>

<h2>Lộ trình hành động cho người mới bắt đầu</h2>
<p>Hãy dừng việc học vẹt các mẫu prompt trên mạng. Bắt đầu bằng việc xây dựng một dự án nhỏ thực tế: ví dụ một bot tự động đọc RSS tin tức công nghệ mỗi sáng, tóm tắt và gửi vào Telegram; hoặc một tool hỗ trợ tra cứu điểm chuẩn tự động. Dự án thực chiến (Proof of Work) chính là tấm vé thông hành giá trị nhất đưa bạn vào kỷ nguyên công nghệ mới.</p>`
  },
  {
    title: "Xây Dựng Portfolio Số & Thương Hiệu Cá Nhân Thời AI: Bí Quyết Để Được Săn Đón",
    slug: "xay-dung-portfolio-so-va-thuong-hieu-ca-nhan-thoi-ai",
    category_id: "3f70b98f-353d-4a04-b407-7c21e43f462f", // Thương hiệu
    cover_url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    tags: ["Thương hiệu cá nhân", "Portfolio số", "Branding", "Phát triển sự nghiệp"],
    featured: false,
    published: true,
    views: 265,
    published_at: "2026-09-18T08:00:00Z",
    excerpt: "Bản PDF gửi qua email đã không còn đủ sức nặng. Khám phá chiến lược xây dựng không gian hiện diện số đa kênh, biến dự án thực tế thành thỏi nam châm thu hút đối tác và nhà tuyển dụng.",
    content: `<h2>Sự thoái trào của bản CV truyền thống</h2>
<p>Hãy thử tưởng tượng bạn là một nhà tuyển dụng hoặc một đối tác đang tìm kiếm người phụ trách dự án: Bạn nhận được 500 file PDF có tiêu đề <em>"CV_NguyenVanA.pdf"</em>, tất cả đều dùng chung những mẫu template Canva quen thuộc và những từ ngữ sáo rỗng được AI sinh ra hàng loạt như <em>"nhiệt huyết, chịu được áp lực cao, kỹ năng giao tiếp tốt"</em>. Bạn sẽ dành bao nhiêu giây cho mỗi hồ sơ?</p>
<p>Con số thống kê thực tế là: <strong>Chưa đầy 6 giây.</strong></p>
<p>Trong thời đại số, tấm danh thiếp quyền lực nhất của một người làm việc chuyên nghiệp không còn là một tờ giấy, mà là <strong>Không gian số mang đậm dấu ấn cá nhân (Digital Portfolio & Personal Brand)</strong>.</p>

<h2>3 Trụ cột tạo nên một Portfolio số có sức hút mãnh liệt</h2>
<h3>1. Định vị giá trị độc bản (Unique Value Proposition - UVP)</h3>
<p>Bạn không thể giỏi tất cả mọi thứ. Bạn là ai trong mắt người khác? Bạn giải quyết vấn đề gì, cho đối tượng nào, bằng phương pháp khác biệt ra sao? Sự giao thoa độc đáo — ví dụ: <em>"Một nhà thiết kế am hiểu tâm lý người tiêu dùng"</em> hay <em>"Một chuyên viên marketing biết viết code và tự động hóa bằng AI"</em> — sẽ biến bạn thành người duy nhất trong ngách của mình.</p>

<h3>2. Kể câu chuyện Case Study thay vì chỉ khoe sản phẩm cuối cùng</h3>
<p>Người ta không mua kết quả, người ta mua tư duy giải quyết vấn đề của bạn. Một Case Study xuất sắc luôn tuân thủ cấu trúc 4 bước:</p>
<ul>
  <li><strong>Thách thức (Challenge):</strong> Vấn đề cụ thể mà doanh nghiệp hoặc người dùng đang gặp phải là gì?</li>
  <li><strong>Phương pháp tiếp cận (Approach):</strong> Bạn đã nghiên cứu, thử nghiệm và chọn giải pháp nào? Tại sao?</li>
  <li><strong>Quá trình vượt khó (Execution):</strong> Những rào cản bất ngờ phát sinh và cách bạn ứng biến?</li>
  <li><strong>Tác động định lượng (Impact):</strong> Tăng trưởng bao nhiêu % chuyển đổi? Tiết kiệm bao nhiêu giờ làm việc?</li>
</ul>

<h3>3. Trải nghiệm tương tác trực tiếp (Interactive Proof of Work)</h3>
<p>Thay vì chỉ chụp ảnh màn hình tĩnh, hãy để người xem được bấm thử, trải nghiệm thử công cụ bạn đã làm. Chính cảm giác được chạm vào sản phẩm thực sẽ xây dựng niềm tin mãnh liệt hơn bất kỳ lời khẳng định nào.</p>

<h2>Tận dụng AI để khuếch đại tiếng vang mà không làm mất "chất riêng"</h2>
<p>AI là chiếc loa phóng thanh, nhưng bạn phải là người sáng tác bài hát. Hãy sử dụng AI để:</p>
<ul>
  <li>Gợi ý các góc nhìn phân tích đa chiều cho bài viết chuyên môn.</li>
  <li>Biên tập lại cấu trúc câu cú cho mạch lạc, gãy gọn.</li>
  <li>Tối ưu hóa SEO để các bài viết của bạn xuất hiện khi ai đó tìm kiếm giải pháp cho vấn đề chuyên ngành.</li>
</ul>
<blockquote>"Thương hiệu cá nhân không phải là việc bạn cố tỏ ra hoàn hảo, mà là sự kiên định trong việc tạo ra giá trị hữu ích và chia sẻ nó một cách chân thành nhất với cộng đồng."</blockquote>

<h2>Hành động ngay hôm nay</h2>
<p>Đừng chờ đợi đến khi cần tìm việc mới bắt đầu xây dựng portfolio. Hãy bắt đầu ghi chép lại hành trình học tập, đúc kết các bài học từ mỗi dự án và đưa chúng lên website cá nhân của bạn ngay từ hôm nay. Tương lai nghề nghiệp thuộc về những ai dám cất lên tiếng nói của chính mình!</p>`
  }
];

async function seed() {
  console.log("Seeding", articles.length, "articles into Supabase...");
  for (const article of articles) {
    const { data: existing } = await supabase
      .from("posts")
      .select("id, slug")
      .eq("slug", article.slug)
      .maybeSingle();

    if (existing) {
      console.log(`Updating existing post: ${article.slug}`);
      const { error } = await supabase
        .from("posts")
        .update(article)
        .eq("id", existing.id);
      if (error) {
        console.error(`Error updating ${article.slug}:`, error);
      } else {
        console.log(`Updated successfully: ${article.slug}`);
      }
    } else {
      console.log(`Inserting new post: ${article.slug}`);
      const { error } = await supabase
        .from("posts")
        .insert(article);
      if (error) {
        console.error(`Error inserting ${article.slug}:`, error);
      } else {
        console.log(`Inserted successfully: ${article.slug}`);
      }
    }
  }

  const { data: allPosts } = await supabase.from("posts").select("id, title, slug, published, featured, views");
  console.log("ALL POSTS NOW IN DB:", allPosts?.length);
  console.log(allPosts);
}

seed().catch(console.error);
