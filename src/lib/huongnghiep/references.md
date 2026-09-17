# Căn cứ cho các lựa chọn trong thuật toán

Tài liệu đặc tả tự ghi rằng trọng số của nó là *"default configuration, không
phải trọng số đã được khoa học xác nhận"* (PART 6.5). File này ghi lại những
chỗ tôi đã tra cứu tài liệu học thuật rồi chỉnh lại, kèm nguồn, để sau này ai
đọc mã cũng biết con số ở đâu ra và cãi lại được.

**Một lời cảnh báo đặt trước mọi thứ bên dưới:** tất cả các chỉnh sửa này dựa
trên bằng chứng *gián tiếp* — kết quả nghiên cứu trên quần thể khác, chủ yếu là
sinh viên phương Tây. Chúng tốt hơn việc đoán, nhưng vẫn chưa phải trọng số
hiệu chỉnh trên dữ liệu người dùng thật của hệ thống này. Khi có dữ liệu thật
thì hiệu chỉnh lại.

---

## 1. Đổi cách đo RIASEC: cosine → tương quan hồ sơ

**Tài liệu nói gì.** PART 6.25: *"V1.0 chọn Cosine Similarity, sau đó normalize
về 0–100."*

**Vấn đề đo được.** Tôi chạy cả ba cách trên sáu hồ sơ điển hình × năm ngành:

| Cách đo | Biên độ | Độ lệch chuẩn |
|---|---|---|
| cosine | 71 – 99.7 | 7.0 |
| khoảng cách Euclid | 56 – 95 | 9.2 |
| tương quan hồ sơ | 5.6 – 99.4 | 27.1 |

Tệ nhất là hồ sơ "đều tay" — em trả lời na ná nhau ở cả sáu chiều. Cosine cho
em ấy **~92 điểm với MỌI ngành**. Nguyên nhân: vector RIASEC toàn số dương nằm
gọn trong một góc phần tám của không gian sáu chiều, nên góc giữa hai vector
bất kỳ luôn nhỏ.

**Tài liệu học thuật nói gì.** Cosine không có mặt trong danh sách các chỉ số
congruence được dùng cho RIASEC. Hai cách được khuyến nghị là **khoảng cách
Euclid** và **tương quan hồ sơ**; bài khảo sát các hệ số trong gói R `holland`
gọi tương quan hồ sơ là cách *"superior"* trong nhóm profile-conceptual.

Quan trọng hơn, phân tích tổng hợp về congruence và kết quả học đại học cho
thấy **cách dùng đủ sáu chiều mạnh hơn hẳn cách chỉ lấy ba chữ cái đầu**:
ρ = 0.34 so với ρ = 0.08 khi dự báo thành tích học tập. Điều này xác nhận thiết
kế sẵn có (lưu cả vector, không lưu `primary_type`).

**Đã làm.** `RIASEC_INDEX = "CORRELATION"` trong `config.ts`. Giữ nguyên cả ba
hàm; đặt lại thành `"COSINE"` là tái lập đúng hành vi theo tài liệu gốc.

**Kèm theo: cổng phân hoá.** Tương quan có điểm yếu riêng — hồ sơ càng phẳng
thì phương sai càng gần 0 và hệ số bị nhiễu chi phối. Nên thêm
`MIN_RIASEC_DIFFERENTIATION = 10`, dùng chính khái niệm *differentiation* của
lý thuyết Holland (độ trải của sáu chiều). Đo thực tế: hồ sơ có kiểu rõ 18–22,
hồ sơ hơi nghiêng 6.4, hồ sơ phẳng 1.3. Dưới ngưỡng thì **không chấm nhóm
RIASEC** thay vì chấm bằng nhiễu.

