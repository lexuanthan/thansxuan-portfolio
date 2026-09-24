import type {
  ArchetypeInfo,
  BrandInput,
  BrandStrategyResult,
  ContentPillar,
  JungianArchetypeId,
  VoiceRule,
} from "./types";

export const ARCHETYPES: Record<JungianArchetypeId, ArchetypeInfo> = {
  creator: {
    id: "creator",
    nameVi: "Người Sáng Tạo",
    nameEn: "The Creator",
    icon: "🎨",
    motto: "Nếu bạn có thể tưởng tượng ra nó, bạn có thể tạo ra nó.",
    coreDesire: "Tạo ra những giá trị lâu bền, độc bản và có tính thẩm mỹ vượt trội.",
    greatestFear: "Sự tầm thường, ý tưởng trùng lặp hoặc thực thi kém cỏi.",
    strategy: "Nuôi dưỡng tư duy đổi mới, khuyến khích sáng tạo và chuẩn hóa tay nghề bậc thầy.",
    iconicBrands: ["Apple", "Lego", "Adobe", "Figma"],
    voiceTraits: ["Đầy cảm hứng", "Độc đáo", "Khơi gợi thẩm mỹ", "Táo bạo nhưng tinh tế"],
    colorTheme: "from-amber-100 to-orange-100",
  },
  sage: {
    id: "sage",
    nameVi: "Người Thông Thái",
    nameEn: "The Sage",
    icon: "🦉",
    motto: "Sự thật và tri thức sẽ giải phóng tiềm năng của bạn.",
    coreDesire: "Tìm kiếm chân lý, thấu hiểu thế giới và lan tỏa tri thức hữu ích.",
    greatestFear: "Bị lừa dối, thiếu hiểu biết hoặc đưa ra thông tin sai lệch.",
    strategy: "Nghiên cứu sâu sắc, phân tích khách quan và chia sẻ kiến thức chuẩn xác.",
    iconicBrands: ["Google", "BBC", "TED", "McKinsey"],
    voiceTraits: ["Uyên bác", "Khách quan", "Rõ ràng", "Đáng tin cậy"],
    colorTheme: "from-blue-100 to-indigo-100",
  },
  hero: {
    id: "hero",
    nameVi: "Người Hùng",
    nameEn: "The Hero",
    icon: "⚡",
    motto: "Nơi nào có ý chí, nơi đó có con đường.",
    coreDesire: "Chứng minh giá trị thông qua hành động dũng cảm và vượt qua thử thách.",
    greatestFear: "Sự yếu đuối, thất bại hoặc đầu hàng trước nghịch cảnh.",
    strategy: "Khích lệ sự kỷ luật, tôi luyện sức mạnh và chinh phục mục tiêu lớn.",
    iconicBrands: ["Nike", "FedEx", "BMW", "Gatorade"],
    voiceTraits: ["Mạnh mẽ", "Thôi thúc hành động", "Tràn đầy nhiệt huyết", "Tự tin"],
    colorTheme: "from-red-100 to-rose-100",
  },
  outlaw: {
    id: "outlaw",
    nameVi: "Kẻ Đột Phá",
    nameEn: "The Outlaw / Rebel",
    icon: "🔥",
    motto: "Quy tắc sinh ra là để viết lại.",
    coreDesire: "Phá bỏ những lối mòn cũ kỹ và giải phóng con người khỏi rập khuôn.",
    greatestFear: "Bị đồng hóa, mất tự do hoặc trở nên mờ nhạt trong đám đông.",
    strategy: "Thách thức hiện trạng, nói thẳng sự thật và tiên phong tạo ra sự khác biệt.",
    iconicBrands: ["Harley-Davidson", "Diesel", "Virgin", "Tesla"],
    voiceTraits: ["Gai góc", "Trực diện", "Nổi loạn", "Không khoan nhượng"],
    colorTheme: "from-stone-200 to-zinc-300",
  },
  explorer: {
    id: "explorer",
    nameVi: "Người Khai Phá",
    nameEn: "The Explorer",
    icon: "🧭",
    motto: "Đừng trói buộc tôi vào những giới hạn có sẵn.",
    coreDesire: "Tự do trải nghiệm thế giới, khám phá bản thân và chạm tới chân trời mới.",
    greatestFear: "Sự tù túng, nhàm chán và lối sống an phận.",
    strategy: "Hành trình trải nghiệm thực tế, thử nghiệm điều mới và tôn vinh tự do cá nhân.",
    iconicBrands: ["The North Face", "Patagonia", "Jeep", "National Geographic"],
    voiceTraits: ["Phóng khoáng", "Chân thực", "Khao khát tự do", "Phiêu lưu"],
    colorTheme: "from-emerald-100 to-teal-100",
  },
  magician: {
    id: "magician",
    nameVi: "Nhà Ảo Thuật",
    nameEn: "The Magician",
    icon: "✨",
    motto: "Biến những điều tưởng chừng không thể thành hiện thực.",
    coreDesire: "Thấu hiểu quy luật nền tảng để tạo ra những bước nhảy vọt thần kỳ.",
    greatestFear: "Hậu quả tiêu cực ngoài ý muốn hoặc sự trì trệ của công nghệ.",
    strategy: "Tạo ra những trải nghiệm chuyển hóa kỳ diệu và ứng dụng công nghệ đột phá.",
    iconicBrands: ["Disney", "Dyson", "Polaroid", "OpenAI"],
    voiceTraits: ["Kỳ diệu", "Tầm nhìn xa", "Biến đổi", "Đầy cảm hứng"],
    colorTheme: "from-purple-100 to-violet-100",
  },
  lover: {
    id: "lover",
    nameVi: "Người Đam Mê",
    nameEn: "The Lover",
    icon: "❤️",
    motto: "Mọi điều tuyệt vời đều bắt đầu từ tình yêu và sự gắn kết.",
    coreDesire: "Tạo ra sự thân mật, thấu cảm sâu sắc và vẻ đẹp rung động lòng người.",
    greatestFear: "Sự cô độc, bị từ chối hoặc trở nên vô cảm.",
    strategy: "Chăm chút từng giác quan, nâng niu cảm xúc và xây dựng mối quan hệ bền chặt.",
    iconicBrands: ["Chanel", "Häagen-Dazs", "Godiva", "Alfa Romeo"],
    voiceTraits: ["Quyến rũ", "Ấm áp", "Thấu cảm", "Tinh tế"],
    colorTheme: "from-pink-100 to-rose-100",
  },
  everyman: {
    id: "everyman",
    nameVi: "Người Bạn Đồng Hành",
    nameEn: "The Everyman",
    icon: "🤝",
    motto: "Mọi người đều bình đẳng và xứng đáng được thấu hiểu.",
    coreDesire: "Kết nối với mọi người, thuộc về một cộng đồng gắn kết.",
    greatestFear: "Bị cô lập, tỏ ra trịch thượng hoặc xa cách đời thực.",
    strategy: "Giản dị, chân thành, dễ tiếp cận và lấy sự hữu dụng làm trọng tâm.",
    iconicBrands: ["IKEA", "Levi's", "eBay", "Target"],
    voiceTraits: ["Gần gũi", "Chân chất", "Đáng mến", "Thực tế"],
    colorTheme: "from-amber-100 to-yellow-100",
  },
  caregiver: {
    id: "caregiver",
    nameVi: "Người Chăm Sóc",
    nameEn: "The Caregiver",
    icon: "🌱",
    motto: "Hãy yêu thương và bảo vệ những người xung quanh.",
    coreDesire: "Bảo vệ, nâng đỡ và mang lại sự an lành cho người khác.",
    greatestFear: "Sự ích kỷ, thờ ơ và tổn thương của những người yếu thế.",
    strategy: "Tận tâm phục vụ, đồng hành và tạo ra môi trường an toàn tuyệt đối.",
    iconicBrands: ["Volvo", "Johnson & Johnson", "UNICEF", "Pampers"],
    voiceTraits: ["Dịu dàng", "Đáng tin cậy", "Bao dung", "Nâng đỡ"],
    colorTheme: "from-green-100 to-emerald-100",
  },
  jester: {
    id: "jester",
    nameVi: "Người Hoạt Bát",
    nameEn: "The Jester",
    icon: "🎉",
    motto: "Nếu cuộc sống không có niềm vui, tại sao phải bận tâm?",
    coreDesire: "Tận hưởng trọn vẹn từng khoảnh khắc và mang tiếng cười đến mọi người.",
    greatestFear: "Sự buồn tẻ, nhàm chán và những nghi thức cứng nhắc.",
    strategy: "Sử dụng sự hài hước, dí dỏm để phá vỡ căng thẳng và gắn kết cộng đồng.",
    iconicBrands: ["Duolingo", "M&M's", "Old Spice", "Mailchimp"],
    voiceTraits: ["Dí dỏm", "Vui vẻ", "Hài hước", "Thông minh tinh nghịch"],
    colorTheme: "from-yellow-100 to-lime-100",
  },
  ruler: {
    id: "ruler",
    nameVi: "Nhà Lãnh Đạo",
    nameEn: "The Ruler",
    icon: "👑",
    motto: "Trật tự và tiêu chuẩn xuất sắc kiến tạo sự thịnh vượng.",
    coreDesire: "Kiểm soát, thiết lập trật tự và đạt tới đỉnh cao chuẩn mực của ngành.",
    greatestFear: "Sự hỗn loạn, mất kiểm soát hoặc đánh mất vị thế số một.",
    strategy: "Thực thi quyền lực uy tín, duy trì chất lượng đỉnh cao và dẫn dắt cuộc chơi.",
    iconicBrands: ["Mercedes-Benz", "Rolex", "Microsoft", "American Express"],
    voiceTraits: ["Uy quyền", "Điềm đạm", "Sang trọng", "Chuẩn mực"],
    colorTheme: "from-slate-200 to-gray-300",
  },
  innocent: {
    id: "innocent",
    nameVi: "Người Thuần Khiết",
    nameEn: "The Innocent",
    icon: "☀️",
    motto: "Hạnh phúc nằm ở những điều chân phương và giản dị nhất.",
    coreDesire: "Trải nghiệm cuộc sống thuần khiết, an nhiên và hướng thiện.",
    greatestFear: "Làm điều sai trái hoặc rơi vào sự phức tạp độc hại.",
    strategy: "Làm điều đúng đắn, giữ sự lạc quan và gìn giữ niềm tin tốt đẹp.",
    iconicBrands: ["Dove", "Coca-Cola", "Innocent Drinks", "Aveda"],
    voiceTraits: ["Trong trẻo", "Lạc quan", "Chân thành", "Bình an"],
    colorTheme: "from-sky-100 to-blue-100",
  },
};

