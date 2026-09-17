'use client';

import React, { useState, useMemo } from 'react';
import rawUniversities from '../../data/universities.json';

// Kiểu dữ liệu trường đại học
interface UniversityItem {
  id: string;
  code: string;
  name: string;
  city: string;
  region: string;
  cutoff: number;
  type: string;
  highlight?: string;
  majors?: { major_name: string; cutoff_score: number }[];
}

const universitiesData = (rawUniversities as unknown) as UniversityItem[];

// ==========================================
// 1. DỮ LIỆU CÂU HỎI (28 CÂU TINH GỌN)
// ==========================================
interface Question {
  id: string;
  category: 'RIASEC' | 'MI';
  dimension: string;
  dimensionName: string;
  icon: string;
  color: string;
  content: string;
}

const QUESTIONS: Question[] = [
  // 12 CÂU RIASEC
  { id: 'R1', category: 'RIASEC', dimension: 'R', dimensionName: 'Kỹ thuật - Thực tế', icon: '🛠️', color: 'from-amber-500 to-orange-500', content: 'Tôi thích làm việc trực tiếp với máy móc, thiết bị kỹ thuật, công cụ cơ điện hoặc sản phẩm vật lý.' },
  { id: 'R2', category: 'RIASEC', dimension: 'R', dimensionName: 'Kỹ thuật - Thực tế', icon: '🛠️', color: 'from-amber-500 to-orange-500', content: 'Tôi thích các hoạt động thực hành chế tạo, lắp ráp, sửa chữa hoặc vận động ngoài trời hơn là chỉ ngồi bàn giấy.' },
  
  { id: 'I1', category: 'RIASEC', dimension: 'I', dimensionName: 'Nghiên cứu - Phân tích', icon: '🔬', color: 'from-indigo-500 to-purple-600', content: 'Tôi thích tìm tòi nguyên lý hoạt động của sự vật, đào sâu bản chất vấn đề và giải quyết các bài toán logic hóc búa.' },
  { id: 'I2', category: 'RIASEC', dimension: 'I', dimensionName: 'Nghiên cứu - Phân tích', icon: '🔬', color: 'from-indigo-500 to-purple-600', content: 'Tôi thích phân tích số liệu, tự học độc lập và nghiên cứu các tài liệu học thuật hoặc công nghệ mới.' },
  
  { id: 'A1', category: 'RIASEC', dimension: 'A', dimensionName: 'Nghệ thuật - Sáng tạo', icon: '🎨', color: 'from-pink-500 to-rose-500', content: 'Tôi thích sáng tạo cái mới, thể hiện ý tưởng qua hình ảnh, âm nhạc, thiết kế, ngôn từ hoặc nghệ thuật biểu đạt.' },
  { id: 'A2', category: 'RIASEC', dimension: 'A', dimensionName: 'Nghệ thuật - Sáng tạo', icon: '🎨', color: 'from-pink-500 to-rose-500', content: 'Tôi phát huy tốt nhất trong môi trường tự do, đề cao thẩm mỹ và phong cách cá nhân, không gò bó khuôn mẫu.' },
  
  { id: 'S1', category: 'RIASEC', dimension: 'S', dimensionName: 'Xã hội - Giáo dục', icon: '🤝', color: 'from-emerald-500 to-teal-600', content: 'Tôi thích lắng nghe, trò chuyện, tư vấn và giúp đỡ người khác giải quyết các khó khăn tâm lý, học tập.' },
  { id: 'S2', category: 'RIASEC', dimension: 'S', dimensionName: 'Xã hội - Giáo dục', icon: '🤝', color: 'from-emerald-500 to-teal-600', content: 'Tôi cảm thấy tràn đầy năng lượng khi được giảng giải, chia sẻ kiến thức và kết nối mọi người trong cộng đồng.' },
  
  { id: 'E1', category: 'RIASEC', dimension: 'E', dimensionName: 'Quản lý - Lãnh đạo', icon: '🚀', color: 'from-blue-600 to-cyan-500', content: 'Tôi tự tin khi đứng ra thuyết phục, đàm phán để người khác đồng thuận với kế hoạch hoặc quan điểm của mình.' },
  { id: 'E2', category: 'RIASEC', dimension: 'E', dimensionName: 'Quản lý - Lãnh đạo', icon: '🚀', color: 'from-blue-600 to-cyan-500', content: 'Tôi có tham vọng kinh doanh, thích dẫn dắt tập thể, phân công công việc và chịu trách nhiệm về kết quả chung.' },
  
  { id: 'C1', category: 'RIASEC', dimension: 'C', dimensionName: 'Quy chuẩn - Chi tiết', icon: '📊', color: 'from-violet-600 to-indigo-700', content: 'Tôi làm việc cẩn thận, tỉ mỉ, thích công việc có lịch trình, kế hoạch và các nguyên tắc quy chuẩn rõ ràng.' },
  { id: 'C2', category: 'RIASEC', dimension: 'C', dimensionName: 'Quy chuẩn - Chi tiết', icon: '📊', color: 'from-violet-600 to-indigo-700', content: 'Tôi thích sắp xếp mọi thứ ngăn nắp, theo dõi chi tiêu và rà soát các bảng tính, văn bản số liệu chính xác.' },

  // 16 CÂU ĐA TRÍ TUỆ
  { id: 'MI_LOGIC_1', category: 'MI', dimension: 'LOGIC', dimensionName: 'Logic - Toán học', icon: '🧮', color: 'from-blue-500 to-indigo-600', content: 'Tôi tiếp thu các công thức toán, thuật toán và phân tích suy luận nhân quả rất nhanh.' },
  { id: 'MI_LOGIC_2', category: 'MI', dimension: 'LOGIC', dimensionName: 'Logic - Toán học', icon: '🧮', color: 'from-blue-500 to-indigo-600', content: 'Tôi thường đưa ra quyết định dựa trên số liệu và bằng chứng khách quan thay vì cảm tính.' },
  
  { id: 'MI_LING_1', category: 'MI', dimension: 'LING', dimensionName: 'Trí tuệ Ngôn ngữ', icon: '✍️', color: 'from-violet-500 to-purple-500', content: 'Tôi có khả năng diễn đạt lưu loát, dùng từ ngữ chính xác, phong phú khi nói hoặc viết.' },
  { id: 'MI_LING_2', category: 'MI', dimension: 'LING', dimensionName: 'Trí tuệ Ngôn ngữ', icon: '✍️', color: 'from-violet-500 to-purple-500', content: 'Tôi học ngoại ngữ tốt và ghi nhớ các khái niệm, thuật ngữ chuyên ngành khá dễ dàng.' },
  
  { id: 'MI_SPAT_1', category: 'MI', dimension: 'SPAT', dimensionName: 'Không gian - Thị giác', icon: '📐', color: 'from-cyan-500 to-teal-500', content: 'Tôi có khả năng hình dung tốt không gian 3D, phối màu và đọc sơ đồ, bản đồ trong đầu.' },
  { id: 'MI_SPAT_2', category: 'MI', dimension: 'SPAT', dimensionName: 'Không gian - Thị giác', icon: '📐', color: 'from-cyan-500 to-teal-500', content: 'Tôi tiếp thu kiến thức hiệu quả nhất qua hình ảnh minh họa, biểu đồ, infographic hoặc video.' },
  
  { id: 'MI_INTER_1', category: 'MI', dimension: 'INTER', dimensionName: 'Giao tiếp xã hội', icon: '🗣️', color: 'from-emerald-500 to-green-600', content: 'Tôi dễ dàng nhận biết cảm xúc, thái độ và nhu cầu của người đối diện khi giao tiếp.' },
  { id: 'MI_INTER_2', category: 'MI', dimension: 'INTER', dimensionName: 'Giao tiếp xã hội', icon: '🗣️', color: 'from-emerald-500 to-green-600', content: 'Tôi hòa nhập rất nhanh vào tập thể mới và có khả năng làm dịu những bất đồng xung đột.' },
  
  { id: 'MI_INTRA_1', category: 'MI', dimension: 'INTRA', dimensionName: 'Trí tuệ Nội tâm', icon: '🧘', color: 'from-teal-600 to-cyan-700', content: 'Tôi nhận thức rất rõ điểm mạnh, điểm yếu và mục tiêu phát triển của bản thân.' },
  { id: 'MI_INTRA_2', category: 'MI', dimension: 'INTRA', dimensionName: 'Trí tuệ Nội tâm', icon: '🧘', color: 'from-teal-600 to-cyan-700', content: 'Tôi có tính tự giác và ý chí độc lập cao, luôn suy ngẫm sâu sắc về ý nghĩa việc mình làm.' },
  
  { id: 'MI_BODI_1', category: 'MI', dimension: 'BODI', dimensionName: 'Vận động thể chất', icon: '🏃', color: 'from-amber-500 to-yellow-600', content: 'Tôi khéo tay khi thao tác với đồ vật hoặc có phản xạ thể chất và vận động tốt.' },
  { id: 'MI_BODI_2', category: 'MI', dimension: 'BODI', dimensionName: 'Vận động thể chất', icon: '🏃', color: 'from-amber-500 to-yellow-600', content: 'Tôi thích học tập thông qua thực hành thao tác thực tế thay vì chỉ ngồi nghe giảng lý thuyết.' },
  
  { id: 'MI_MUSI_1', category: 'MI', dimension: 'MUSI', dimensionName: 'Trí tuệ Âm nhạc', icon: '🎵', color: 'from-rose-500 to-pink-600', content: 'Tôi nhạy bén với tiết tấu, cao độ và có thể nhận ra giai điệu, nhịp phách rất chuẩn xác.' },
  { id: 'MI_MUSI_2', category: 'MI', dimension: 'MUSI', dimensionName: 'Trí tuệ Âm nhạc', icon: '🎵', color: 'from-rose-500 to-pink-600', content: 'Âm nhạc có tác động mạnh mẽ đến cảm xúc và giúp tôi giải tỏa căng thẳng hoặc tập trung.' },
  
  { id: 'MI_NATU_1', category: 'MI', dimension: 'NATU', dimensionName: 'Khám phá Tự nhiên', icon: '🌿', color: 'from-green-600 to-emerald-700', content: 'Tôi yêu thích việc tìm hiểu về môi trường sinh thái, cây cỏ, động vật hoặc khí hậu thời tiết.' },
  { id: 'MI_NATU_2', category: 'MI', dimension: 'NATU', dimensionName: 'Khám phá Tự nhiên', icon: '🌿', color: 'from-green-600 to-emerald-700', content: 'Tôi cảm thấy thoải mái và thích thú với các hoạt động dã ngoại, hòa mình vào thiên nhiên.' }
];