Nguồn:
- [Impact of Interest Congruence on Study Outcomes (Frontiers in Psychology, 2022)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.816620/full) — dùng khoảng cách Euclid trên đủ sáu chiều; phê phán cách chỉ dùng ba chiều là *"suboptimal database"*.
- [Concepts and Coefficients Based on John L. Holland's Theory — Examining the R Package `holland` (MDPI Psych, 2021)](https://www.mdpi.com/2624-8611/3/4/47) — liệt kê và so sánh C index, Iachan, Euclid, tương quan hồ sơ, Brown-C, Hamming, Levenshtein.
- [Does interest fit between student and study program lead to better outcomes? A meta-analysis (Educational Research Review, 2024)](https://www.sciencedirect.com/science/article/pii/S1747938X24000289) — moderator mạnh nhất là *cách đo congruence*: profile ρ = 0.34 so với top-letter ρ = 0.08.

---

## 2. Chỉnh trọng số nhóm theo mức tin cậy của dữ liệu

**Tài liệu nói gì.** PART 6.5: Academic 20, Interest 20, **Ability 25**, Work
Style 10, Career Value 10, RIASEC 10, Environment 5.

**Vấn đề.** Nhóm Ability nặng ký nhất (25%) nhưng gần như hoàn toàn dựng từ
**tự đánh giá** — bảy câu Q23–Q29 kiểu "Bạn đánh giá khả năng tư duy logic của
mình như thế nào?". Phân tích tổng hợp qua ~5.000 cách xử lý dữ liệu cho tương
quan giữa năng lực tự chấm và năng lực **đo được** chỉ **r ≈ 0.30** (khoảng tin
cậy 95%: 0.27–0.33). Tức là chừng 9% phương sai chung.

Trong khi đó nhóm Academic (20%) dựng từ **điểm môn** — con số trường đã đo,
học sinh chỉ khai lại. Đây là dữ liệu khách quan nhất trong toàn hồ sơ.

Để nhóm yếu nhất về bằng chứng nặng ký nhất trong mô hình là đặt niềm tin lớn
nhất vào dữ liệu đáng tin ít nhất.

**Đã làm.** Thêm bộ `WEIGHTS_V2_EVIDENCE`, đang dùng làm mặc định:

| Nhóm | v1 (tài liệu) | v2 (hiện dùng) | Lý do |
|---|---:|---:|---|
| ACADEMIC | 0.20 | **0.25** | Điểm môn — khách quan nhất |
| INTEREST | 0.20 | **0.25** | Biến duy nhất có bằng chứng định lượng trực tiếp |
| ABILITY | 0.25 | **0.15** | Tự đánh giá, r ≈ 0.30 với năng lực thật |
| WORK_STYLE | 0.10 | 0.10 | giữ nguyên |
| CAREER_VALUE | 0.10 | 0.10 | giữ nguyên |
| RIASEC | 0.10 | 0.10 | giữ nguyên |
| ENVIRONMENT | 0.05 | 0.05 | giữ nguyên |

`WEIGHTS_V1_SPEC` được giữ nguyên trong mã để tái lập mọi kết quả đã tính bằng
v1. `MATCHING_CONFIGURATION_VERSION` tăng lên 2.

**Một chi tiết đáng chú ý trong nguồn:** độ chính xác của tự đánh giá khác nhau
theo loại năng lực — **tính toán mạnh nhất** (r ≈ 0.40), rồi đến năng lực chung,
ngôn ngữ, và **tư duy không gian yếu nhất**. Tác giả cho rằng vì con người nhận
được phản hồi thực tế về khả năng tính toán thường xuyên hơn. Điều này ủng hộ
cách hiện tại đang suy `ability.numerical` từ điểm Toán thay vì hỏi thẳng, và
gợi ý rằng `ability.spatial` (đang suy từ hứng thú thiết kế/kiến trúc) là yếu
tố đáng ngờ nhất trong nhóm.

Nguồn:
- [Mirror, Mirror on the Wall: A Meta-Analysis on the Validity of Self-Assessed Intelligence through the Lens of the Multiverse (MDPI Journal of Intelligence, 2024)](https://www.mdpi.com/2079-3200/12/9/81) — r = 0.30 [0.27, 0.33]; 96% trong gần 5.000 đặc tả cho tương quan dương có ý nghĩa.
- [Self-estimates of abilities are a better reflection of individuals' personality traits than of their abilities (Personality and Individual Differences, 2020)](https://www.sciencedirect.com/science/article/pii/S0191886920300404) — tự đánh giá năng lực phản ánh tính cách nhiều hơn phản ánh năng lực.

---

## 3. Điều quan trọng nhất: hiệu ứng vốn NHỎ

Phân tích tổng hợp về mức hợp hứng thú và kết quả học đại học:

| Kết quả | ρ |
|---|---:|
| Sự hài lòng với chương trình học | 0.18 |
| Học tiếp, không bỏ ngành | 0.12 |
| Thành tích học tập | 0.10 |

Đây là những con số **nhỏ** — giải thích chừng 1–3% phương sai. Và đây đã là
biến có bằng chứng **tốt nhất** trong toàn bộ mô hình; mọi nhóm còn lại còn
yếu hơn.

Ba hệ quả bắt buộc cho cách trình bày:

1. **Không được nói kết quả này dự báo em sẽ học tốt.** Thành tích là kết quả
   được dự báo *kém nhất* trong ba loại.
2. **Nếu phải chọn một điều để nói, hãy nói về sự hài lòng** — đó là kết quả
   được dự báo tốt nhất, và cũng đúng với mục đích của công cụ: giúp em biết
   ngành nào hợp với điều em thấy thú vị.
3. **Một con số duy nhất không đủ để quyết định.** Giao diện và `explain.ts`
   phải giữ đúng giọng "một góc nhìn dựa trên dữ liệu", không bao giờ thành
   lời khuyên. Có bộ test chặn các từ "tốt nhất", "phù hợp nhất", "chắc chắn",
   "thành công", "xác suất".

Nguồn:
- [Does interest fit between student and study program lead to better outcomes? (Educational Research Review, 2024)](https://www.sciencedirect.com/science/article/pii/S1747938X24000289)
- [Impact of Interest Congruence on Study Outcomes (Frontiers in Psychology, 2022)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.816620/full) — Cohen's d 0.11–0.37 cho việc học tiếp; tương quan với thành tích dưới 0.15 và với sự hài lòng dưới 0.10.

---

## 4. Những chỗ CHƯA có căn cứ, phải nói rõ

Trung thực mà nói, các con số sau vẫn là quy ước, chưa tra được nguồn nào ủng
hộ trực tiếp. Chúng đứng vững bằng lập luận nội tại chứ không bằng dữ liệu:

- Ngưỡng dải kết quả 80 / 65 / 50 (PART 6.46).
- Mức phạt cổng mềm 0.15 / 0.08 / 0.03 và trần 0.30 (PART 6.30, 6.44).
- Trọng số công thức confidence 0.35 / 0.25 / 0.25 / 0.15 (PART 6.51).
- Ngưỡng đủ dữ liệu theo nhóm (PART 6.12).
- `MIN_USABLE_GROUP_WEIGHT = 0.5` — do tôi thêm, lập luận ở `README.md`.
- Điểm cộng từ các câu lựa chọn trong `derivation.ts`.
- Toàn bộ DNA ngành trong `seed.ts` — dữ liệu phát triển, Level 5.

Chúng nằm trong `config.ts` và có phiên bản, nên khi có dữ liệu thật thì chỉnh
được mà không đụng tới thuật toán.
