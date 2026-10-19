# Original User Request

## Initial Request — 2026-10-17T17:00:56Z

Tạo ra 1 đội agent để phân chia nhau công việc, phân công rõ vai trò, có kiểm thử liên tục và chỉnh sửa liên tục tạo thành 1 vòng lặp hoàn thiện sản phẩm tốt nhất. Xây dựng một công cụ trò chơi tương tác trực tiếp kiểu Kahoot (Live Interactive Training Quiz Game) tích hợp vào website hiện tại để phục vụ chương trình tập huấn "Công tác xây dựng kế hoạch và tổ chức hoạt động Đoàn - Hội", giúp giảng viên gửi link cho học viên cùng tham gia trả lời tuần tự 15 câu hỏi bấm giờ, tìm ra người trả lời đúng và nhanh nhất qua từng câu và vinh danh tổng kết cuối trò chơi.

Working directory: c:\Users\DELL\Desktop\thansxuan-portfolio
Integrity mode: development

Reference material & Verification resources:
- Tài liệu gốc của lớp tập huấn: `D:\DU LIEU DOAN TRUONG\BTV ĐOÀN TRƯỜNG 21` (bao gồm `Bai_Thuyet_Trinh_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE.docx`, `Chuyen_de_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE_V3.pptx` và `Chuyen_de_Ky_nang_Xay_dung_Ke_hoach_va_To_chuc_Hoat_dong_Doan_Hoi_HCMUTE.pptx`).
- Hệ thống kiểm thử có sẵn trong dự án: `npm test` (`vitest run`) và `npm run build` (`next build`).

## Requirements

### R1. Bộ 15 câu hỏi tập huấn chuẩn xác theo 3 cấp độ nhận thức
Trích xuất nội dung từ bộ tài liệu tập huấn tại `D:\DU LIEU DOAN TRUONG\BTV ĐOÀN TRƯỜNG 21` để xây dựng bộ cố định 15 câu hỏi trắc nghiệm chọn lọc sát nhất với bài giảng (mỗi câu có thời gian đếm ngược 15 giây, 4 phương án lựa chọn, 1 đáp án đúng và giải thích ngắn gọn sau khi hết giờ). Bộ 15 câu hỏi phải được phân bổ rõ ràng theo 3 mức độ: Nhận biết — Thông hiểu — Tình huống thực tế Đoàn - Hội.

### R2. Phòng chơi đồng bộ trực tiếp kiểu Kahoot (Host & Player)
Cung cấp chế độ phòng chơi đồng bộ trực tiếp theo thời gian thực: Giảng viên (Host) tạo phòng, nhận đường link tham gia / mã phòng (kèm mã QR hiển thị trên màn chiếu) để gửi cho học viên và chủ động bấm điều khiển chuyển từng câu hỏi tuần tự từ câu 1 đến câu 15. Học viên (Player) mở link trên điện thoại/máy tính, nhập tên (và đơn vị/chi đoàn nếu có) vào phòng chờ và trả lời đồng thời từng câu hỏi ngay khi giảng viên mở câu hỏi đó; hệ thống hoạt động ổn định cho nhiều học viên tham gia cùng lúc mà không yêu cầu học viên phải đăng nhập tài khoản.

### R3. Tính điểm tốc độ chính xác đến mili-giây & Vinh danh từng câu / Cuối trận
Áp dụng công thức tính điểm kết hợp: Điểm chuẩn khi trả lời đúng + Điểm thưởng tốc độ (dựa trên thời gian phản xạ tính tới mili-giây còn lại trong 15 giây) + Điểm thưởng chuỗi trả lời đúng liên tiếp (Streak bonus). Sau mỗi câu hỏi, hiển thị đáp án đúng kèm giải thích, vinh danh học viên trả lời đúng và nhanh nhất của câu đó, và cập nhật bảng xếp hạng tạm thời; sau câu thứ 15, hiển thị màn hình Tổng kết với Bục vinh danh Top 3 chung cuộc, giải thưởng phụ (như giải "Tia chớp" cho người có tốc độ phản xạ trung bình nhanh nhất) và bảng thống kê toàn lớp.