const LIKERT_OPTIONS = [
  { val: 1, label: 'Rất không giống', emoji: '⛔', color: 'border-red-200 hover:bg-red-50 text-red-700', active: 'bg-red-500 text-white border-red-500' },
  { val: 2, label: 'Không giống', emoji: '🙁', color: 'border-orange-200 hover:bg-orange-50 text-orange-700', active: 'bg-orange-500 text-white border-orange-500' },
  { val: 3, label: 'Bình thường', emoji: '😐', color: 'border-yellow-200 hover:bg-yellow-50 text-yellow-700', active: 'bg-yellow-500 text-white border-yellow-500' },
  { val: 4, label: 'Giống tôi', emoji: '🙂', color: 'border-blue-200 hover:bg-blue-50 text-blue-700', active: 'bg-blue-500 text-white border-blue-500' },
  { val: 5, label: 'Rất giống tôi', emoji: '🌟', color: 'border-emerald-200 hover:bg-emerald-50 text-emerald-700', active: 'bg-emerald-500 text-white border-emerald-500' }
];

// ==========================================
// 2. MA TRẬN NGHỀ NGHIỆP
// ==========================================
interface MajorRule {
  code: string;
  name: string;
  field: string;
  fieldColor: string;
  riasecCodes: string[];
  miCodes: string[];
  description: string;
  pros: string[];
  searchKeywords: string[]; // Dùng để tìm kiếm trường đào tạo
}

