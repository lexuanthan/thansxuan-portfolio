# Tool quản lý công việc — Ban Thường vụ Đoàn trường

**Quy mô:** 9 người · **Nền tảng:** Next.js + Supabase, **dự án độc lập** — tách
riêng khỏi web cá nhân thanlx.vercel.app, không gắn vào `/du-an` nữa.
**Tài liệu này gồm:** ràng buộc kỹ thuật đã kiểm chứng → kiến trúc → mô hình dữ liệu
→ tính năng → sổ văn bản đến (thay file Excel anh đang dùng) →
**prompt hoàn chỉnh để đưa cho AI/lập trình viên** → việc cần chốt.

---

## PHẦN 0 — Hai ràng buộc phải biết trước khi thiết kế

Đây là phần quan trọng nhất của tài liệu. Hai điều dưới đây quyết định toàn bộ
kiến trúc phần nhắc việc, và nếu không biết trước thì sẽ xây xong mới phát hiện.

### 0.1. Vercel gói Hobby: cron **chỉ chạy 1 lần/ngày**, sai số **±59 phút**

Tài liệu Vercel ghi rõ: gói Hobby giới hạn cron *once per day*, và độ chính xác
là *per-hour (±59 min)* — đặt `0 7 * * *` thì nó nổ đâu đó từ 7:00 tới 7:59.
Biểu thức chạy dày hơn sẽ **fail ngay lúc deploy**.

**Hệ quả:** yêu cầu "nhắc khi **đến hạn**" KHÔNG thể làm bằng Vercel Cron trên
gói miễn phí. Nhắc lúc 14:00 mà hệ thống chỉ kiểm tra mỗi ngày một lần, lệch cả
tiếng, thì lời nhắc trở nên vô dụng.

**Cách giải quyết — dùng `pg_cron` của Supabase thay vì Vercel Cron.**
Supabase bật được extension `pg_cron` ngay trên gói miễn phí, chạy được **mỗi
phút**, và `pg_net` cho phép gọi HTTP ra ngoài từ trong database. Kiến trúc:

```
pg_cron (mỗi 5 phút)
   └→ gọi Edge Function "quet-han-cong-viec"
        └→ tìm việc sắp/đã đến hạn chưa gửi nhắc
             └→ đẩy Web Push + Email
                  └→ ghi log vào bảng notification_log
```

Vercel Cron chỉ giữ lại cho **một việc duy nhất**: bản tin tổng hợp 7:00 sáng
mỗi ngày (việc hôm nay, việc quá hạn). Việc đó chịu được sai số ±59 phút.

### 0.2. iPhone: thông báo web chỉ chạy khi đã **"Thêm vào màn hình chính"**

Apple bắt buộc: web push trên iOS chỉ hoạt động khi người dùng đã cài trang web
lên Home Screen. Mở trong tab Safari bình thường thì **không nhận được thông báo
nào cả**. Ngoài ra hộp thoại xin quyền phải bật từ một cú bấm của người dùng,
không được tự bật lúc tải trang.

**Hệ quả thực tế cho nhóm 9 người:** ai dùng iPhone phải làm một lần thao tác
*Share → Add to Home Screen* rồi mở app từ icon đó và bấm nút "Bật thông báo".
Đây **phải là một bước trong quy trình nhận tài khoản**, có màn hình hướng dẫn
kèm ảnh, chứ không phải chuyện để mọi người tự mò. Bỏ qua bước này là nguyên
nhân số một khiến tool kiểu này chết sau hai tuần.

**Phương án dự phòng bắt buộc:** email. Cả 9 người đều đăng nhập bằng Gmail nên
chắc chắn có email chạy được. Thiết kế: Web Push là kênh chính, email là lưới an
toàn — việc quá hạn thì gửi cả hai.

---

## PHẦN 1 — Kiến trúc

```
┌─────────────────────────────────────────────┐
│  Next.js (App Router) — dự án Vercel riêng  │
│  route gốc "/"  ← tool nằm ở đây            │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼─────────┐    ┌──────▼──────────────────┐
│ Supabase    │    │ Supabase Edge Function  │
│ • Auth      │    │ • quet-han-cong-viec    │
│   (Google)  │    │ • gui-thong-bao         │
│ • Postgres  │    └──────┬──────────────────┘
│   + RLS     │           │
│ • Realtime  │    ┌──────▼──────────────────┐
│   (chat)    │    │ pg_cron — mỗi 5 phút    │
│ • Storage   │    └─────────────────────────┘
│   (file)    │
└─────────────┘
```

**Dự án mới hoàn toàn, tách khỏi web cá nhân thanlx.vercel.app.** Repo riêng,
project Vercel riêng, project Supabase riêng. Không còn lý do phải tái sử dụng
`components/ui` hay bộ màu hổ phách của web cũ — tự chọn màu, font, bố cục cho
phù hợp với công tác Đoàn (vd giữ tông xanh–đỏ quen thuộc của Đoàn TNCS Hồ Chí
Minh nếu muốn), không bị ràng buộc gì từ thiết kế cũ. Cũng không cần thêm dòng
nào vào bảng `projects` của web cũ nữa — không có màn hình `/du-an` nào liệt kê
tool này, người dùng truy cập thẳng bằng domain riêng của dự án mới.

**Đặt tên miền:** dùng luôn domain mặc định Vercel cấp (`ten-du-an.vercel.app`)
lúc mới dựng cho nhanh; gắn domain riêng (vd `congviec.<gì đó>.vn`) sau nếu cần,
không ảnh hưởng gì tới kiến trúc phía trên.

---

## PHẦN 2 — Đăng nhập và phân quyền

