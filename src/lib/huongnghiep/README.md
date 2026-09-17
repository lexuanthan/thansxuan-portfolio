# Hệ hỗ trợ quyết định chọn ngành — chọn trường

Module nằm trong web portfolio hiện có, dùng chung Supabase và bộ màu/kiểu chữ
của site. Trang người dùng sẽ ở `/ai-tools/huong-nghiep`, quản trị ở
`/admin/huong-nghiep`. Toàn bộ phần tính toán ở `src/lib/huongnghiep/` là hàm
thuần, không phụ thuộc Next.js hay Supabase, nên test chạy độc lập.

## Nguyên tắc không được vi phạm

```
AI does NOT calculate.  AI does NOT rank.  AI does NOT decide.
Algorithm calculates.  Rules control.  Data explains.  AI communicates.
Student decides.
```

Cụ thể trong mã:

- AI không xuất hiện ở bất kỳ dòng nào trong `engine.ts` hay `profile.ts`. Nó
  chỉ được đọc `strengths`, `gaps`, `criticalFactors` ở đầu ra và diễn đạt lại
  — mọi con số đã có sẵn ở đó, AI không được tự nghĩ ra số nào.
- `stripClientScores()` bóc mọi trường điểm khỏi request; máy chủ luôn tính lại.
- `profile.ts` **không được** sinh ra biến kiểu `recommended_major` (3.49).
- Ngành vướng `HARD_GATE` vẫn hiện ra kèm lý do, chỉ `eligible: false`.
- Không tính `admission_probability`, `success_probability`.
- Đây **không** phải trắc nghiệm tính cách (Rule S01). Không dùng chữ MBTI hay
  "bạn thuộc kiểu X"; cái ta dựng là *hồ sơ xu hướng học tập và nghề nghiệp*.
- Thiếu dữ liệu là `null` hoặc vắng khoá, **không bao giờ** là `0`.

## Đường đi của dữ liệu

```
62 câu hỏi  →  SurveyResponse  →  buildProfile()  →  StudentProfile
                                                         ↓
                                     matchMajor(profile, MajorDNA)
                                                         ↓
                              MatchResult: điểm, nhóm, cổng, diễn giải
```

## Các file

| File | Nội dung |
|---|---|
| `types.ts` | Mô hình L0→L4, Major DNA, Student Profile, kết quả khớp |
| `config.ts` | Trọng số 7 nhóm, danh mục 90 yếu tố, phạt, ngưỡng, dải kết quả |
| `survey.ts` | 62 câu / 9 màn hình, kiểm tra chất lượng trả lời |
| `derivation.ts` | Quy đổi thang, luật suy diễn, bản đồ RIASEC, dò vòng lặp |
| `profile.ts` | Pipeline 12 bước dựng hồ sơ + dấu vết truy nguyên |
| `normalize.ts` | Tiện ích chuẩn hoá và băm ổn định |
| `similarity.ts` | Công thức 6.14→6.26 |
| `engine.ts` | Pipeline 6.3, xếp hạng, what-if, chống giả mạo |
| `explain.ts` | Diễn giải theo mẫu, tất định; hợp đồng đầu vào cho lớp AI |
| `references.md` | Căn cứ học thuật cho từng lựa chọn thuật toán, kèm nguồn |
| `seed.ts` | DNA Khoa học dữ liệu + bộ trả lời mẫu — `DEVELOPMENT_ASSUMPTION` |
| `majors.ts` | 9 ngành phát triển trải đều sáu kiểu RIASEC + kiểm tra đủ điều kiện |

## Công thức đang chạy

```
Likert 1–5      → ((raw − 1) / 4) × 100     (chia 4, không phải 5)
Điểm môn 0–10   → raw × 10
similarity      = (1 − |student − major| / 100) × 100
GroupFit        = Σ(similarity × importance) / Σ(importance)
RIASEC Fit      = tương quan hồ sơ(S, M), quy [−1,1] → 0–100
                  (chỉ tính khi độ phân hoá hồ sơ ≥ 10)
coverage        = importance khả dụng / tổng importance
effectiveWeight = baseWeight × confidence (chỉ RIASEC), rồi chuẩn hoá Σ = 1
RawScore        = Σ(GroupFit × effectiveWeight)
Penalty         = min(Σ phạt cổng mềm, 0.30)
FinalScore      = RawScore × (1 − Penalty)
Confidence      = 0.35·completeness + 0.25·coverage + 0.25·dnaQuality
                  + 0.15·criticalCoverage
```

Trọng số nhóm **v2 (đang dùng)**: Academic 25, Interest 25, Ability 15,
Work Style 10, Career Value 10, RIASEC 10, Environment 5.
Bộ v1 của tài liệu (20/20/25/10/10/10/5) giữ nguyên trong mã để tái lập kết quả
cũ. Thinking gộp vào Ability (6.4). Lý do đổi: xem `references.md`.