### R4. Tích hợp hoàn chỉnh vào Website hiện tại
Tích hợp công cụ trò chơi vào hệ thống công cụ của website (`c:\Users\DELL\Desktop\thansxuan-portfolio`) với đường dẫn trực tiếp dễ chia sẻ và hiển thị thẻ truy cập trong danh mục công cụ của web, đảm bảo giao diện trực quan, sinh động trên cả màn hình máy chiếu của giảng viên lẫn màn hình điện thoại của học viên, và không làm hỏng bất kỳ tính năng hay bài test hiện có nào của dự án.

## Acceptance Criteria

### Nội dung câu hỏi & Dữ liệu tập huấn
- [ ] Ngân hàng câu hỏi có đúng 15 câu hỏi trắc nghiệm tiếng Việt có dấu chuẩn xác, trích xuất từ nội dung thực tế trong `D:\DU LIEU DOAN TRUONG\BTV ĐOÀN TRƯỜNG 21` (không dùng câu hỏi mẫu/placeholder).
- [ ] Mỗi câu hỏi có đầy đủ: nội dung câu hỏi, phân loại mức độ (`Nhận biết`, `Thông hiểu`, hoặc `Tình huống thực tế`), thời gian cố định `15` giây, 4 đáp án lựa chọn, chỉ số đáp án đúng và phần giải thích ngắn bám sát bài giảng.
- [ ] Có đủ cả 3 mức độ (`Nhận biết`, `Thông hiểu`, `Tình huống thực tế`) trong 15 câu hỏi.

### Luồng phòng chơi trực tiếp (Host & Player Sync)
- [ ] Giảng viên (Host) có thể khởi tạo phòng chơi mới, hiển thị mã phòng / đường link chia sẻ trực tiếp (và QR code) để học viên truy cập ngay bằng 1 cú chạm.
- [ ] Nhiều học viên (kiểm thử tự động mô phỏng tối thiểu 10 người chơi đồng thời) có thể tham gia cùng một phòng, hiển thị danh sách người chơi tại sảnh chờ (Lobby), nhận trạng thái câu hỏi đồng bộ khi Host bấm bắt đầu / chuyển câu tiếp theo, và gửi câu trả lời trong thời gian 15 giây.
- [ ] Hệ thống chặn gửi câu trả lời khi đã hết 15 giây hoặc khi người chơi đã chốt đáp án ở câu hiện tại; nếu tất cả học viên trong phòng đã trả lời xong trước 15 giây, câu hỏi tự động chuyển sang trạng thái công bố kết quả câu đó.

### Logic tính điểm, Xếp hạng từng câu & Tổng kết cuối game
- [ ] Người trả lời sai hoặc hết giờ nhận 0 điểm và bị reset chuỗi Streak về 0; người trả lời đúng nhận điểm chuẩn + điểm thưởng tốc độ (phản xạ càng nhanh điểm càng cao, kiểm chứng bằng unit test với các mốc thời gian khác nhau tính theo ms) + điểm thưởng Streak khi trả lời đúng liên tiếp.
- [ ] Sau mỗi câu hỏi, hệ thống xác định chính xác người trả lời đúng có thời gian phản xạ nhanh nhất ở câu đó và cập nhật bảng xếp hạng tích lũy theo thứ tự tổng điểm giảm dần (nếu bằng điểm thì ưu tiên tổng thời gian phản xạ nhanh hơn).
- [ ] Khi kết thúc câu số 15, màn hình tổng kết hiển thị đầy đủ: Bục vinh danh Top 3 (Hạng 1, 2, 3), danh hiệu phản xạ nhanh nhất ("Tia chớp"), và bảng xếp hạng chi tiết toàn bộ người tham gia (tổng điểm, số câu đúng/15, chuỗi đúng dài nhất, thời gian phản xạ trung bình).

### Chất lượng kỹ thuật & Kiểm thử tự động
- [ ] Có bộ kiểm thử tự động (`vitest`) kiểm chứng toàn bộ: (1) cấu trúc và tính hợp lệ của 15 câu hỏi tập huấn, (2) thuật toán tính điểm tốc độ + streak + xếp hạng, (3) luồng mô phỏng phiên chơi nhiều người từ lúc tạo phòng -> qua đủ 15 câu -> tổng kết cuối game, và (4) render giao diện Host/Player.
- [ ] Lệnh `npm test` (`vitest run`) chạy thành công 100% (tất cả test cũ và test mới đều pass, 0 lỗi).
- [ ] Lệnh `npm run build` (`next build`) và `npm run lint` hoàn tất thành công với mã thoát `0`, không có lỗi TypeScript hay lỗi build Next.js.
