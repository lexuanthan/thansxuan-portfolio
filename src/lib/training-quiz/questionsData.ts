import { QuizQuestion } from './types';

/**
 * Ngân hàng 15 câu hỏi tập huấn trắc nghiệm tương tác trực tiếp
 * Chuyên đề: "Kỹ năng xây dựng kế hoạch và tổ chức hoạt động Đoàn – Hội trong bối cảnh hiện nay"
 * Ban Thường vụ Đoàn trường – Ban Thư ký Hội Sinh viên Trường ĐH Công nghệ Kỹ thuật TP.HCM (HCM-UTE)
 * Báo cáo viên: Đ/c Lê Xuân Thân (Bí thư Đoàn trường)
 *
 * Phân bổ chuẩn 3 cấp độ nhận thức:
 * - 05 câu Nhận biết (Câu 1 - 5)
 * - 05 câu Thông hiểu (Câu 6 - 10)
 * - 05 câu Tình huống thực tế (Câu 11 - 15)
 */
export const TRAINING_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question:
      'Theo chuyên đề tập huấn cán bộ Đoàn – Hội HCM-UTE, phương châm "20 Chữ Vàng" định hướng thiết kế và thẩm định chất lượng hoạt động bao gồm những tiêu chuẩn nào?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'Tự nguyện, xung kích – Tiết kiệm, an toàn – Sáng tạo, đổi mới – Gắn kết, rộng khắp – Kịp thời, bền vững',
      'Hấp dẫn, thiết thực – Hiện đại, ngắn gọn – Linh hoạt, đa dạng – Hiệu quả, tiết kiệm – Bền vững, lan tỏa',
      'Đoàn kết, xung phong – Năng động, tự chủ – Kỷ cương, trách nhiệm – Hội nhập, văn minh – Thiết thực, hiệu quả',
      'Cụ thể, khả thi – Đo lường, kịp thời – Linh hoạt, hiện đại – Tiết kiệm, an toàn – Sâu sắc, nhân văn',
    ],
    correctIndex: 1,
    explanation:
      'Căn cứ Slide 08 & 09 và tài liệu bài giảng, phương châm "20 Chữ Vàng" gồm 5 tiêu chuẩn cốt lõi: (1) Hấp dẫn – Thiết thực, (2) Hiện đại – Ngắn gọn, (3) Linh hoạt – Đa dạng, (4) Hiệu quả – Tiết kiệm, và (5) Bền vững – Lan tỏa. Đây là bộ lọc thẩm định mọi ý tưởng trước khi lập kế hoạch.',
  },
  {
    id: 2,
    question:
      'Theo quy chuẩn thể thức văn bản của Đoàn TNCS Hồ Chí Minh đối với văn bản hành chính do Đoàn trường hoặc Đoàn cơ sở ban hành độc lập, phần tiêu đề góc trên bên phải ghi nội dung gì?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc',
      'ĐOÀN TNCS HỒ CHÍ MINH / BAN CHẤP HÀNH TRƯỜNG ĐH CÔNG NGHỆ KỸ THUẬT TP.HCM',
      'ĐOÀN TNCS HỒ CHÍ MINH (in hoa, đậm, không ghi Quốc hiệu Cộng hòa XHCN Việt Nam)',
      'TUỔI TRẺ VIỆT NAM / TIÊN PHONG - BẢN LĨNH - ĐOÀN KẾT - SÁNG TẠO',
    ],
    correctIndex: 2,
    explanation:
      'Căn cứ Slide 17 và Hướng dẫn thể thức văn bản Đoàn: Văn bản đơn lẻ do Đoàn ban hành độc lập ở góc phải ghi "ĐOÀN TNCS HỒ CHÍ MINH" (không ghi Quốc hiệu nước CHXHCN Việt Nam; Quốc hiệu chỉ sử dụng khi ban hành Kế hoạch Liên tịch với cơ quan chính quyền/Nhà trường).',
  },
  {
    id: 3,
    question:
      'Trong giai đoạn chuẩn bị trước sự kiện (Pre-event), Ban Tổ chức bắt buộc phải hoàn thiện "Bộ 03 Kịch bản" bao gồm những loại kịch bản nào?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'Kịch bản Truyền thông, Kịch bản Khảo sát ý kiến và Kịch bản Họp báo',
      'Kịch bản Tổng thể (Master Agenda), Kịch bản Lời dẫn MC (MC Script) và Kịch bản Kỹ thuật (Technical Cue Sheet)',
      'Kịch bản Đón tiếp VIP, Kịch bản Trò chơi Minigame và Kịch bản Báo cáo quyết toán',
      'Kịch bản Sân khấu hóa, Kịch bản Phân cảnh TikTok và Kịch bản Chấm thi giám khảo',
    ],
    correctIndex: 1,
    explanation:
      'Căn cứ Slide 21 và tài liệu bài giảng: Bộ 03 kịch bản bắt buộc trước giờ G gồm: (1) Kịch bản Tổng thể (Master Agenda/Timeline), (2) Kịch bản Lời dẫn MC (MC Script), và (3) Kịch bản Kỹ thuật (Technical Cue Sheet) để đồng bộ từng giây phút giữa Sân khấu – Âm thanh – Ánh sáng – Màn hình LED – Lễ tân.',
  },
  {
    id: 4,
    question:
      'Theo Quy tắc vàng "T+7" khép kín quy trình sau sự kiện tại HCM-UTE, mốc thời gian T+5 quy định thực hiện đầu việc nào?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'Đăng bài viết Recap truyền thông và gửi Thư cảm ơn đến Nhà tài trợ, Diễn giả',
      'Tổ chức cuộc họp rút kinh nghiệm Ban Tổ chức (After Action Review - AAR)',
      'Rà soát, chuẩn hóa danh sách MSSV tham dự và cập nhật lên hệ thống để ghi nhận Điểm rèn luyện / CTXH',
      'Nộp toàn bộ hồ sơ thanh quyết toán và hóa đơn điện tử về Phòng Kế hoạch - Tài chính',
    ],
    correctIndex: 2,
    explanation:
      'Căn cứ Slide 28: Quy tắc T+7 phân định: T+1 gửi Thư cảm ơn & đăng bài Recap trong 24h; T+3 họp rút kinh nghiệm BTC (AAR); T+5 chuẩn hóa danh sách MSSV cập nhật lên youth.hcmute.edu.vn để bảo đảm quyền lợi ĐRL/CTXH cho sinh viên; T+7 hoàn tất hồ sơ quyết toán kinh phí.',
  },
  {
    id: 5,
    question:
      'Trong hệ sinh thái chuyển đổi số của Đoàn – Hội HCM-UTE, nền tảng nào đóng vai trò tiếp nhận minh chứng và đánh giá xếp loại thi đua định kỳ của các cơ sở trực thuộc?',
    level: 'Nhận biết',
    timeLimit: 15,
    options: [
      'youth.hcmute.edu.vn',
      'thiduatuoitre.hcmute.edu.vn',
      'nhatro.hcmute.edu.vn',
      'UTEOffice (qlvb.hcmute.edu.vn)',
    ],
    correctIndex: 1,
    explanation:
      'Căn cứ Slide 30 và tài liệu bài giảng: Ba nền tảng số cốt lõi gồm: UTEOffice (trình ký số văn bản hành chính Nhà trường), youth.hcmute.edu.vn (quản lý hồ sơ đoàn viên, đăng ký sự kiện, điểm danh QR, điểm rèn luyện), và thiduatuoitre.hcmute.edu.vn (số hóa nộp minh chứng và chấm điểm thi đua cơ sở).',
  },
  {
    id: 6,
    question:
      'Khi xây dựng kế hoạch hoạt động Đoàn – Hội, yếu tố "2C" và "5M" bổ sung cho ma trận "5W1H" nhằm mục đích trọng tâm nào?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'Tăng số lượng trang văn bản để thuyết phục các đơn vị tài trợ doanh nghiệp',
      'Thiết lập cơ chế kiểm soát tiến độ, tiêu chí nghiệm thu (2C) và bảo đảm cân đối đầy đủ 5 nguồn lực thực thi (5M)',
      'Phân chia quyền hạn giữa Đoàn Thanh niên và Hội Sinh viên trong các hoạt động liên tịch',
      'Giúp chuyển đổi toàn bộ nội dung kế hoạch thành mã lệnh tự động hóa trên hệ thống máy chủ',
    ],
    correctIndex: 1,
    explanation:
      'Căn cứ Slide 14: 5W1H định hình khung nội dung (Làm gì, Ở đâu, Khi nào...), còn 2C (Control - Kiểm soát tiến độ & Check - Nghiệm thu/Bảng kiểm) và 5M (Man, Money, Material, Machine/Method, Minute) bảo đảm cơ chế giám sát chất lượng và cân đối đầy đủ 5 nguồn lực cốt lõi để kế hoạch không bị vỡ trận khi thực thi.',
  },
  {
    id: 7,
    question:
      'Tại sao cán bộ Đoàn – Hội HCM-UTE cần đặc biệt lưu ý sự khác biệt giữa "Năm học" và "Năm tài chính" khi lập dự trù kinh phí cho các hoạt động trong Học kỳ I?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'Vì sinh viên chỉ đóng Đoàn phí vào Học kỳ II nên Học kỳ I không được phép chi tiêu ngân sách',
      'Vì năm tài chính Nhà trường tính theo năm Dương lịch (khóa sổ vào tháng 12), đòi hỏi các hoạt động HK1 phải hoàn tất dự trù và thanh quyết toán trước mốc này',
      'Vì mọi hoạt động trong Học kỳ I bắt buộc phải sử dụng 100% nguồn tài trợ xã hội hóa từ doanh nghiệp',
      'Vì Phòng Kế hoạch - Tài chính chỉ tiếp nhận hồ sơ thanh toán duy nhất 1 lần vào cuối năm học (tháng 8)',
    ],
    correctIndex: 1,
    explanation:
      'Căn cứ Slide 12: Năm học kéo dài từ tháng 9 đến tháng 8 năm sau, nhưng năm tài chính của Nhà trường tính theo năm Dương lịch (tháng 1 đến tháng 12). Vào khoảng giữa/cuối tháng 12, Nhà trường khóa sổ quyết toán năm tài chính, nên các hoạt động HK1 (đặc biệt tháng 11, 12 và chuẩn bị Xuân Tình Nguyện) phải khẩn trương hoàn thành hồ sơ giải ngân trước khi hệ thống khóa sổ.',
  },
  {
    id: 8,
    question:
      'Trong thời gian diễn ra một sự kiện lớn tại Hội trường, tại sao Trưởng Ban Tổ chức (hoặc Tổng Đạo diễn / Stage Manager) không nên trực tiếp tham gia chạy các việc sự vụ (như bê nước, chỉnh slide, đón khách)?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'Vì quy định lễ tân không cho phép Trưởng Ban Tổ chức xuất hiện trước mặt khách mời',
      'Để tập trung giữ vị trí bao quát toàn cảnh, giữ liên lạc bộ đàm/mạng nội bộ điều phối nhịp nhàng 4 Tổ tác chiến và xử lý kịp thời các tình huống phát sinh',
      'Vì Trưởng Ban Tổ chức chỉ chịu trách nhiệm ở khâu viết kế hoạch, khâu thực hiện thuộc về các Phó Bí thư Đoàn',
      'Để dành toàn bộ thời gian chụp ảnh kỷ niệm và đăng bài trực tiếp lên các kênh mạng xã hội cá nhân',
    ],
    correctIndex: 1,
    explanation:
      'Căn cứ Slide 23: Nguyên tắc điều phối hiện trường là "Một người chỉ huy – Bốn mũi giáp công". Trưởng BTC đóng vai trò Tổng Đạo diễn bao quát toàn bộ sự kiện, liên lạc chỉ đạo 4 Tổ trưởng (Lễ tân, Sân khấu, Media, Hậu cần/An ninh). Nếu sa đà vào chạy việc vặt, người chỉ huy sẽ mất góc nhìn tổng quan và không thể xử lý khi xảy ra sự cố đột xuất.',
  },
  {
    id: 9,
    question:
      'Khoản chi nào sau đây từ nguồn kinh phí hỗ trợ của Nhà trường/Đoàn trường bị coi là KHÔNG HỢP LỆ khi nộp hồ sơ quyết toán tài chính?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'Hóa đơn điện tử VAT mua văn phòng phẩm có đầy đủ thông tin pháp nhân và Mã số thuế của Trường ĐH Công nghệ Kỹ thuật TP.HCM',
      'Phiếu chi tiền thưởng có danh sách ký nhận đầy đủ Họ tên, MSSV, tên giải thưởng và chữ ký sống của sinh viên đạt giải',
      'Hóa đơn bán lẻ viết tay mua vật tư trang trí tại cửa hàng tạp hóa kèm theo chữ ký của người đi mua hàng',
      'Hợp đồng kinh tế và Biên bản nghiệm thu thanh lý dịch vụ thuê âm thanh ánh sáng kèm hóa đơn điện tử',
    ],
    correctIndex: 2,
    explanation:
      'Căn cứ Slide 19: Quy chế chi tiêu nội bộ quy định mọi khoản mua sắm hàng hóa, dịch vụ thanh toán từ ngân sách phải có Hóa đơn điện tử GTGT (VAT) xuất đúng tên pháp nhân và MST của Trường ĐH Công nghệ Kỹ thuật TP.HCM kèm biên bản nghiệm thu. Hóa đơn bán lẻ viết tay không có giá trị pháp lý để Phòng Kế hoạch - Tài chính giải ngân quyết toán.',
  },
  {
    id: 10,
    question:
      'Nguyên tắc cốt lõi "70/30" khi cán bộ Đoàn – Hội ứng dụng Trí tuệ nhân tạo tạo sinh (GenAI) vào công tác xây dựng kế hoạch và truyền thông là gì?',
    level: 'Thông hiểu',
    timeLimit: 15,
    options: [
      'AI thực hiện 70% nội dung chương trình thực tế trên sân khấu, cán bộ Đoàn chỉ điều hành 30% còn lại',
      'Dành 70% kinh phí tổ chức cho công nghệ AI và 30% kinh phí cho các hoạt động truyền thống',
      'Tận dụng AI tạo sinh để tăng tốc 70% khối lượng soạn thảo bản nháp sơ bộ, nhưng cán bộ Đoàn phải dành 30% công sức kiểm duyệt chính xác về thể thức, chính trị và số liệu thực tế',
      'Đăng tải 70% bài viết do AI viết lên Fanpage và 30% bài viết tự viết lên website Đoàn trường',
    ],
    correctIndex: 2,
    explanation:
      'Căn cứ Slide 32, 33: Nguyên tắc thực chiến là AI hỗ trợ 70% tốc độ tham mưu và khởi tạo bản nháp (brainstorm, dàn ý, khung kịch bản), nhưng cán bộ Đoàn phải trực tiếp kiểm duyệt 30% quan trọng nhất bao gồm tính chuẩn xác chính trị, thể thức văn bản, định mức nội bộ HCM-UTE và tuyệt đối bảo mật dữ liệu sinh viên.',
  },
  {
    id: 11,
    question:
      'Đoàn Khoa dự kiến tổ chức Hội thi Học thuật vào ngày Thứ Bảy (ngày 25 của tháng). Theo quy chuẩn quy trình 5 bước tại HCM-UTE, đồng chí Bí thư Đoàn Khoa cần hoàn tất việc trình ký số Kế hoạch và Dự trù kinh phí trên hệ thống UTEOffice Nhà trường muộn nhất vào thời điểm nào?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Chiều Thứ Sáu (ngày 24) – trước sự kiện 01 ngày để tránh thay đổi nhân sự',
      'Ngày 20 của tháng (mốc T-5) – ngay sau khi đăng bài truyền thông trên mạng xã hội',
      'Ngày 11 đến ngày 13 của tháng (mốc T-12 đến T-14) – trước ngày diễn ra sự kiện tối thiểu 2 tuần',
      'Ngay trong ngày diễn ra sự kiện (ngày 25) để trình Ban Giám hiệu ký trực tiếp tại Hội trường',
    ],
    correctIndex: 2,
    explanation:
      'Căn cứ Slide 18, 34: Quy trình chuẩn quy định mốc T-14 nộp hồ sơ thẩm định và T-12 khởi tạo trình ký số trên UTEOffice Nhà trường (hoàn tất ký số trước sự kiện tối thiểu 2 tuần) để kịp chuyển văn bản đã ký số ở mốc T-10 cho Phòng Quản trị CSVC mở hội trường, máy lạnh, LED và Tổ Bảo vệ bố trí an ninh. Việc nộp sát ngày sẽ bị từ chối phê duyệt.',
  },
  {
    id: 12,
    question:
      'Đang trong chương trình Talkshow có 400 sinh viên tại Hội trường lớn Khu A, mạng Wi-Fi hội trường đột ngột bị mất kết nối khiến slide thuyết trình lưu trên Canva online không thể tải được. Ban Tổ chức cần áp dụng ngay phương án dự phòng (Plan B) chuẩn mực nào?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Tuyên bố tạm dừng chương trình 30 phút để chờ bộ phận mạng khôi phục đường truyền',
      'Yêu cầu toàn bộ sinh viên trong hội trường tắt 4G trên điện thoại để nhường băng thông cho máy tính ban tổ chức',
      'MC chủ động giao lưu/kéo giãn thời gian trong khi kỹ thuật chuyển sang file trình chiếu đã tải offline sẵn trên máy tính thứ 2 (hoặc USB dự phòng)',
      'Hủy bỏ phần trình chiếu slide và yêu cầu diễn giả chỉ phát biểu chay không cần hình ảnh',
    ],
    correctIndex: 2,
    explanation:
      'Căn cứ Slide 26: Nguyên tắc an toàn kỹ thuật là không bao giờ chạy sự kiện bằng cách mở file online (Canva, Drive, YouTube); toàn bộ slide/video phải được tải sẵn offline trên ít nhất 02 máy tính độc lập kèm USB dự phòng. Khi gặp sự cố mạng, kỹ thuật chuyển ngay sang file offline trên máy dự phòng, đồng thời MC điều phối giao lưu khéo léo để chương trình không bị gián đoạn.',
  },
  {
    id: 13,
    question:
      'Trong quá trình thiết kế Backdrop sân khấu và Poster truyền thông cho Ngày hội Thanh niên, một Cộng tác viên Ban Truyền thông sử dụng đồ họa vector bản đồ Việt Nam tải từ website thiết kế nước ngoài. Trước khi xuất bản in ấn và trình chiếu trên màn hình LED, Trưởng Ban Tổ chức phát hiện bản đồ thiếu quần đảo Hoàng Sa và Trường Sa. Cách xử lý ĐÚNG ĐẮN VÀ CHUẨN MỰC NHẤT là gì?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Vẫn cho in ấn và trình chiếu bình thường vì đây chỉ là hình ảnh minh họa cách điệu nghệ thuật',
      'Đình chỉ phát hành ngay lập tức, yêu cầu thay thế bằng bản đồ chuẩn có đầy đủ chủ quyền Hoàng Sa, Trường Sa và thực hiện quy trình kiểm duyệt 2 lớp trước khi in/chiếu',
      'Chờ đến sau sự kiện mới họp rút kinh nghiệm và nhắc nhở riêng bạn cộng tác viên thiết kế',
      'Dùng bút màu vẽ thêm hai quần đảo trực tiếp lên bạt in sau khi đã thi công xong trên sân khấu',
    ],
    correctIndex: 1,
    explanation:
      'Căn cứ Slide 27: Vấn đề chủ quyền quốc gia (Hoàng Sa - Trường Sa), tên trường mới và biểu trưng Đoàn - Hội là nguyên tắc chính trị bất di bất dịch. Mọi ấn phẩm sai sót chủ quyền biển đảo đều vi phạm nghiêm trọng và phải bị đình chỉ ngay lập tức, sửa chữa chuẩn xác và bắt buộc tuân thủ quy trình kiểm duyệt 2 lớp (Trưởng ban Truyền thông rà soát kỹ thuật -> Thường trực BTC duyệt nội dung) trước khi xuất bản.',
  },
  {
    id: 14,
    question:
      'Khi tổ chức buổi Tọa đàm định hướng nghề nghiệp, sau khi Diễn giả kết thúc phần chia sẻ, MC mở phần "Hỏi đáp cùng Diễn giả" nhưng dưới hội trường sinh viên e ngại và chưa có ai giơ tay đặt câu hỏi. Ban Tổ chức nên triển khai giải pháp nào đã được chuẩn bị trước trong kịch bản?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Tuyên bố kết thúc sớm chương trình vì sinh viên không có nhu cầu hỏi thêm',
      'Điểm danh ngẫu nhiên mã số sinh viên theo danh sách lớp để chỉ định đứng lên đặt câu hỏi bắt buộc',
      'Kích hoạt 5–7 "câu hỏi mồi" (Seed questions) đã chuẩn bị trước cho các cán bộ nòng cốt ngồi dưới hội trường đặt câu hỏi, kết hợp mở mã QR Slido/Padlet trên màn hình LED để SV gửi câu hỏi ẩn danh',
      'Yêu cầu Diễn giả tự đặt câu hỏi và tự trả lời để lấp đầy thời lượng còn lại của chương trình',
    ],
    correctIndex: 2,
    explanation:
      'Căn cứ Slide 24 và tài liệu bài giảng: Để giải quyết tình trạng "chết sân khấu" ở phần Q&A, Ban Nội dung luôn chuẩn bị sẵn 5–7 câu hỏi mồi (Seed questions) giao trước cho cán bộ Đoàn nòng cốt ngồi rải rác dưới hội trường phát biểu mào đầu, đồng thời hiển thị mã QR trên màn hình LED để các bạn sinh viên rụt rè có thể gửi câu hỏi ẩn danh qua điện thoại một cách thoải mái.',
  },
  {
    id: 15,
    question:
      'Sau khi Ngày hội kết thúc được 04 ngày (mốc T+4), một số sinh viên phản ánh đã tham gia sự kiện và quét mã QR check-in nhưng chưa thấy tên trong danh sách ghi nhận Điểm rèn luyện. Đồng chí phụ trách mảng dữ liệu Đoàn – Hội cần thực hiện thao tác nào để xử lý thỏa đáng trước hạn T+5?',
    level: 'Tình huống thực tế',
    timeLimit: 15,
    options: [
      'Từ chối giải quyết vì cho rằng sinh viên đã tự ý rời sự kiện sớm hoặc làm mất dữ liệu cá nhân',
      'Đối soát dữ liệu điểm danh trên cổng youth.hcmute.edu.vn (thời gian quét, mã vạch, camera/ảnh check-in), lọc trùng và bổ sung chuẩn xác danh sách MSSV trước khi chốt cổng ở ngày T+5',
      'Đợi đến cuối học kỳ khi Nhà trường xét điểm rèn luyện toàn diện mới tổng hợp và giải quyết khiếu nại một lần',
      'Cộng điểm rèn luyện tự do cho tất cả các sinh viên nhắn tin khiếu nại mà không cần kiểm tra lại lịch sử điểm danh',
    ],
    correctIndex: 1,
    explanation:
      'Căn cứ Slide 28, 30: Mốc T+5 là thời hạn chuẩn hóa và cập nhật chính thức dữ liệu tham gia lên cổng youth.hcmute.edu.vn. Khi có phản hồi, cán bộ phụ trách phải đối soát nhật ký quét mã/check-in trên hệ thống để bảo đảm quyền lợi chính đáng cho sinh viên, giải quyết dứt điểm trước khi chốt danh sách nộp về Trường ở mốc T+7.',
  },
];
