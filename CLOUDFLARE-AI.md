# Bật tính năng sinh ảnh AI

Tool ghép logo có thêm ô **✨ Sinh ảnh nền bằng AI**, dùng Cloudflare Workers AI
với model FLUX.1 schnell.

## Vì sao là Cloudflare chứ không phải Gemini

Google đã **bỏ gói miễn phí cho toàn bộ model sinh ảnh** — trang giá chính thức
ghi "Not available" ở cột Free tier cho Gemini 3.1 Flash Image, Flash Lite Image
và Gemini 3 Pro Image. Chỉ model chữ và âm thanh còn miễn phí.

Cloudflare Workers AI cho **10.000 Neuron mỗi ngày miễn phí**, áp dụng cho cả gói
Free, reset lúc 0h UTC (7h sáng giờ Việt Nam). Không cần thẻ tín dụng.

| Độ chi tiết | Neuron / ảnh | Số ảnh miễn phí mỗi ngày |
|---|---|---|
| 1 bước | 28,8 | ~347 |
| 2 bước | 38,4 | ~260 |
| 4 bước (mặc định) | 57,6 | ~173 |
| 8 bước (tối đa) | 96,0 | ~104 |

Hết hạn mức thì API trả lỗi, tool hiện thông báo, **không tự động tính tiền**.

## Lấy khoá — 3 phút

1. Lập tài khoản miễn phí tại https://dash.cloudflare.com (không cần thẻ)
2. **Account ID**: vào dash, nhìn thanh bên phải hoặc trong URL
   `dash.cloudflare.com/<đây-là-account-id>` — chuỗi 32 ký tự
3. **API Token**: góc phải trên → **My Profile** → **API Tokens** → **Create Token**
   → chọn template **Workers AI** (hoặc Custom token với quyền
   `Account → Workers AI → Read`) → **Continue** → **Create Token**
   → copy ngay, Cloudflare chỉ hiện một lần

## Cắm khoá vào

### Chạy ở máy

Mở `.env.local` bằng Notepad, thêm 2 dòng:

```
CLOUDFLARE_ACCOUNT_ID=dán-account-id-vào-đây
CLOUDFLARE_API_TOKEN=dán-token-vào-đây
```

Lưu, tắt dev server (Ctrl+C) rồi chạy lại `npm.cmd run dev`.

### Chạy trên production

Vercel → project → **Settings** → **Environments** → **Production** → thêm 2 biến
trên. Hai biến này là **bí mật thật**, chọn Type = **Secret** (khác với 2 biến
`NEXT_PUBLIC_SUPABASE_*` vốn phải để Config). Xong thì **Redeploy**.

## Ai dùng được

Chỉ tài khoản **đã đăng nhập admin**. Ô sinh ảnh không hiện với khách vãng lai, và
kể cả có ai gọi thẳng vào `/api/ai/generate-image` thì route cũng trả 401.

Lý do: hạn mức 10.000 Neuron là của riêng tài khoản Cloudflare của anh. Mở cho
người lạ là bị đốt sạch trong vài phút.

## Lưu ý

Ảnh AI sinh ra chỉ làm **ảnh nền**. Logo vẫn được ghép từ file gốc bằng canvas —
đó là toàn bộ lý do tool này tồn tại, và AI không bao giờ được đụng vào logo.

Token Cloudflare không có tiền tố `NEXT_PUBLIC_` nên Next.js không bao giờ đưa nó
vào mã nguồn phía trình duyệt.