### Đăng nhập Google, nhưng KHÔNG mở cho mọi người

Supabase Auth + Google provider. Điểm then chốt: **bảng allowlist**. Ai đăng
nhập bằng Gmail không nằm trong danh sách 9 người thì thấy màn hình "Tài khoản
chưa được cấp quyền", không vào được gì cả.

Không làm bước này thì bất kỳ ai có link đều tạo được tài khoản và đọc được
công việc nội bộ của Ban Thường vụ.

### Bốn vai trò

| Quyền | `bi_thu` | `pho_bi_thu` | `chanh_van_phong` | `uy_vien` |
|---|:---:|:---:|:---:|:---:|
| Giao việc cho bất kỳ ai | ✅ | ✅ | ✅ | — |
| Tạo việc cho chính mình | ✅ | ✅ | ✅ | ✅ |
| Sửa/đổi hạn việc của người khác | ✅ | ✅ | ✅ | — |
| Đổi người phụ trách (bàn giao) | ✅ | ✅ | ✅ | — |
| **Duyệt hoàn thành** | ✅ | ✅ | ⚠️ xem dưới | — |
| Đôn đốc thủ công | ✅ | ✅ | ✅ | — |
| Quản lý mảng công việc / sự kiện | ✅ | ✅ | ✅ | — |
| Quản lý mẫu công việc, kho tài liệu | ✅ | ✅ | ✅ | — |
| Xem báo cáo, thống kê toàn nhóm | ✅ | ✅ | ✅ | — |
| Xuất báo cáo Word/Excel | ✅ | ✅ | ✅ | — |
| Quản lý thành viên (thêm/khoá tài khoản) | ✅ | — | — | — |
| Xem việc của cả nhóm | ✅ | ✅ | ✅ | ✅ |
| Cập nhật việc được giao, bình luận | ✅ | ✅ | ✅ | ✅ |

Ai cũng **xem được** việc của người khác — Ban Thường vụ làm việc tập thể, giấu
việc của nhau chỉ gây trùng lặp. Nhưng chỉ người được giao và cấp trên mới
**sửa** được.

### ⚠️ Chánh văn phòng có nên được duyệt hoàn thành không?

Đây là chỗ duy nhất tôi không tự quyết được, vì nó phụ thuộc cách nhóm anh vận
hành.

Duyệt hoàn thành là **hành vi xác nhận trách nhiệm**, không phải thao tác hành
chính. Trong cơ cấu Đoàn, Chánh văn phòng là đầu mối điều phối và theo dõi tiến
độ, còn việc xác nhận "việc này coi như xong" thường thuộc về Bí thư/Phó Bí thư.

**Đề xuất mặc định — duyệt theo loại việc:**

| Loại việc | Ai duyệt |
|---|---|
| Hành chính, văn phòng, hậu cần, báo cáo, biểu mẫu | Chánh văn phòng ✅ |
| Chủ trương, nhân sự, đối ngoại, kinh phí, chuyên môn | Bí thư / Phó Bí thư |

Thêm cột `approval_scope` vào bảng `tasks` với hai giá trị `hanh_chinh` và
`chuyen_mon`; người tạo việc chọn lúc giao, mặc định là `chuyen_mon`.

Nếu thấy phức tạp quá thì chọn một trong hai cách đơn giản hơn:
- **Cho duyệt hết** — nhanh gọn, phù hợp nếu Chánh văn phòng là người anh tin
  tưởng điều hành toàn bộ. Mọi lần duyệt vẫn ghi rõ ai duyệt trong nhật ký.
- **Không cho duyệt** — Chánh văn phòng chỉ giao việc và đôn đốc, khâu chốt để
  Bí thư. An toàn hơn về mặt trách nhiệm nhưng Bí thư sẽ thành nút cổ chai.

Xem câu hỏi số 6 ở Phần 7.

---

## PHẦN 3 — Mô hình dữ liệu