const MAJORS_DATABASE: MajorRule[] = [
  { code: '7480108', name: 'Khoa học dữ liệu & Trí tuệ nhân tạo (AI)', field: 'Máy tính & CNTT', fieldColor: 'from-purple-500 to-indigo-600', riasecCodes: ['I', 'C'], miCodes: ['LOGIC', 'INTRA'], description: 'Phân tích dữ liệu lớn, xây dựng mô hình máy học và thuật toán AI thông minh.', pros: ['Tư duy toán học', 'Phân tích hệ thống', 'Tự học chuyên sâu'], searchKeywords: ['dữ liệu', 'trí tuệ nhân tạo', 'khoa học dữ liệu', 'ai', 'công nghệ thông tin'] },
  { code: '7480103', name: 'Kỹ thuật phần mềm', field: 'Máy tính & CNTT', fieldColor: 'from-purple-500 to-indigo-600', riasecCodes: ['I', 'R'], miCodes: ['LOGIC', 'SPAT'], description: 'Thiết kế kiến trúc hệ thống phần mềm, lập trình web/app và bảo mật.', pros: ['Tư duy thuật toán', 'Cấu trúc không gian', 'Giải quyết sự cố'], searchKeywords: ['phần mềm', 'software', 'công nghệ thông tin'] },
  { code: '7480201', name: 'Công nghệ thông tin', field: 'Máy tính & CNTT', fieldColor: 'from-purple-500 to-indigo-600', riasecCodes: ['I', 'R'], miCodes: ['LOGIC', 'INTRA'], description: 'Quản trị hạ tầng mạng, tích hợp giải pháp phần cứng và dịch vụ đám mây.', pros: ['Thao tác kỹ thuật', 'Logic nhân quả', 'Bảo trì hệ thống'], searchKeywords: ['công nghệ thông tin', 'tin học', 'cntt'] },
  { code: '7340101', name: 'Quản trị kinh doanh & Khởi nghiệp', field: 'Kinh doanh & Quản trị', fieldColor: 'from-blue-500 to-cyan-600', riasecCodes: ['E', 'S'], miCodes: ['INTER', 'LOGIC'], description: 'Hoạch định chiến lược kinh doanh, quản trị dự án và vận hành tổ chức.', pros: ['Kỹ năng lãnh đạo', 'Giao tiếp đàm phán', 'Tư duy chiến lược'], searchKeywords: ['quản trị kinh doanh', 'kinh doanh', 'kinh tế'] },
  { code: '7340115', name: 'Marketing & Truyền thông số', field: 'Kinh doanh & Quản trị', fieldColor: 'from-blue-500 to-cyan-600', riasecCodes: ['E', 'A'], miCodes: ['LING', 'INTER'], description: 'Nghiên cứu thị trường, phát triển thương hiệu và sáng tạo chiến dịch nội dung.', pros: ['Thấu hiểu tâm lý', 'Biểu đạt ngôn từ', 'Bắt nhịp xu hướng'], searchKeywords: ['marketing', 'tiếp thị', 'thương mại'] },
  { code: '7340201', name: 'Tài chính - Ngân hàng số', field: 'Kinh tế & Tài chính', fieldColor: 'from-emerald-500 to-teal-600', riasecCodes: ['C', 'E'], miCodes: ['LOGIC', 'INTRA'], description: 'Quản trị danh mục đầu tư, phân tích rủi ro tài chính và tín dụng số.', pros: ['Nhạy bén với số', 'Kỷ luật tài chính', 'Kiểm soát rủi ro'], searchKeywords: ['tài chính', 'ngân hàng', 'kinh tế'] },
  { code: '7340301', name: 'Kế toán - Kiểm toán', field: 'Kinh tế & Tài chính', fieldColor: 'from-emerald-500 to-teal-600', riasecCodes: ['C', 'I'], miCodes: ['LOGIC', 'INTRA'], description: 'Giám sát tính minh bạch sổ sách, kiểm toán nội bộ và tuân thủ thuế.', pros: ['Tỉ mỉ cẩn trọng', 'Chính trực nguyên tắc', 'Rà soát chi tiết'], searchKeywords: ['kế toán', 'kiểm toán'] },
  { code: '7720101', name: 'Y đa khoa & Răng Hàm Mặt', field: 'Khoa học Sức khỏe', fieldColor: 'from-rose-500 to-red-600', riasecCodes: ['I', 'S'], miCodes: ['LOGIC', 'INTER', 'NATU'], description: 'Khám chữa bệnh, bảo vệ tính mạng và nâng cao sức khỏe cộng đồng.', pros: ['Lòng trắc ẩn', 'Kiên trì học hỏi', 'Bình tĩnh áp lực cao'], searchKeywords: ['y khoa', 'y đa khoa', 'y dược', 'bác sĩ'] },
  { code: '7210403', name: 'Thiết kế đồ họa & UI/UX', field: 'Nghệ thuật & Thiết kế', fieldColor: 'from-pink-500 to-fuchsia-600', riasecCodes: ['A', 'R'], miCodes: ['SPAT', 'LING'], description: 'Sáng tạo bộ nhận diện thương hiệu, thiết kế trải nghiệm người dùng số.', pros: ['Gu thẩm mỹ cao', 'Tư duy hình ảnh 3D', 'Sáng tạo phá cách'], searchKeywords: ['thiết kế', 'đồ họa', 'mỹ thuật', 'kiến trúc'] },
  { code: '7140201', name: 'Sư phạm & Đào tạo phát triển', field: 'Sư phạm & Giáo dục', fieldColor: 'from-amber-500 to-orange-600', riasecCodes: ['S', 'I'], miCodes: ['INTER', 'LING'], description: 'Giảng dạy, truyền cảm hứng tri thức và đồng hành cùng người học.', pros: ['Kiên nhẫn thấu hiểu', 'Diễn đạt khúc chiết', 'Tâm huyết phụng sự'], searchKeywords: ['sư phạm', 'giáo dục'] },
  { code: '7380107', name: 'Luật kinh tế & Pháp chế doanh nghiệp', field: 'Pháp luật', fieldColor: 'from-amber-500 to-orange-600', riasecCodes: ['E', 'C'], miCodes: ['LING', 'LOGIC'], description: 'Bảo vệ quyền lợi hợp pháp, tư vấn hợp đồng và giải quyết tranh chấp.', pros: ['Lập luận đanh thép', 'Tư duy phản biện', 'Tôn trọng pháp luật'], searchKeywords: ['luật', 'pháp lý', 'kinh tế luật'] },
  { code: '7520130', name: 'Kỹ thuật Cơ điện tử & Tự động hóa', field: 'Kỹ thuật & Công nghệ', fieldColor: 'from-cyan-600 to-blue-700', riasecCodes: ['R', 'I'], miCodes: ['BODI', 'LOGIC', 'SPAT'], description: 'Nghiên cứu, lắp ráp và vận hành dây chuyền cánh tay robot thông minh.', pros: ['Đam mê máy móc', 'Tư duy mạch điện', 'Khéo léo kỹ thuật'], searchKeywords: ['cơ điện tử', 'tự động hóa', 'cơ khí', 'điện tử'] }
];