export const CORE_VALUE_OPTIONS: string[] = [
  "Sáng tạo",
  "Đổi mới",
  "Đột phá",
  "Đáng tin cậy",
  "Thấu cảm",
  "Sang trọng",
  "Bền vững",
  "Chân thành",
  "Tối giản",
  "Chuyên nghiệp",
  "Nhiệt huyết",
  "Gần gũi",
  "Dũng cảm",
  "Trí tuệ",
  "Tận tâm",
  "Vui vẻ",
];

export const INDUSTRY_OPTIONS: string[] = [
  "Công nghệ & Phần mềm (SaaS / AI)",
  "Giáo dục & Đào tạo (EdTech)",
  "Sáng tạo nội dung & Truyền thông số",
  "Tư vấn thương hiệu & Marketing",
  "Thời trang & Phong cách sống",
  "Ẩm thực & Đồ uống (F&B)",
  "Chăm sóc sức khỏe & Thể chất",
  "Thương mại điện tử & Bán lẻ",
  "Tài chính & Đầu tư",
];

/**
 * Gợi ý hình mẫu phù hợp nhất dựa trên các giá trị cốt lõi đã chọn.
 */
export function suggestArchetypeFromValues(values: string[]): JungianArchetypeId {
  const map: Record<string, JungianArchetypeId> = {
    "Sáng tạo": "creator",
    "Đổi mới": "creator",
    "Đột phá": "outlaw",
    "Đáng tin cậy": "sage",
    "Trí tuệ": "sage",
    "Dũng cảm": "hero",
    "Nhiệt huyết": "hero",
    "Thấu cảm": "lover",
    "Sang trọng": "ruler",
    "Chuyên nghiệp": "ruler",
    "Gần gũi": "everyman",
    "Chân thành": "everyman",
    "Tận tâm": "caregiver",
    "Bền vững": "caregiver",
    "Vui vẻ": "jester",
    "Tối giản": "innocent",
  };

  const scores: Partial<Record<JungianArchetypeId, number>> = {};
  for (const v of values) {
    const arch = map[v];
    if (arch) {
      scores[arch] = (scores[arch] || 0) + 1;
    }
  }

  let maxArch: JungianArchetypeId = "creator";
  let maxScore = -1;
  for (const [arch, score] of Object.entries(scores)) {
    if (score && score > maxScore) {
      maxScore = score;
      maxArch = arch as JungianArchetypeId;
    }
  }
  return maxArch;
}