## Ba chỉ số hay bị lẫn

- **completeness** — học sinh đã khai được bao nhiêu phần hồ sơ
- **coverage** — trong những yếu tố ngành đòi hỏi, ta có số liệu bao nhiêu phần
- **confidence** — số liệu dùng để tính đáng tin tới đâu

Thêm **reliability** (3.41): hồ sơ có thể đầy đủ mà phần lớn là tự đánh giá.
`completeness = 1` đi kèm `reliability = 0.86` là chuyện bình thường.

## Bốn điểm cần biết khi đọc số

**Cosine đã bị thay.** Đo thực nghiệm: cosine cho hồ sơ "đều tay" ~92 điểm với
MỌI ngành (biên độ 71–100, độ lệch chuẩn 7.0). Đã đổi sang tương quan hồ sơ
(biên độ 6–99, độ lệch chuẩn 27.1) kèm cổng phân hoá Holland. Chi tiết và nguồn
ở `references.md`.

**Hiệu ứng vốn nhỏ.** Phân tích tổng hợp: mức hợp hứng thú tương quan ρ = 0.18
với sự hài lòng, 0.12 với việc học tiếp, 0.10 với thành tích. Đây là biến có
bằng chứng tốt nhất trong mô hình. Nên công cụ nói về **mức hợp**, tuyệt đối
không nói về **khả năng học tốt**.

**Phạt là phép nhân, không phải phép trừ.** Trừ thẳng điểm sẽ phạt một hồ sơ
yếu nặng hơn một hồ sơ mạnh dù cùng một lỗ hổng.

**`coverage` không phải `fit`** (6.40): nó chỉ nói có bao nhiêu dữ liệu dùng
được, không nói dữ liệu ấy khớp tới đâu.

**Điểm cộng áp sau suy diễn.** Các câu lựa chọn (Q13, Q22, Q32, Q34, Q38, Q47,
Q50) cộng điểm lên nền đã suy diễn xong. Nếu cộng trước, biến "đã có giá trị"
sẽ chặn mất luật suy diễn — và một em tự chấm phân tích 5/5 lại nhận lối nghĩ
phân tích 18/100. Có test hồi quy giữ chỗ này.

## Một mâu thuẫn trong tài liệu, đã chọn cách xử lý

Bảng 2.5 ghi số câu mỗi màn hình là **6/7/8/8/8/7/6/6/6**, nhưng dải mã câu
thực tế trong chính PART 2 là **6/6/7/10/8/7/6/6/6**. Cả hai cùng cộng ra 62.
Mã hiện lấy theo dải mã câu, vì đó mới là chỗ định nghĩa từng câu một. Nếu
bảng 2.5 mới đúng thì cần nói rõ câu nào chuyển sang màn hình nào.

## Nguồn dữ liệu

Thứ bậc theo 5.47, Level 1 (chương trình đào tạo chính thức) xuống Level 5
(giả định phát triển). Số liệu trong `seed.ts` đều là Level 5
`DEVELOPMENT_ASSUMPTION` — giao diện phải gắn nhãn cảnh báo khi đọc loại này.

## Bản đồ milestone

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| M01 | Mô hình dữ liệu, chuẩn hoá đầu vào | ✅ |
| M02 | Bộ 62 câu khảo sát + kiểm tra chất lượng (PART 2) | ✅ |
| M03 | Profile Builder + suy diễn + RIASEC + lineage (PART 3) | ✅ |
| M05 | Major DNA + Matching Engine (PART 5, 6) | ✅ |
| M06 | Giao diện khảo sát + trang kết quả + diễn giải theo mẫu | ✅ |
| M06b | Kho 10 ngành + so khớp hàng loạt + bảng xếp hạng Top N | ✅ |
| M04 | Major KB, nhập CSV/JSON, duyệt, lưu database (PART 4) | ⏳ tiếp theo |
| M07 | Bản đồ ngành → nghề (PART 7) | |

Ranh giới MVP: `Survey → Student Profile → Major Matching → Top Major Results
→ Career Mapping`. Đã xong tới **Top Major Results**; còn lại Career Mapping
(cần PART 7) và tầng lưu trữ.

## Kiểm chứng xếp hạng

Chạy sáu kiểu hồ sơ điển hình qua cả 10 ngành, mỗi kiểu đều ra đúng ngành ở vị
trí đầu và ngành gần kề hợp lý ở vị trí hai:

| Hồ sơ | #1 | #2 |
|---|---|---|
| Kỹ thuật, Lý mạnh | Kỹ thuật cơ khí 88.3 | Công nghệ môi trường 73.7 |
| Thích vẽ, thiết kế | Thiết kế đồ hoạ 90.8 | Kiến trúc 83.5 |
| Thích dạy học | Giáo dục Tiểu học 90.2 | Ngôn ngữ Anh 77.7 |
| Sinh–Hoá mạnh | Điều dưỡng 89.1 | Công nghệ môi trường 77.8 |
| Toán tốt, thích trật tự | Kế toán 92.2 | Quản trị kinh doanh 77.6 |
| Thích thuyết phục | Quản trị kinh doanh 90.9 | Kế toán 82.5 |