export default function SurveyWizard() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // State cho Điểm thi dự kiến và Modal gợi ý trường
  const [userScore, setUserScore] = useState<number>(24.0);
  const [onlyHcm, setOnlyHcm] = useState<boolean>(true);
  const [selectedMajorModal, setSelectedMajorModal] = useState<MajorRule | null>(null);

  const currentQ = QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);

  const handleSelect = (val: number) => {
    const updated = { ...answers, [currentQ.id]: val };
    setAnswers(updated);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setSelectedMajorModal(null);
  };

  // ==========================================
  // THUẬT TOÁN TÍNH ĐIỂM RIASEC x MI (60/40)
  // ==========================================
  const results = useMemo(() => {
    if (!isCompleted) return null;

    const riasecSum: Record<string, { total: number; count: number }> = {
      R: { total: 0, count: 0 }, I: { total: 0, count: 0 }, A: { total: 0, count: 0 },
      S: { total: 0, count: 0 }, E: { total: 0, count: 0 }, C: { total: 0, count: 0 }
    };

    const miSum: Record<string, { total: number; count: number }> = {
      LOGIC: { total: 0, count: 0 }, LING: { total: 0, count: 0 }, SPAT: { total: 0, count: 0 },
      INTER: { total: 0, count: 0 }, INTRA: { total: 0, count: 0 }, BODI: { total: 0, count: 0 },
      MUSI: { total: 0, count: 0 }, NATU: { total: 0, count: 0 }
    };

    QUESTIONS.forEach((q) => {
      const score = answers[q.id] || 3;
      if (q.category === 'RIASEC') {
        riasecSum[q.dimension].total += score;
        riasecSum[q.dimension].count += 1;
      } else {
        miSum[q.dimension].total += score;
        miSum[q.dimension].count += 1;
      }
    });

    const riasecMean: Record<string, number> = {};
    Object.keys(riasecSum).forEach((dim) => {
      riasecMean[dim] = Number((riasecSum[dim].total / riasecSum[dim].count).toFixed(1));
    });

    const miMean: Record<string, number> = {};
    Object.keys(miSum).forEach((dim) => {
      miMean[dim] = Number((miSum[dim].total / miSum[dim].count).toFixed(1));
    });

    const topRiasec = Object.keys(riasecMean)
      .sort((x, y) => riasecMean[y] - riasecMean[x])
      .slice(0, 3);

    const topMI = Object.keys(miMean)
      .sort((x, y) => miMean[y] - miMean[x])
      .slice(0, 2);

    const scoredList = MAJORS_DATABASE.map((major) => {
      const riasecScore = major.riasecCodes.reduce((acc, code) => acc + (riasecMean[code] || 0), 0) / major.riasecCodes.length;
      const miScore = major.miCodes.reduce((acc, code) => acc + (miMean[code] || 0), 0) / major.miCodes.length;

      const rawMatch = (riasecScore * 0.6) + (miScore * 0.4);
      const matchPercentage = Math.min(99, Math.round((rawMatch / 5.0) * 100));

      return {
        ...major,
        matchPercentage,
        riasecScore: riasecScore.toFixed(1),
        miScore: miScore.toFixed(1)
      };
    });

    scoredList.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return {
      riasecMean,
      miMean,
      topRiasec,
      topMI,
      top5: scoredList.slice(0, 5),
    };
  }, [isCompleted, answers]);

  // ==========================================
  // THUẬT TOÁN TÌM KIẾM & XẾP HẠNG 10 TRƯỜNG ĐÀO TẠO
  // ==========================================
  const recommendedSchools = useMemo(() => {
    if (!selectedMajorModal) return [];

    const keywords = selectedMajorModal.searchKeywords.map((k) => k.toLowerCase());

    // Lọc theo khu vực TP.HCM / Toàn quốc
    const filteredUniversities = universitiesData.filter((u) => {
      if (onlyHcm) {
        const isHcm = u.city.toLowerCase().includes('hồ chí minh') || u.city.toLowerCase().includes('hcm') || u.region === 'NAM';
        return isHcm;
      }
      return true;
    });

    // Lọc các trường có ngành hoặc chuyên ngành phù hợp
    const matched = filteredUniversities.map((uni) => {
      let bestMajorCutoff = uni.cutoff; // Điểm chuẩn mặc định của trường

      if (uni.majors && uni.majors.length > 0) {
        const matchingMajor = uni.majors.find((m) =>
          keywords.some((k) => m.major_name.toLowerCase().includes(k))
        );
        if (matchingMajor && matchingMajor.cutoff_score > 10) {
          bestMajorCutoff = matchingMajor.cutoff_score;
        }
      }

      const diff = Number((userScore - bestMajorCutoff).toFixed(2));
      let status: 'SAFE' | 'TARGET' | 'REACH' = 'TARGET';
      let statusText = 'Vừa sức (70-85% đỗ)';
      let statusColor = 'bg-amber-100 text-amber-800 border-amber-300';

      if (diff >= 1.5) {
        status = 'SAFE';
        statusText = 'Khả năng đỗ cao (≥90%)';
        statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      } else if (diff < -1.0) {
        status = 'REACH';
        statusText = 'Thử thách (NV1)';
        statusColor = 'bg-rose-100 text-rose-800 border-rose-300';
      }

      return {
        ...uni,
        estimatedCutoff: bestMajorCutoff,
        diff,
        status,
        statusText,
        statusColor
      };
    });

    // Sắp xếp ưu tiên: Các trường vừa sức & an toàn lên đầu (xung quanh điểm của bạn)
    matched.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff));

    return matched.slice(0, 10);
  }, [selectedMajorModal, userScore, onlyHcm]);

  // ==========================================
  // GIAO DIỆN KẾT QUẢ
  // ==========================================
  if (isCompleted && results) {
    const riasecLabels: Record<string, string> = {
      R: '🛠️ Thực tế (R)', I: '🔬 Nghiên cứu (I)', A: '🎨 Nghệ thuật (A)',
      S: '🤝 Xã hội (S)', E: '🚀 Quản lý (E)', C: '📊 Quy chuẩn (C)'
    };

    const miLabels: Record<string, string> = {
      LOGIC: '🧮 Logic Toán học', LING: '✍️ Ngôn ngữ', SPAT: '📐 Không gian thị giác',
      INTER: '🗣️ Giao tiếp xã hội', INTRA: '🧘 Trí tuệ nội tâm', BODI: '🏃 Vận động thể chất',
      MUSI: '🎵 Âm nhạc', NATU: '🌿 Khám phá tự nhiên'
    };

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Banner kết quả rực rỡ */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 p-8 text-white shadow-xl">
          <span className="inline-block rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            Hồ sơ hướng nghiệp & Gợi ý nguyện vọng 2026
          </span>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Mã tính cách trội: <span className="underline decoration-yellow-300 decoration-wavy">{results.topRiasec.join(' - ')}</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium text-purple-100 sm:text-base">
            Thế mạnh trí tuệ: <strong className="text-yellow-300">{results.topMI.map((m) => miLabels[m]).join(' & ')}</strong>
          </p>

          <button
            onClick={handleReset}
            className="mt-6 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-700 shadow-md transition-all hover:bg-yellow-300 hover:text-ink-900"
          >
            🔄 Khảo sát lại
          </button>
        </div>

        {/* Thanh công cụ: Nhập điểm thi dự kiến */}
        <div className="rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-ink-900 flex items-center gap-2">
                <span>🎯</span> Nhập Điểm thi tốt nghiệp THPT dự kiến của bạn:
              </h3>
              <p className="text-xs text-ink-600 mt-0.5">
                Hệ thống sẽ đối chiếu điểm số này với điểm chuẩn các trường để tính tỷ lệ đỗ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tăng giảm điểm */}
              <div className="flex items-center rounded-xl bg-white p-1 border border-brand-300 shadow-sm">
                <button
                  type="button"
                  onClick={() => setUserScore((prev) => Math.max(15, Number((prev - 0.5).toFixed(1))))}
                  className="h-8 w-8 rounded-lg bg-gray-100 font-bold text-ink-700 hover:bg-brand-100"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="30"
                  value={userScore}
                  onChange={(e) => setUserScore(Number(e.target.value) || 20)}
                  className="w-16 text-center font-black text-brand-700 text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => setUserScore((prev) => Math.min(30, Number((prev + 0.5).toFixed(1))))}
                  className="h-8 w-8 rounded-lg bg-gray-100 font-bold text-ink-700 hover:bg-brand-100"
                >
                  +
                </button>
              </div>

              {/* Bộ lọc ưu tiên TP.HCM */}
              <button
                type="button"
                onClick={() => setOnlyHcm(!onlyHcm)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  onlyHcm
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-ink-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                📍 {onlyHcm ? 'Ưu tiên TP. Hồ Chí Minh' : 'Toàn quốc'}
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách Top 5 ngành phù hợp */}
        <div>
          <div className="mb-4">
            <h3 className="text-2xl font-extrabold text-ink-900">
              Top 5 Ngành nghề phù hợp nhất
            </h3>
            <p className="text-sm text-ink-500">
              👉 <strong>Bấm vào từng ngành</strong> bên dưới để xem 10 trường đào tạo và dự đoán xác suất trúng tuyển theo điểm của bạn ({userScore} điểm).
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.top5.map((item, idx) => (
              <div
                key={item.code}
                onClick={() => setSelectedMajorModal(item)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-line bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl cursor-pointer"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.fieldColor}`} />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700">
                      #{idx + 1} · {item.code}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-2.5 py-0.5 text-xs font-extrabold text-white shadow-sm">
                      🔥 {item.matchPercentage}% Hợp
                    </span>
                  </div>

                  <span className={`inline-block text-[11px] font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${item.fieldColor}`}>
                    {item.field}
                  </span>

                  <h4 className="mt-1 text-lg font-extrabold text-ink-900 group-hover:text-brand-600 transition-colors">
                    {item.name}
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-ink-500 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-600 group-hover:underline">
                    Xem 10 trường & tỷ lệ đỗ →
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs">
                    🏛️
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            MODAL HIỂN THỊ 10 TRƯỜNG ĐÀO TẠO & XÁC SUẤT ĐỖ
            ========================================== */}
        {selectedMajorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
              {/* Nút đóng modal */}
              <button
                onClick={() => setSelectedMajorModal(null)}
                className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>

              {/* Tiêu đề modal */}
              <div className="mb-6">
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
                  {selectedMajorModal.field}
                </span>
                <h3 className="mt-2 text-2xl font-black text-ink-900">
                  Gợi ý 10 trường đào tạo: {selectedMajorModal.name}
                </h3>
                <p className="mt-1 text-sm text-ink-600">
                  Điểm dự kiến của bạn: <strong className="text-brand-700 text-base">{userScore} điểm</strong> ({onlyHcm ? 'Khu vực TP. Hồ Chí Minh' : 'Toàn quốc'})
                </p>
              </div>

              {/* Danh sách 10 trường */}
              {recommendedSchools.length > 0 ? (
                <div className="space-y-3">
                  {recommendedSchools.map((school, i) => (
                    <div
                      key={`${school.code}-${i}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4 transition-all hover:border-brand-300 hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                            {school.code}
                          </span>
                          <span className="text-xs text-ink-400">📍 {school.city}</span>
                        </div>
                        <h4 className="font-bold text-ink-900 text-sm sm:text-base leading-snug">
                          {school.name}
                        </h4>
                        <p className="text-xs text-ink-500 mt-0.5">
                          Điểm chuẩn tham khảo: <strong className="text-red-600">{school.estimatedCutoff} đ</strong>
                          {school.diff >= 0 ? (
                            <span className="ml-2 text-emerald-600 font-medium">(Bạn cao hơn +{school.diff} đ)</span>
                          ) : (
                            <span className="ml-2 text-rose-600 font-medium">(Bạn thấp hơn {school.diff} đ)</span>
                          )}
                        </p>
                      </div>

                      {/* Huy hiệu xác suất đỗ */}
                      <div className="text-right">
                        <span className={`inline-block rounded-xl border px-3 py-1.5 text-xs font-bold ${school.statusColor}`}>
                          {school.statusText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Chưa tìm thấy trường phù hợp trong cơ sở dữ liệu. Hãy thử tắt tùy chọn ưu tiên TP.HCM để tìm trên toàn quốc.
                </div>
              )}

              {/* Footer modal */}
              <div className="mt-6 flex justify-end border-t border-line pt-4">
                <button
                  onClick={() => setSelectedMajorModal(null)}
                  className="rounded-xl bg-gray-100 px-5 py-2 text-xs font-bold text-ink-700 hover:bg-gray-200"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN LÀM BÀI KHẢO SÁT
  // ==========================================
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-brand-600 uppercase tracking-wider">
            {currentQ.category === 'RIASEC' ? 'Phần 1: Sở thích nghề nghiệp' : 'Phần 2: Năng lực trí tuệ'}
          </span>
          <span className="text-ink-500">
            Câu {currentIndex + 1} / {QUESTIONS.length} ({progressPercent}%)
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-2xl">{currentQ.icon}</span>
          <span className={`rounded-full bg-gradient-to-r ${currentQ.color} px-3.5 py-1 text-xs font-bold text-white shadow-sm`}>
            {currentQ.dimensionName}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold leading-snug text-ink-900 min-h-[70px] flex items-center">
          “{currentQ.content}”
        </h3>

        <p className="mt-3 text-xs text-ink-400 italic">
          Hãy chọn mức độ phản ánh chân thực nhất về bạn:
        </p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-5">
          {LIKERT_OPTIONS.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.val;
            return (
              <button
                key={opt.val}
                type="button"
                onClick={() => handleSelect(opt.val)}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all transform active:scale-95 ${
                  isSelected ? opt.active + ' scale-105 shadow-md ring-2 ring-brand-400' : opt.color + ' bg-white'
                }`}
              >
                <span className="text-2xl mb-1">{opt.emoji}</span>
                <span className="text-xs font-bold text-center leading-tight">
                  {opt.label}
                </span>
                <span className="mt-1 text-[10px] opacity-75 font-mono">
                  {opt.val} điểm
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-ink-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ← Câu trước
          </button>
          <span className="text-xs text-ink-400">
            Chọn một mức độ để tự động sang câu tiếp theo
          </span>
        </div>
      </div>
    </div>
  );
}