/**
 * Tạo ma trận chiến lược thương hiệu toàn diện & AI System Prompt.
 */
export function generateBrandStrategy(input: BrandInput): BrandStrategyResult {
  const archetype = ARCHETYPES[input.archetypeId] || ARCHETYPES.creator;
  const brand = input.brandName.trim() || "Thương hiệu";
  const audience = input.targetAudience.trim() || "Khách hàng mục tiêu";
  const industry = input.industry.trim() || "Lĩnh vực chuyên môn";

  // 1. Taglines
  const taglines: string[] = [
    `${brand} — Định chuẩn mới cho ${industry.toLowerCase()}.`,
    `Cùng ${brand} khai mở tiềm năng độc bản.`,
    `${brand}: Đơn giản hóa sự phức tạp, nhân đôi giá trị thực.`,
    `${archetype.motto}`,
  ];

  // 2. Định vị 1 câu
  const positioningStatement = `Dành cho ${audience}, ${brand} là giải pháp ${industry.toLowerCase()} tiên phong mang hình mẫu ${archetype.nameVi}, giúp khách hàng ${archetype.coreDesire.toLowerCase()} mà không phải đối mặt với ${archetype.greatestFear.toLowerCase()}.`;

  // 3. Quy tắc tông giọng
  const voiceRules: VoiceRule[] = [
    {
      dimension: "Mức độ trang trọng (Formality)",
      levelDesc:
        input.formality >= 4
          ? "Trang trọng, chuyên gia, chuẩn mực học thuật"
          : input.formality <= 2
          ? "Gần gũi, đời thường, như người bạn đồng hành"
          : "Cân bằng, lịch sự, tôn trọng nhưng tự nhiên",
      dos: [
        input.formality >= 4
          ? "Dùng thuật ngữ chính xác, xưng hô lịch thiệp"
          : "Dùng từ ngữ giản dị, câu văn ngắn gọn, dễ hiểu",
        "Luôn giữ thái độ tôn trọng người đọc",
      ],
      donts: [
        input.formality >= 4
          ? "Tránh dùng tiếng lóng (slang), emoji quá đà"
          : "Tránh văn phong hành chính khô cứng, rườm rà",
        "Tránh xưng hô kẻ cả, dạy đời",
      ],
    },
    {
      dimension: "Sắc thái hài hước (Humour)",
      levelDesc:
        input.humor >= 4
          ? "Hóm hỉnh, chơi chữ tinh tế, mang lại năng lượng tích cực"
          : input.humor <= 2
          ? "Nghiêm túc, điềm đạm, tập trung vào bản chất vấn đề"
          : "Duyên dáng vừa đủ, tươi sáng nhưng không bông đùa",
      dos: [
        input.humor >= 4
          ? "Dùng ẩn dụ thông minh, tạo tiếng cười đồng cảm"
          : "Đi thẳng vào giải pháp và dữ liệu thực chứng",
        "Giữ năng lượng tích cực và xây dựng",
      ],
      donts: [
        "Không bao giờ đùa cợt trên nỗi đau hay sự cố của người khác",
        input.humor <= 2
          ? "Tránh đưa chuyện đùa lạc đề vào văn bản chuyên môn"
          : "Tránh nói lố bịch hoặc đùa dai",
      ],
    },
    {
      dimension: "Cường độ cảm xúc (Emotion)",
      levelDesc:
        input.emotion >= 4
          ? "Giàu cảm xúc, truyền cảm hứng mạnh mẽ, chạm đến trái tim"
          : input.emotion <= 2
          ? "Lý trí, dựa trên dữ kiện, khách quan và logic"
          : "Hài hòa giữa lập luận vững chắc và sự thấu cảm",
      dos: [
        input.emotion >= 4
          ? "Kể chuyện (storytelling) giàu hình ảnh, khơi gợi khát vọng"
          : "Dẫn chứng số liệu, logic rõ ràng và minh bạch",
        "Thấu hiểu nỗi trăn trở thật của đối tượng mục tiêu",
      ],
      donts: [
        input.emotion >= 4
          ? "Tránh giật gân, làm quá cảm xúc (melodramatic)"
          : "Tránh khô khan như một văn bản quy phạm kỹ thuật",
        "Không thao túng tâm lý độc giả",
      ],
    },
  ];

  // 4. Power words & Words to avoid
  const powerWords = [
    ...archetype.voiceTraits,
    "Giá trị thực",
    "Độc bản",
    "Tiên phong",
    "Chuyển hóa",
    "Đồng hành",
    "Bứt phá",
  ];

  const wordsToAvoid = [
    "Rẻ nhất",
    "Bảo đảm 100% không cần làm gì",
    "Không thể tin được",
    "Tuyệt hảo nhất vũ trụ",
    "Sáo rỗng",
    "Nói suông",
  ];

  // 5. Content Pillars
  const contentPillars: ContentPillar[] = [
    {
      title: "Trụ cột 1: Thấu thị Ngành & Khai mở Tư duy (Thought Leadership)",
      purpose: "Khẳng định vị thế chuyên gia và cung cấp góc nhìn sâu sắc về thị trường.",
      exampleTopics: [
        `Tương lai của ngành ${industry.toLowerCase()} 3 năm tới: Đâu là điểm bùng nổ?`,
        `3 Sai lầm chí mạng hầu hết ${audience.toLowerCase()} đang mắc phải và cách khắc phục.`,
      ],
    },
    {
      title: "Trụ cột 2: Giải pháp Thực chiến & Đằng sau hậu trường (Proof of Work)",
      purpose: "Minh chứng năng lực giải quyết vấn đề bằng trải nghiệm thực tế.",
      exampleTopics: [
        `Case study: Cách ${brand} giúp khách hàng vượt qua rào cản lớn nhất.`,
        `Quy trình đằng sau một sản phẩm chuẩn ${archetype.nameVi.toLowerCase()} được tạo ra như thế nào.`,
      ],
    },
    {
      title: "Trụ cột 3: Triết lý & Văn hóa Thương hiệu (Culture & Core Values)",
      purpose: "Xây dựng sự gắn kết cảm xúc và niềm tin lâu dài với cộng đồng.",
      exampleTopics: [
        `Tại sao ${brand} lựa chọn làm theo cách này thay vì lối mòn thông thường?`,
        `Câu chuyện về những giá trị cốt lõi chúng tôi kiên quyết không đánh đổi.`,
      ],
    },
    {
      title: "Trụ cột 4: Hướng dẫn Từng bước & Công cụ Hành động (Actionable Guides)",
      purpose: "Trao giá trị tức thì giúp độc giả ứng dụng được ngay vào công việc.",
      exampleTopics: [
        `Bộ checklist 5 bước tối ưu hóa hiệu suất cho ${audience.toLowerCase()}.`,
        `Mẫu biểu mẫu & công cụ miễn phí từ ${brand} giúp bạn tiết kiệm 5 giờ mỗi tuần.`,
      ],
    },
  ];

  // 6. Viral Hooks
  const viralHooks: string[] = [
    `Đừng làm ${industry.toLowerCase()} theo cách cũ nếu bạn không muốn tụt hậu trong năm 2026.`,
    `90% ${audience.toLowerCase()} đang bỏ qua điều quan trọng này — đây là cách ${brand} nhìn nhận vấn đề.`,
    `Nếu bạn chỉ có 5 phút để thay đổi kết quả công việc, hãy bắt đầu từ nguyên lý này:`,
    `Tại sao những người xuất sắc nhất lại chọn phương pháp ${archetype.nameVi.toLowerCase()} thay vì làm theo số đông?`,
    `Bí quyết đơn giản nhưng mang tính bước ngoặt mà không ai trong ngành chia sẻ với bạn.`,
  ];

  // 7. Production AI System Prompt
  const aiSystemPrompt = `Bạn là Đại diện Tông giọng AI (AI Brand Persona) chính thức của "${brand}".
Lĩnh vực hoạt động: ${industry}
Đối tượng phục vụ: ${audience}
Sứ mệnh: ${input.mission || archetype.coreDesire}

[HÌNH MẪU THƯƠNG HIỆU - BRAND ARCHETYPE]
- Hình mẫu chủ đạo: ${archetype.nameVi} (${archetype.nameEn})
- Châm ngôn cốt lõi: "${archetype.motto}"
- Giá trị theo đuổi: ${archetype.coreDesire}
- Nỗi sợ cần tránh: ${archetype.greatestFear}
- Phong cách đại diện: ${archetype.iconicBrands.join(", ")}

[BỘ QUY TẮC PHÁT NGÔN & TÔNG GIỌNG - VOICE & TONE MATRIX]
1. Độ trang trọng (Thang 1-5: ${input.formality}/5): ${
    input.formality >= 4
      ? "Lịch thiệp, chuẩn xác, ngôn từ sắc bén, thể hiện chuyên môn vững vàng."
      : input.formality <= 2
      ? "Thân thiện, gần gũi như một người bạn tri kỷ, dùng từ bình dân dễ hiểu."
      : "Văn minh, điềm đạm, ấm áp và tôn trọng đối thoại hai chiều."
  }
2. Sắc thái cảm xúc (Thang 1-5: ${input.emotion}/5): ${
    input.emotion >= 4
      ? "Giàu cảm xúc, truyền cảm hứng mãnh liệt, dùng lối kể chuyện (storytelling) chạm đến trái tim."
      : "Khách quan, tỉnh táo, dẫn chứng số liệu và giải pháp cụ thể, không hô hào sáo rỗng."
  }
3. Tính tự tin & Dẫn dắt (Thang 1-5: ${input.assertiveness}/5): ${
    input.assertiveness >= 4
      ? "Quyết đoán, thẳng thắn, đưa ra lập trường rõ ràng, dám bảo vệ quan điểm đúng."
      : "Khiêm tốn, đồng hành, gợi mở vấn đề để người đọc tự đưa ra quyết định."
  }

[DANH TỪ NÊN DÙNG & TỪ CẤM KỴ]
- Ưu tiên sử dụng các từ ngữ quyền năng: ${powerWords.join(", ")}
- Tuyệt đối TRÁNH các từ ngữ sau: ${wordsToAvoid.join(", ")}

[NGUYÊN TẮC BẮT BUỘC]
- Không bao giờ viết những câu chung chung vô thưởng vô phạt. Luôn cung cấp giá trị thực tế hoặc góc nhìn độc bản.
- Luôn đặt trải nghiệm và sự thấu cảm dành cho ${audience} lên hàng đầu.
- Khi tạo nội dung, hãy xưng hô phù hợp với hình mẫu ${archetype.nameVi}, giữ trọn vẹn sự trung thực và tự hào về bản sắc thương hiệu.`;

  // 8. Full Markdown Document
  const fullMarkdownDoc = `# HỒ SƠ CHIẾN LƯỢC THƯƠNG HIỆU & BRAND VOICE AI
**Thương hiệu:** ${brand}  
**Lĩnh vực:** ${industry}  
**Đối tượng mục tiêu:** ${audience}  
**Ngày tạo:** ${new Date().toLocaleDateString("vi-VN")}

---

## 1. Bản Sắc & Hình Mẫu Cốt Lõi (Brand Archetype)
- **Hình mẫu tâm lý:** ${archetype.nameVi} (${archetype.nameEn})
- **Châm ngôn thương hiệu:** *"${archetype.motto}"*
- **Khát vọng tối thượng:** ${archetype.coreDesire}
- **Nỗi sợ lớn nhất:** ${archetype.greatestFear}
- **Chiến lược hành động:** ${archetype.strategy}
- **Thương hiệu biểu tượng đồng điệu:** ${archetype.iconicBrands.join(", ")}
- **Đặc trưng ngôn ngữ:** ${archetype.voiceTraits.join(", ")}

## 2. Tuyên Bố Định Vị (Positioning Statement)
> ${positioningStatement}

## 3. Khẩu Hiệu Đề Xuất (Taglines)
${taglines.map((t) => `- ${t}`).join("\n")}

## 4. Ma Trận Quy Tắc Tông Giọng (Voice & Tone Guidelines)
${voiceRules
  .map(
    (r) => `### ${r.dimension}
- **Mức độ:** ${r.levelDesc}
- **NÊN LÀM (Do's):**
${r.dos.map((d) => `  * ${d}`).join("\n")}
- **KHÔNG NÊN LÀM (Don'ts):**
${r.donts.map((d) => `  * ${d}`).join("\n")}
`
  )
  .join("\n")}

## 5. Bộ Từ Vựng Định Hướng
- **Từ khóa quyền năng (Power Words):** ${powerWords.join(", ")}
- **Từ ngữ cấm kỵ (Words to Avoid):** ${wordsToAvoid.join(", ")}

## 6. Trụ Cột Nội Dung (Content Pillars)
${contentPillars
  .map(
    (p) => `### ${p.title}
*Mục đích:* ${p.purpose}
*Ví dụ chủ đề:*
${p.exampleTopics.map((e) => `- ${e}`).join("\n")}
`
  )
  .join("\n")}

## 7. Mẫu Tiêu Đề Mở Đầu Thu Hút (Hooks)
${viralHooks.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

---

## 8. Lệnh Hệ Thống Chuẩn Hóa Cho AI (AI System Prompt)
\`\`\`text
${aiSystemPrompt}
\`\`\`
`;

  return {
    archetype,
    taglineSuggestions: taglines,
    positioningStatement,
    voiceRules,
    powerWords,
    wordsToAvoid,
    contentPillars,
    viralHooks,
    aiSystemPrompt,
    fullMarkdownDoc,
  };
}