```sql
-- Thành viên: allowlist, tạo trước khi người đó đăng nhập lần đầu
members (
  id uuid pk, email text unique not null, full_name text not null,
  role text check (role in ('bi_thu','pho_bi_thu','chanh_van_phong','uy_vien')),
  mang_phu_trach text,        -- tổ chức / tuyên giáo / phong trào / kiểm tra
  phone text, avatar_url text,
  active boolean default true,
  -- Cách gọi quen thuộc trong văn bản/Excel, vd {"Đ/c Trường","Trường"}.
  -- Dùng để khớp tên khi nhập lại sổ văn bản đến — file gốc ghi người xử lý
  -- kiểu "Đ/c Trường, Đ/c Hòa", không phải tên đầy đủ trong bảng members.
  alias text[],
  -- Chế độ bận: thi cử, đi công tác. Hệ thống cảnh báo khi giao việc vào
  -- khoảng này thay vì để người giao phát hiện lúc đã muộn.
  busy_from date, busy_to date, busy_reason text,
  created_at timestamptz default now()
)

-- Mảng công việc lớn: một sự kiện, một chiến dịch, một đợt
campaigns (
  id uuid pk, name text not null, description text,
  start_date date, end_date date,
  status text check (status in ('du_kien','dang_chay','hoan_thanh','huy')),
  color text, created_by uuid references members
)

-- Sổ văn bản đến — thay file Excel "THEO DÕI VĂN BẢN ĐẾN" anh đang dùng.
-- Cột đặt đúng theo file gốc để việc nhập liệu không đổi thói quen; khác biệt
-- duy nhất và cũng là lý do làm bảng này: thoi_han_xu_ly nối thẳng vào cùng
-- cơ chế nhắc việc ở Phần 4, còn Excel thì chỉ ghi hạn ra đó rồi ai đó phải
-- tự nhớ mà xem lại.
incoming_documents (
  id uuid pk,
  don_vi_gui text not null,     -- "ĐƠN VỊ GỬI ĐẾN": THÀNH ĐOÀN, ĐƠN VỊ KHÁC…
  so_ky_hieu text,              -- "SỐ, KÝ HIỆU VB", vd "262-TB/TĐTN"
  noi_dung text not null,       -- trích yếu nội dung
  ngay_nhan date not null,
  ngay_chuyen_xu_ly date,
  thoi_han_xu_ly timestamptz,   -- null = văn bản không có hạn xử lý cụ thể
  ghi_chu text,
  -- Ảnh/PDF văn bản gốc quét lên, để không phải lục lại email hay giấy tờ.
  file_path text,
  created_by uuid references members,
  created_at timestamptz default now()
)

tasks (
  id uuid pk,
  campaign_id uuid references campaigns,   -- null = việc lẻ
  -- Việc sinh ra từ một văn bản đến (Phần 3, bảng incoming_documents), null
  -- nếu là việc tự tạo. Một văn bản thường phải giao cho NHIỀU người cùng lúc
  -- (file gốc ghi "Đ/c Trường, Đ/c Hòa" trong một ô) — nhưng một task ở đây
  -- luôn chỉ có đúng một người chịu trách nhiệm chính, nên một văn bản sinh RA
  -- NHIỀU dòng tasks, mỗi dòng nối lại đây, chứ không phải một task nhiều chủ.
  source_document_id uuid references incoming_documents,
  title text not null, description text,
  -- Người chịu trách nhiệm CHÍNH. Một việc luôn có đúng một người chịu trách
  -- nhiệm; giao cho "cả nhóm" là công thức để không ai làm.
  owner_id uuid references members not null,
  created_by uuid references members not null,
  priority text check (priority in ('thap','binh_thuong','cao','khan')),
  status text check (status in
    ('moi','dang_lam','cho_duyet','hoan_thanh','tam_dung','huy')),
  -- Quyết định ai được duyệt hoàn thành. Việc hành chính thì Chánh văn phòng
  -- duyệt; việc chuyên môn/chủ trương để Bí thư. Mặc định 'chuyen_mon' vì
  -- mặc định phải là phương án chặt hơn, không phải phương án tiện hơn.
  approval_scope text default 'chuyen_mon'
    check (approval_scope in ('hanh_chinh','chuyen_mon')),
  due_at timestamptz,          -- hạn, có cả giờ chứ không chỉ ngày
  started_at timestamptz, submitted_at timestamptz,
  completed_at timestamptz, approved_by uuid references members,
  -- Lặp lại: họp giao ban thứ Hai hằng tuần, báo cáo tháng…
  recur_rule text,             -- 'WEEKLY:MON' | 'MONTHLY:25' | null
  recur_parent_id uuid references tasks,
  created_at timestamptz default now(), updated_at timestamptz default now()
)

-- Người phối hợp (khác với người chịu trách nhiệm chính)
task_collaborators (task_id, member_id, primary key (task_id, member_id))

task_comments (
  id uuid pk, task_id uuid references tasks on delete cascade,
  member_id uuid references members, body text not null,
  created_at timestamptz default now()
)

task_attachments (
  id uuid pk, task_id uuid references tasks on delete cascade,
  member_id uuid references members,
  file_path text not null, file_name text, file_size int, mime text,
  created_at timestamptz default now()
)

-- Chat chung — một kênh duy nhất, xem phần 5.2 để biết vì sao
chat_messages (
  id uuid pk, member_id uuid references members,
  body text not null, reply_to uuid references chat_messages,
  created_at timestamptz default now()
)

-- Thiết bị nhận thông báo đẩy
push_subscriptions (
  id uuid pk, member_id uuid references members,
  endpoint text unique not null, p256dh text, auth text,
  user_agent text, created_at timestamptz default now()
)

-- Nhật ký gửi thông báo. Cột UNIQUE là thứ chống gửi trùng khi cron chạy lại.
notification_log (
  id uuid pk, task_id uuid references tasks,
  member_id uuid references members,
  kind text check (kind in
    ('truoc_1_ngay','truoc_2_gio','den_han','qua_han','leo_thang','giao_viec',
     'don_doc')),   -- don_doc: do người bấm gửi, không phải do cron
  channel text check (channel in ('push','email')),
  sent_at timestamptz default now()
)

-- Chống gửi trùng cho các mốc TỰ ĐỘNG. Phải là index riêng có mệnh đề WHERE —
-- Postgres không cho gắn WHERE vào ràng buộc UNIQUE viết trong thân bảng.
-- Đôn đốc thủ công cố ý nằm ngoài: nó được bấm gửi nhiều lần là chuyện bình thường.
create unique index notification_log_tu_dong_unique
  on notification_log (task_id, member_id, kind, channel)
  where kind <> 'don_doc';

-- Nhật ký thay đổi: ai đổi gì lúc nào. Cần cho việc đối chiếu về sau.
activity_log (
  id uuid pk, task_id uuid, member_id uuid,
  action text, detail jsonb, created_at timestamptz default now()
)
```

**`incoming_documents` cố ý không có cột trạng thái riêng.** Trạng thái xử lý
của một văn bản suy ra từ các `tasks` đang nối tới nó qua `source_document_id`:
chưa có task nào → *chưa phân công*; còn task nào chưa `hoan_thanh` → *đang xử
lý*; mọi task đều `hoan_thanh` → *hoàn thành*. Lưu trạng thái làm cột riêng thì
sẽ có lúc nó lệch với trạng thái task thật — hai nguồn sự thật cho cùng một
việc luôn dẫn tới lệch pha, nên chỉ tính từ task, không lưu thêm.