**Một tính chất cần biết khi đọc bảng:** ngành đứng đầu tách hẳn (88–92), nhưng
các ngành còn lại dồn vào khoảng 70–83. Đó là hệ quả của công thức
`1 − |a − b| / 100`: hai hồ sơ lệch nhau 25 điểm vẫn cho similarity 75. Nên
**thứ tự đáng tin, khoảng cách vài điểm giữa hai ngành liền nhau thì không**.
Giao diện nói rõ điều này ngay dưới bảng.

## Giao diện

- Trang người dùng: `/ai-tools/huong-nghiep`
- `SurveyWizard.tsx` — 9 màn hình, tiến độ theo %, tự lưu vào `localStorage`,
  quay lại sửa được (PART 2.14)
- `QuestionField.tsx` — ô trả lời cho 12 kiểu câu hỏi
- `ResultView.tsx` — điểm tổng, điểm từng nhóm, điểm mạnh, phần cần củng cố,
  cổng chặn, RIASEC, chất lượng dữ liệu

Bản dựng hiện tại chạy **hoàn toàn trong trình duyệt**: engine là hàm thuần nên
không cần máy chủ, và câu trả lời chưa rời khỏi máy học sinh. Khi nối Supabase
(M04) thì **phần tính điểm phải chuyển về máy chủ** — không phải vì máy khách
tính sai, mà vì điểm tính ở máy khách là điểm người ta sửa được (6.76, 6.77).

## Một lỗ hổng của tài liệu, đã bịt

Tài liệu đặt ngưỡng đủ dữ liệu cho **từng nhóm** (6.12) và cho **hồ sơ** (6.13),
nhưng không đặt sàn cho phần trọng số còn sống sót sau bước chuẩn hoá lại
(6.41). Chạy thử thì lộ ra ngay:

> Một em trả lời đúng 7 câu tự chấm năng lực. Sáu nhóm còn lại thiếu dữ liệu,
> nên Ability là nhóm duy nhất hợp lệ và trọng số của nó được chuẩn hoá thành
> **1.000**. Kết quả: *"Tương thích nổi bật — 89/100"* cho ngành Khoa học dữ
> liệu, dựng hoàn toàn từ bảy câu em tự đánh giá về mình. Confidence 0.617,
> tức là ngay cả cảnh báo dữ liệu mỏng cũng không bật.

Con số ấy không sai về số học, nó chỉ không có nghĩa — mà một con số vô nghĩa
trông y hệt một con số có nghĩa. Đã thêm `MIN_USABLE_GROUP_WEIGHT = 0.5`: phải
còn ít nhất một nửa mô hình mới được chấm điểm, tính trên **trọng số gốc** chứ
không phải trọng số đã chuẩn hoá (sau chuẩn hoá thì tổng luôn bằng 1 dù còn
mấy nhóm, nên tính ở đó thì sàn không chặn được gì).

`MatchResult.usableWeightShare` cho biết còn bao nhiêu phần mô hình dùng được.

## Một tính chất của công thức confidence, nên biết

`completeness` chỉ chiếm 0.35 trong công thức 6.51, nên một hồ sơ khai **0%**
mà dữ liệu vẫn kín vẫn cho confidence **0.63** — trên ngưỡng cảnh báo 0.6.
Cảnh báo chỉ thật sự bật khi `coverage` tụt theo. Trong luồng thật thì hai thứ
đó đi cùng nhau nên không thành vấn đề, nhưng nếu sau này đổi trọng số thì nhớ
tính chất này. Có test ghi lại nó.

## Chưa làm, cố ý

- **Lưu database.** Hiện mọi thứ là object trong bộ nhớ. Các bảng
  `survey_forms`, `survey_answers`, `student_profiles`, `major_factor_values`,
  `major_matching_results`… (2.15, 3.47, 5.39–5.41, 6.65–6.67) thuộc M04.
- JSON Schema `/schemas/major-dna.schema.json` (5.37) — M04.
- API `/api/v1/...` (6.79) — M06.
- Q39/Q51 mới lưu thứ hạng, chưa dùng trong tính điểm (đúng 6.23: ưu tiên mức
  tuyệt đối Q40–Q44, xếp hạng chỉ bổ sung).
- Q57–Q62 điều kiện thực tế mới thu thập và tách riêng, chưa dùng — chúng
  thuộc University Matching, không thuộc Major Matching (6.71).
- Sensitivity analysis (6.71), Mode B exploration (6.64), related majors (6.59).
- Immutability của DNA đã PUBLISHED (5.43) mới ở mức quy ước; cưỡng chế thật
  cần tầng database.
