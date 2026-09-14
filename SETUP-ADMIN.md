# Admin Panel — Hướng dẫn cài đặt

Làm đúng 5 bước dưới đây theo thứ tự. Tổng thời gian ~10 phút.

---

## Bước 1 — Cài package mới

Mở terminal trong thư mục `thansxuan-portfolio`:

```bash
npm install
```

Lệnh này cài thêm `@supabase/supabase-js` và `@supabase/ssr` (đã thêm sẵn vào `package.json`).

---

## Bước 2 — Tạo database trong Supabase

1. Vào https://supabase.com/dashboard → chọn project của anh
2. Menu trái → **SQL Editor** → **New query**
3. Mở file `supabase/schema.sql` trong repo, copy **toàn bộ** nội dung, dán vào
4. Bấm **Run**

File này tạo:

| Bảng | Dùng để |
|---|---|
| `projects` | Dự án portfolio (tags, ảnh, màu, thứ tự) |
| `ai_tools` | Danh mục AI tools (icon, status, màu nhãn) |
| `about_page` | Bio, skills, journey, core values |
| `settings` | Email, điện thoại, social links, SEO |
| `media` | Thư viện ảnh |
| `page_views` | Lượt xem để thống kê dashboard |

Kèm theo: **RLS policies** (khách chỉ đọc nội dung đã publish, chỉ tài khoản đăng nhập mới sửa được), storage bucket `media`, và dữ liệu mẫu.

> Chạy lại file này nhiều lần không sao — mọi lệnh đều `if not exists` / `on conflict do nothing`.

---

## Bước 3 — Tạo tài khoản đăng nhập admin

1. Supabase Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**
2. Nhập email + mật khẩu
3. ✅ Bật **Auto Confirm User** (nếu không sẽ phải xác nhận qua email)

Đây chính là tài khoản dùng để vào `/login`.

> Nên tắt đăng ký tự do: **Authentication → Providers → Email → Confirm email**, và
> **Authentication → Settings → Allow new users to sign up = OFF**. Như vậy chỉ có tài khoản
> anh tự tạo mới đăng nhập được.

---

## Bước 4 — Chạy thử ở máy

File `.env.local` đã được tạo sẵn với key của anh. Chạy:

```bash
npm run dev
```

Rồi mở:

- http://localhost:3000 — website
- http://localhost:3000/login — đăng nhập admin
- http://localhost:3000/admin — dashboard

> ⚠️ **Cần kiểm tra:** URL trong `.env.local` đang là
> `https://lkvpeviezgzzfnaxuqpr.supabase.co` — lấy từ mã `ref` bên trong anon key.
> URL anh gửi có 1 ký tự khác (`...ezzzz...` thay vì `...ezgzz...`).
> Nếu đăng nhập báo lỗi kết nối, mở Supabase Dashboard → **Project Settings → API**,
> copy đúng **Project URL** rồi sửa lại dòng `NEXT_PUBLIC_SUPABASE_URL` trong `.env.local`.

---

## Bước 5 — Deploy lên Vercel

### 5.1 — Thêm environment variables

Vercel Dashboard → project → **Settings** → **Environment Variables**.
Thêm 3 biến sau cho cả **Production**, **Preview** và **Development**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lkvpeviezgzzfnaxuqpr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (xem trong `.env.local`) |
| `SUPABASE_SERVICE_ROLE_KEY` | secret key (xem trong `.env.local`) |

> `.env.local` **không** được push lên GitHub (đã nằm trong `.gitignore`) — nên bắt buộc
> phải khai báo thủ công trên Vercel.

### 5.2 — Push code

```bash
git add -A
git commit -m "feat: admin panel + Supabase integration"
git push
```

Vercel sẽ tự build và deploy. Xong thì vào `https://thanx.vercel.app/login`.

---

## Cấu trúc admin panel

```
/login                    Đăng nhập (Supabase Auth)
/admin                    Dashboard — thống kê + biểu đồ 14 ngày
/admin/projects           Danh sách project (tìm kiếm, ẩn/hiện, xoá)
/admin/projects/new       Thêm project
/admin/projects/[id]      Sửa project
/admin/ai-tools           Danh sách AI tools
/admin/ai-tools/new       Thêm tool
/admin/ai-tools/[id]      Sửa tool
/admin/about              Sửa bio, skills, journey, core values
/admin/media              Thư viện ảnh — kéo thả upload, copy URL, xoá
/admin/settings           Email, điện thoại, social links, hero, SEO
```

Mọi đường dẫn `/admin/*` được bảo vệ bằng middleware — chưa đăng nhập sẽ bị đẩy về `/login`.

---

## Website public đọc data từ đâu

| Trang | Nguồn dữ liệu |
|---|---|
| `/` | `settings` (hero, email) + `projects` (dự án featured) + đếm số liệu thật |
| `/projects` | `projects` (chỉ bản `published`, sắp theo `sort_order`) |
| `/ai-tools` | `ai_tools` (chỉ bản `published`) |
| `/about` | `about_page` |
| Navbar / Footer | `settings` (tên brand, email, social links) |

Các trang public dùng ISR với `revalidate = 60` — sau khi sửa trong admin, website cập nhật
trong vòng 1 phút (hoặc ngay lập tức khi deploy lại).

**Nếu Supabase lỗi hoặc chưa cấu hình, website vẫn chạy bình thường** — code có sẵn dữ liệu
dự phòng trong `src/lib/fallback.ts`.

---

## Xử lý sự cố

**Đăng nhập báo "Invalid login credentials"**
→ Tài khoản chưa được tạo, hoặc chưa bật Auto Confirm. Làm lại Bước 3.

**Admin mở ra nhưng bảng trống / báo lỗi đọc dữ liệu**
→ Chưa chạy `supabase/schema.sql`. Làm lại Bước 2.

**Upload ảnh báo "new row violates row-level security policy"**
→ Bucket `media` hoặc storage policies chưa tạo. Chạy lại phần cuối của `schema.sql`.

**Build trên Vercel fail vì "supabaseUrl is required"**
→ Chưa thêm environment variables trên Vercel. Làm lại Bước 5.1, rồi **Redeploy**.

**Sửa trong admin nhưng website chưa đổi**
→ Đợi tối đa 60 giây (ISR), hoặc Vercel → Deployments → **Redeploy**.
