# Kiểm thử

## Lệnh

```powershell
npm.cmd run test        # chạy toàn bộ unit test một lượt
npm.cmd run test:watch  # chạy lại tự động mỗi khi sửa code
npm.cmd run verify      # test + build — chạy cái này trước mỗi lần git push
npm.cmd run test:rls    # kiểm tra bảo mật database thật (cần mạng)
```

Lần đầu phải cài thêm thư viện test:

```powershell
npm.cmd install
```

## Có gì được kiểm

Bộ test dùng **Vitest** + **React Testing Library**, nằm trong thư mục `tests/`.

| File | Kiểm cái gì |
|---|---|
| `slug.test.ts` | Sinh slug từ tiếng Việt: bỏ dấu, đ→d, cắt độ dài, không để gạch ngang thừa |
| `media.test.ts` | Đặt tên file upload an toàn, không trùng; hiển thị dung lượng |
| `types.test.ts` | Preset màu đúng định dạng Tailwind; nhãn trạng thái luôn có màu dự phòng |
| `fallback.test.ts` | Dữ liệu dự phòng đủ cấu trúc để trang public không vỡ |
| `queries.test.ts` | Bốn hàm đọc dữ liệu luôn rơi về fallback khi Supabase lỗi, rỗng, hoặc trả kiểu sai |
| `RichText.test.tsx` | Tách đoạn, in đậm `**...**`, và **không chèn HTML thô** (chống XSS) |
| `TagInput.test.tsx` | Thêm/xoá tag, chặn trùng, tách theo dấu phẩy, Backspace, blur |

`tests/rls-check.mjs` là loại khác: nó gọi thẳng vào Supabase thật bằng anon key —
đúng thứ mà bất kỳ ai mở DevTools cũng lấy được — rồi thử phá:

- đọc projects / ai_tools / about / settings → **phải được**
- chỉ thấy bản đã publish, không thấy bản nháp → **phải đúng**
- thêm / sửa / xoá project, sửa settings → **phải bị chặn**
- ghi lượt xem → được; đọc dữ liệu lượt xem → **phải bị chặn**

Script này ghi đúng 1 dòng vào `page_views` với path `/__rls-check`. Chạy lại nó
sau mỗi lần đổi RLS policy trong Supabase.

## Quy ước

Thư mục `tests/` được loại khỏi `tsconfig.json` nên `next build` không type-check
nó — tránh việc một lỗi kiểu trong test làm hỏng deploy. Đổi lại, test không được
type-check chặt; Vitest chỉ transpile rồi chạy.

Trước mỗi lần `git push`, chạy `npm.cmd run verify`. Nếu có đổi RLS policy thì
chạy thêm `npm.cmd run test:rls`.