**Bật RLS trên mọi bảng.** Chính sách: `auth.jwt() ->> 'email'` phải khớp một
dòng `members` đang `active`. Không có dòng nào khớp thì không đọc được gì.

---

## PHẦN 4 — Cơ chế nhắc việc

### Bốn mốc nhắc

| Mốc | Thời điểm | Kênh | Gửi cho |
|---|---|---|---|
| `giao_viec` | ngay khi được giao | push + email | người nhận |
| `truoc_1_ngay` | 24 giờ trước hạn | push | người nhận |
| `truoc_2_gio` | 2 giờ trước hạn | push | người nhận |
| `den_han` | đúng giờ hạn | push + email | người nhận |
| `qua_han` | 1 ngày sau hạn | push + email | người nhận |
| `leo_thang` | 3 ngày sau hạn | push + email | người nhận **+ Bí thư + Chánh văn phòng** |
| `don_doc` | khi có người bấm nút | push + email | người nhận |

Mốc `leo_thang` là cái làm tool này khác một danh sách việc thường. Việc trễ ba
ngày mà không ai biết thì cơ chế nhắc đã thất bại; báo lên cấp trên là cách duy
nhất để nó không chìm luôn.

### Chống gửi trùng

`notification_log` có ràng buộc `unique (task_id, member_id, kind, channel)`.
Trước khi gửi thì `insert ... on conflict do nothing`; chèn được 0 dòng nghĩa là
đã gửi rồi, bỏ qua. Không có cái này thì cron chạy lại sau lỗi mạng sẽ bắn lại
toàn bộ thông báo cũ — và đó là cách nhanh nhất để mọi người tắt thông báo.

### Múi giờ

**Lưu `timestamptz`, tính theo `Asia/Ho_Chi_Minh`.** Một việc hạn "17:00 thứ Sáu"
mà máy chủ hiểu theo UTC sẽ nhắc lúc nửa đêm. Đặt rõ múi giờ ở cả database lẫn
phần hiển thị.

### Không làm phiền ban đêm

Không gửi push trong khoảng **22:00 – 06:00**. Việc đến hạn lúc 23:00 thì dồn
sang 6:00 sáng hôm sau. Ngoại lệ: mức ưu tiên `khan`.

---

## PHẦN 5 — Tính năng

### 5.1. Bắt buộc (MVP)

1. **Bảng việc cá nhân** — "Việc của tôi", nhóm theo: quá hạn / hôm nay / tuần
   này / sắp tới. Mở app ra là thấy ngay phải làm gì, không phải lọc.
2. **Bảng việc toàn nhóm** — ai đang làm gì, chế độ danh sách và chế độ cột
   theo trạng thái.
3. **Tạo & giao việc** — tiêu đề, mô tả, người chịu trách nhiệm, người phối hợp,
   hạn (ngày + giờ), mức ưu tiên, mảng công việc.
4. **Cập nhật trạng thái** — mới → đang làm → chờ duyệt → hoàn thành.
5. **Duyệt hoàn thành** — Bí thư/Phó Bí thư xác nhận. Tự khai hoàn thành mà
   không ai kiểm thì con số báo cáo cuối kỳ không dùng được.
6. **Bình luận trong từng việc** + đính kèm file.
7. **Thông báo đẩy** theo Phần 4.
8. **Lịch** — xem theo tháng, hạn công việc và sự kiện trên cùng một lưới.
9. **Chat nhóm** — một kênh chung.
10. **Bảng điều phối** — màn hình riêng cho Chánh văn phòng, xem 5.1b.
11. **Đôn đốc thủ công** — nút gửi nhắc ngay cho người phụ trách, kèm lời nhắn.
12. **Sổ văn bản đến → sinh việc tự động** — thay file Excel hiện tại, xem 5.1d.
    Đề xuất đưa vào MVP luôn (không để dành Nhóm A) vì đây là việc Chánh văn
    phòng đang làm thủ công **mỗi ngày** — có 32 văn bản chỉ riêng từ tháng
    5–8/2026 — chứ không phải tính năng "làm thêm cho vui".

### 5.1b. Bảng điều phối — màn hình của Chánh văn phòng

Chánh văn phòng là **người mở tool nhiều nhất trong 9 người**. Ba vai trò kia
vào để xem việc của mình; Chánh văn phòng vào để nhìn toàn cảnh và đi nhắc từng
người. Nếu bắt họ dùng chung màn hình với mọi người thì mỗi lần muốn biết "ai
đang trễ" lại phải lọc lại từ đầu — ngày vài lần, và đó là lúc người ta bỏ tool.

Cho nên cần một màn hình riêng, mở ra là thấy ngay:

- **Đang trễ** — xếp theo số ngày trễ giảm dần, mỗi dòng có nút *Đôn đốc*.
- **Đến hạn trong 48 giờ** — để nhắc trước khi trễ, không phải sau.
- **Chờ duyệt** — việc người ta đã nộp, đang đợi xác nhận. Đây là chỗ hay tắc.
- **Tải việc từng người** — mỗi người đang giữ bao nhiêu việc chưa xong. Nhìn
  cột này là biết ai đang quá tải và ai còn nhận thêm được, trước khi giao.
- **Ai đang bận** — những người đã đánh dấu thi cử / đi công tác trong tuần.
- **Việc không có hạn** — việc tạo xong quên đặt hạn sẽ không bao giờ được nhắc
  và cứ thế chìm. Gom riêng ra đây để dọn.
- **Việc chưa có ai phụ trách** — nếu cho phép tạo việc nháp chưa giao.
- **Văn bản chờ phân công** — văn bản đã nhập nhưng chưa sinh việc cho ai, kể
  cả loại "Xin ý kiến BTV" (xem 5.1d) — vẫn phải hiện, không được rơi mất.

Kèm **nút xuất Excel** ngay trên màn hình này, vì đây chính là dữ liệu Chánh văn
phòng cần để làm báo cáo gửi Đoàn cấp trên.

### 5.1c. Đôn đốc thủ công

Nút *Đôn đốc* trên mỗi công việc, chỉ Bí thư / Phó Bí thư / Chánh văn phòng thấy.
Bấm vào mở một ô nhập lời nhắn ngắn, gửi push + email ngay cho người phụ trách.

Ba điều cần làm đúng:

- **Không chặn gửi trùng.** Đôn đốc là hành vi có chủ đích của con người, khác
  hẳn nhắc tự động. Vì vậy nó nằm ngoài index chống trùng ở Phần 3.
- **Giới hạn nhịp:** tối đa **1 lần / việc / người / 6 giờ**. Không có giới hạn
  thì nó thành công cụ làm phiền và người nhận sẽ tắt thông báo — mất luôn cả
  các mốc nhắc tự động.
- **Hiện công khai trong việc đó:** "Chánh văn phòng đã đôn đốc lúc 14:20". Nhắc
  nhau mà giấu thì dễ thành chuyện riêng; để công khai thì nó là điều phối.

### 5.1d. Sổ văn bản đến → sinh việc tự động

Dựa trên file `THEO DÕI VĂN BẢN ĐẾN.xlsx` anh gửi — file đang dùng thật, có 32
dòng dữ liệu từ 20/5 đến 30/7/2026, chủ yếu văn bản từ THÀNH ĐOÀN. Tám cột gốc:

`STT · ĐƠN VỊ GỬI ĐẾN · NỘI DUNG · SỐ, KÝ HIỆU VB · NGÀY NHẬN ·`
`NGÀY CHUYỂN XỬ LÝ · NGƯỜI NHẬN XỬ LÝ · THỜI HẠN XỬ LÝ · GHI CHÚ`

**Vấn đề của bản Excel hiện tại — đúng cái tool này sinh ra để giải quyết:**
cột "THỜI HẠN XỬ LÝ" chỉ là chữ nằm trong ô. Không ai nhắc khi nó sắp tới, và
hàng có hạn nhưng chưa xử lý trông giống hệt hàng đã xong — phải đọc từng dòng,
đối chiếu với trí nhớ, mới biết cái nào còn treo. Càng nhiều dòng thì việc đối
chiếu này càng dễ sai.

**Cách hoạt động:**

1. **Nhập văn bản** — form đúng 8 cột trên, quen tay ngay vì giống hệt Excel
   đang dùng. `NGÀY NHẬN` bắt buộc, các cột khác có thể để trống nếu chưa rõ.
2. **Giao việc từ văn bản** — sau khi lưu, bấm "Giao việc": chọn một hoặc nhiều
   người từ `NGƯỜI NHẬN XỬ LÝ`, mỗi người ra **một task riêng**
   (`source_document_id` trỏ về văn bản, `due_at` lấy từ `THỜI HẠN XỬ LÝ`,
   `description` lấy từ `GHI CHÚ`) — vì lý do đã nói ở Phần 3: một task một
   chủ. File gốc có nhiều dòng ghi hai người chung một văn bản (vd "Đ/c Trường,
   Đ/c Hòa") — cứ tách thành hai task độc lập, ai xong phần người đó tự cập
   nhật, không phải chờ nhau mới tích được trạng thái.
3. **Chưa rõ giao ai thì để đó** — file gốc có dòng ghi "Xin ý kiến BTV" thay
   vì tên người (case thật, dòng thứ 8). Đây không phải lỗi nhập liệu, đây là
   một *trạng thái công việc thật*: cần Ban Thường vụ họp bàn trước khi giao.
   Văn bản này lưu lại, không ép chọn người ngay, và hiện ở khung "Văn bản chờ
   phân công" trong Bảng điều phối (5.1b) tới khi có người xử lý.
4. **Sổ văn bản** — bảng danh sách thay thế file Excel, lọc theo đơn vị gửi,
   khoảng ngày nhận, trạng thái (suy ra từ task, xem Phần 3), tìm theo số ký
   hiệu hoặc nội dung.
5. **Xuất Excel giữ đúng 8 cột gốc** — Chánh văn phòng vẫn có thể cần nộp báo
   cáo lên Thành Đoàn theo đúng mẫu quen thuộc.

**Nhập lại dữ liệu cũ:** 32 dòng đang có trong file có thể chuyển thẳng vào hệ
thống mới lúc go-live, nhưng cần dọn trước ba chỗ nhìn thấy trong chính file
anh gửi:
- Cột `SỐ, KÝ HIỆU VB` một số ô có ký tự tab thừa ở đầu (vd `"\t743-CV/TĐTN"`)
  — trim khi import, không thì tìm kiếm/so khớp sau này bị lệch.
- Cột `STT` gần như bỏ trống (chỉ dòng đầu có số) — đánh số lại tự động, không
  dùng số từ file gốc.
- `NGƯỜI NHẬN XỬ LÝ` là chữ tự do, không phải id — cần khớp thủ công một lần
  sang bảng `members` lúc import (dùng cột `alias` mới thêm ở Phần 3 để khớp
  kiểu "Đ/c Trường"); dòng nào không khớp được người cụ thể (như "Xin ý kiến
  BTV") thì import như văn bản chưa phân công, không đoán bừa người xử lý.

### 5.2. Một lời khuyên thẳng về phần chat

Nhóm anh gần như chắc chắn **đã có một nhóm Zalo**. Một khung chat mới trong
tool sẽ không cạnh tranh nổi với nó: mọi người không mở tool suốt ngày, còn Zalo
thì luôn mở. Kinh nghiệm chung với các tool nội bộ quy mô nhỏ là kênh chat chung
thường chết sau vài tuần.

Cái **không chết** là **bình luận gắn trong từng công việc** — vì nó có ngữ
cảnh, và vì sáu tháng sau khi cần biết "vì sao đổi ngày tổ chức" thì nó nằm ngay
trong việc đó chứ không trôi mất trong 2.000 tin nhắn Zalo.

**Đề xuất:** làm bình luận-trong-việc thật tốt, kênh chat chung làm đơn giản
thôi. Và cân nhắc cái này: nút **"Gửi sang Zalo"** trên mỗi công việc, sinh sẵn
một đoạn text gọn (tên việc, người phụ trách, hạn, link) để dán vào nhóm Zalo.
Đi theo thói quen sẵn có thay vì cố đổi nó.

### 5.3. Gợi ý thêm — xếp theo giá trị thực tế cho công tác Đoàn

**Nhóm A — đáng làm ngay sau MVP**

- **Công việc lặp lại.** Họp giao ban thứ Hai, báo cáo ngày 25 hằng tháng, sinh
  hoạt chi đoàn... Đặt một lần, hệ thống tự sinh việc mới khi việc cũ xong. Đây
  là tính năng tiết kiệm nhiều thao tác nhất cho công tác Đoàn.
- **Biên bản họp → tự sinh đầu việc.** Sau mỗi cuộc họp, gõ biên bản vào một ô;
  mỗi dòng bắt đầu bằng `- [ ]` thành một công việc, gán người và hạn ngay tại
  đó. Giải quyết đúng chỗ rò rỉ lớn nhất: họp xong phân công miệng rồi quên.
- **Mẫu công việc theo sự kiện.** Một sự kiện Đoàn luôn có bộ việc gần giống
  nhau (xin chủ trương → kế hoạch → kinh phí → truyền thông → nhân sự → tổ chức
  → báo cáo). Lưu thành mẫu, lần sau bấm một cái ra đủ 8–12 đầu việc kèm hạn
  tương đối.
- **Xuất báo cáo Word/Excel.** Ban Thường vụ phải nộp báo cáo lên Đoàn cấp trên.
  Xuất theo tháng/quý: việc đã làm, đang làm, tiến độ theo từng người.
- **Chế độ bận.** Đánh dấu tuần thi, đợt đi công tác. Khi giao việc vào khoảng
  đó, hệ thống cảnh báo ngay lúc giao.

**Nhóm B — làm khi đã chạy ổn định**

- **Bàn giao việc** có ghi nhận lý do, giữ nguyên lịch sử bình luận.
- **Việc phụ thuộc nhau** — "làm xong A mới bắt đầu được B", cảnh báo khi A trễ
  kéo theo B.
- **Thống kê cá nhân** — thời gian xử lý trung bình mỗi việc. Hai chỉ số còn
  lại (số việc theo người, tỉ lệ trước/đúng/trễ hạn) chuyển sang Nhóm C bên
  dưới vì đã đủ cụ thể để làm ngay, không cần chờ "chạy ổn định" nữa.
- **Kho tài liệu** — kế hoạch mẫu, biểu mẫu, logo, quy chế, tìm kiếm được.
- **Danh sách việc cần làm trong ngày gửi 7:00 sáng** qua email, kèm link.
- **Nhật ký thay đổi hiển thị trong từng việc** — ai đổi hạn, đổi người, lúc nào.

**Nhóm C — Thống kê**

- **Thống kê số việc theo người** — với mỗi thành viên: tổng số việc đã giao,
  đang làm, đã hoàn thành, trong một khoảng thời gian chọn được (tháng / quý /
  cả nhiệm kỳ). Tính thẳng từ `owner_id` và `status` đã có sẵn ở Phần 3, không
  cần thêm bảng hay cột nào.
- **Thống kê hoàn thành theo đúng hạn** — mỗi việc đã hoàn thành xếp vào đúng
  một trong ba nhóm, so `completed_at` với `due_at`:
  - **trước hạn** — hoàn thành trước ngày `due_at`
  - **đúng hạn** — hoàn thành trong đúng ngày `due_at`
  - **trễ hạn** — hoàn thành sau ngày `due_at`

  Việc không đặt `due_at` (Phần 3 cho phép để trống) thì loại khỏi thống kê
  này, không gộp vào nhóm nào — không đoán hạn cho việc chưa từng có hạn.
- *Vẫn giữ nguyên tắc cũ:* đây là bảng so sánh giữa 9 người, nên chỉ Bí thư /
  Phó Bí thư xem được dạng so sánh nhiều người cùng lúc; mỗi người luôn xem
  được số của chính mình. Công khai bảng xếp hạng trong nhóm 9 người dễ gây
  mất đoàn kết hơn là tạo động lực.
- Hai thống kê trên nằm chung màn hình với "Xuất báo cáo Word/Excel" ở Nhóm A
  — cùng một nguồn dữ liệu, tách riêng chỉ tốn thêm một cú bấm không cần thiết.

---

## PHẦN 6 — PROMPT ĐỂ ĐƯA CHO AI HOẶC LẬP TRÌNH VIÊN

> Sao chép toàn bộ khối dưới đây.

---

**Bối cảnh.** Hãy khởi tạo cho tôi một **dự án Next.js 16 mới, độc lập** (App
Router, TypeScript strict) + Supabase + Tailwind CSS v4 — **đây không phải là
một phần của website cá nhân nào đang có**, là repo riêng, project Vercel
riêng, project Supabase riêng. Tôi cần một tool quản lý công việc cho Ban
Thường vụ Đoàn trường gồm **9 người**, chạy ở route gốc `/`.

**Tự chọn bộ màu, font, thành phần UI phù hợp** — không có design system cũ
nào phải tái sử dụng. Ưu tiên gọn, dễ thao tác trên điện thoại hơn là cầu kỳ.

**Chức năng bắt buộc:**

1. **Đăng nhập Google** qua Supabase Auth, kèm **bảng allowlist**: chỉ email nằm
   trong bảng `members` và `active = true` mới vào được. Email lạ thấy màn hình
   "Tài khoản chưa được cấp quyền". Bật RLS trên mọi bảng, chính sách dựa trên
   `auth.jwt() ->> 'email'`.

2. **Bốn vai trò:** `bi_thu` (toàn quyền), `pho_bi_thu` (như bí thư trừ quản lý
   thành viên), `chanh_van_phong` (giao việc, điều phối, xem báo cáo — quyền
   duyệt hoàn thành theo `approval_scope`, xem mục 3), `uy_vien`. Mọi người
   **xem** được việc của nhau; chỉ người được giao và cấp trên **sửa** được.

3. **Quản lý công việc:** tạo, giao cho một người chịu trách nhiệm chính (bắt
   buộc, đúng một người) và nhiều người phối hợp, đặt hạn có **cả ngày lẫn giờ**,
   mức ưu tiên (thấp/bình thường/cao/khẩn), gom theo *mảng công việc*
   (campaign). Trạng thái: mới → đang làm → chờ duyệt → hoàn thành, thêm tạm
   dừng và huỷ. Mỗi việc có cột `approval_scope` (`hanh_chinh` | `chuyen_mon`,
   mặc định `chuyen_mon`): việc `hanh_chinh` thì **Chánh văn phòng cũng duyệt
   được**; việc `chuyen_mon` thì **chỉ bí thư/phó bí thư duyệt**.

4. **Nhắc việc tự động qua thông báo điện thoại.** Sáu mốc: lúc được giao, trước
   hạn 1 ngày, trước hạn 2 giờ, đúng hạn, quá hạn 1 ngày, và **quá hạn 3 ngày thì
   báo thêm cho bí thư**.

   **Ràng buộc bắt buộc tuân thủ:**
   - **KHÔNG dùng Vercel Cron cho việc này.** Gói Hobby chỉ cho chạy 1 lần/ngày
     với sai số ±59 phút, không đáp ứng được mốc "đúng hạn". Dùng **`pg_cron` của
     Supabase chạy mỗi 5 phút**, gọi một Edge Function quét việc đến hạn.
   - Kênh: **Web Push (VAPID)** là chính, **email** là dự phòng. Mốc `den_han`,
     `qua_han`, `leo_thang` gửi cả hai kênh.
   - **Chống gửi trùng bằng bảng `notification_log` có ràng buộc
     `unique (task_id, member_id, kind, channel)`**, dùng
     `insert ... on conflict do nothing` trước khi gửi.
   - **Không gửi push từ 22:00 đến 06:00**, dồn sang 6:00 sáng; trừ ưu tiên
     `khẩn`.
   - Toàn bộ thời gian tính theo **`Asia/Ho_Chi_Minh`**, lưu `timestamptz`.
   - **iOS:** web push chỉ chạy khi đã "Thêm vào màn hình chính". Hãy làm một
     **màn hình hướng dẫn cài đặt riêng cho iPhone**, tự nhận diện iOS Safari
     chưa cài và hiện hướng dẫn từng bước kèm hình. Nút xin quyền thông báo phải
     đặt sau một cú bấm của người dùng, không tự bật lúc tải trang.

5. **Bình luận trong từng công việc** + **đính kèm file** qua Supabase Storage.

6. **Chat nhóm** một kênh chung, realtime qua Supabase Realtime.

7. **Lịch tháng** hiển thị hạn công việc và sự kiện.

8. **Bảng "Việc của tôi"** nhóm theo: quá hạn / hôm nay / tuần này / sắp tới.

9. **Sổ văn bản đến**, bảng `incoming_documents` — thay thế file Excel đang
   dùng, 8 cột: đơn vị gửi, nội dung, số/ký hiệu văn bản, ngày nhận, ngày
   chuyển xử lý, người nhận xử lý, thời hạn xử lý, ghi chú. Sau khi nhập, cho
   phép **giao việc từ văn bản**: chọn người từ "người nhận xử lý", mỗi người
   ra một `task` riêng có `source_document_id` trỏ về văn bản và `due_at` lấy
   từ hạn xử lý — **một văn bản có thể sinh nhiều task**, không gộp chung một
   task nhiều chủ. Văn bản chưa xác định được người xử lý (vd ghi "xin ý kiến
   BTV") vẫn lưu bình thường, không ép chọn người, và hiện trong danh sách
   "văn bản chờ phân công" ở Bảng điều phối (mục 10 dưới đây). Có nút xuất lại
   Excel đúng 8 cột gốc.

10. **Bảng điều phối** — màn hình riêng, chỉ Chánh văn phòng (và bí thư/phó bí
    thư) thấy: việc đang trễ, việc đến hạn trong 48 giờ, việc chờ duyệt, tải
    việc theo từng người, ai đang bận, việc chưa đặt hạn, việc chưa có ai phụ
    trách, **văn bản chờ phân công** (mục 9). Có nút xuất Excel ngay trên màn
    hình này.

11. **Đôn đốc thủ công** — nút trên mỗi việc, chỉ bí thư/phó bí thư/chánh văn
    phòng thấy, mở ô nhập lời nhắn rồi gửi push + email ngay cho người phụ
    trách. Không tính vào chống-gửi-trùng của mục 4 (đây là hành vi có chủ
    đích), nhưng giới hạn tối đa 1 lần/việc/người/6 giờ, và ghi công khai trên
    việc đó ai đã đôn đốc lúc nào.

**Yêu cầu chất lượng:**

- Toàn bộ giao diện **tiếng Việt**, chú thích trong mã **tiếng Việt**.
- **Ưu tiên điện thoại** — phần lớn thao tác sẽ diễn ra trên điện thoại.
- Viết **SQL migration đầy đủ** kèm RLS policy, đặt trong `supabase/`.
- Dữ liệu thiếu phải là `null`, **không bao giờ mặc định thành 0 hay chuỗi rỗng**.
- Có **unit test** cho phần tính mốc nhắc việc và phần chống gửi trùng — đây là
  hai chỗ sai âm thầm mà không ai phát hiện cho tới khi lỡ việc.

**Thứ tự thực hiện, làm từng mốc một, xong mốc nào chạy test mốc đó:**

```
M1  Khởi tạo dự án Next.js + Supabase mới, riêng biệt + Migration + RLS +
    đăng nhập Google + allowlist + quản lý thành viên
M2  CRUD công việc + giao việc + trạng thái + duyệt hoàn thành
M3  Bảng "Việc của tôi" + bảng toàn nhóm + lịch tháng
M4  Bình luận + đính kèm file
M5  Web Push: đăng ký thiết bị, VAPID, màn hình hướng dẫn iOS
M6  pg_cron + Edge Function quét hạn + chống gửi trùng + email dự phòng
M7  Chat realtime
M8  Công việc lặp lại + mẫu công việc theo sự kiện
M9  Xuất báo cáo Word/Excel + thống kê số việc theo người + thống kê hoàn
    thành trước hạn/đúng hạn/trễ hạn
M10 Sổ văn bản đến: nhập liệu, giao việc từ văn bản, khung "chờ phân công"
    trong Bảng điều phối, xuất Excel 8 cột gốc
```

**Đừng làm những việc sau nếu tôi chưa yêu cầu:** chấm điểm thi đua tự động,
theo dõi giờ làm việc, đồng bộ hai chiều với Google Calendar, bảng xếp hạng công
khai giữa các thành viên.

---

## PHẦN 7 — Việc anh cần chốt trước khi bắt đầu

1. **Trong 9 người có bao nhiêu người dùng iPhone?** Nếu quá nửa, nên cân nhắc
   thêm **Telegram bot** làm kênh nhắc chính — miễn phí, tức thì, không cần cài
   Home Screen, chạy giống nhau trên mọi máy. Đổi lại cả nhóm phải cài Telegram.

2. **Dự án mới này định deploy trên gói Vercel nào?** Vì tách riêng khỏi web
   cũ nên đây là project Vercel mới, gói của web cũ không tính vào đây. Dùng
   Hobby (miễn phí) thì kiến trúc theo đúng Phần 0 (`pg_cron`); nếu định trả
   phí Pro ngay từ đầu thì cron chạy được mỗi phút, có thể bỏ `pg_cron`.

3. **Có thật sự cần chat chung không**, hay bình luận-trong-việc là đủ? Xem lập
   luận ở mục 5.2.

4. **Ai là Bí thư** — để đặt tài khoản đầu tiên và quyền duyệt hoàn thành.

5. **9 người phân theo mảng nào?** (tổ chức, tuyên giáo, phong trào, kiểm tra…)
   để dựng sẵn mẫu công việc theo mảng.

6. **Chánh văn phòng có nên được duyệt hoàn thành không?** Xem mục "⚠️" ở
   Phần 2 — đề xuất mặc định là duyệt theo `approval_scope` (hành chính thì
   Chánh văn phòng duyệt, chuyên môn/chủ trương thì bí thư/phó bí thư duyệt),
   kèm hai phương án đơn giản hơn nếu thấy rối.

7. **Sổ văn bản đến (mục 5.1d) có đưa vào MVP luôn không, hay để Nhóm A làm
   sau?** Tôi đề xuất đưa vào MVP vì Chánh văn phòng đang dùng file Excel này
   hằng ngày, nhưng đây là việc thêm phạm vi nên anh nên tự chốt.

8. **32 dòng dữ liệu đang có trong file Excel có cần nhập lại vào hệ thống
   mới không?** Nếu có, cần khớp thủ công một lượt tên trong cột "NGƯỜI NHẬN
   XỬ LÝ" (vd "Đ/c Trường", "Đ/c Hòa"…) sang đúng 9 tài khoản — việc này làm
   nhanh nhất bằng tay vì chỉ làm một lần, không đáng viết riêng một công cụ
   tự động khớp tên.

---

## Nguồn đã kiểm chứng

- Giới hạn cron gói Hobby (1 lần/ngày, sai số ±59 phút):
  https://vercel.com/docs/cron-jobs/usage-and-pricing
- Yêu cầu "Thêm vào màn hình chính" của web push trên iOS:
  https://pushpad.xyz/blog/ios-special-requirements-for-web-push-notifications
