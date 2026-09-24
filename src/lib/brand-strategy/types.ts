export type JungianArchetypeId =
  | "creator"
  | "sage"
  | "hero"
  | "outlaw"
  | "explorer"
  | "magician"
  | "lover"
  | "everyman"
  | "caregiver"
  | "jester"
  | "ruler"
  | "innocent";

export interface ArchetypeInfo {
  id: JungianArchetypeId;
  nameVi: string;
  nameEn: string;
  icon: string;
  motto: string;
  coreDesire: string;
  greatestFear: string;
  strategy: string;
  iconicBrands: string[];
  voiceTraits: string[];
  colorTheme: string;
}

export interface BrandInput {
  brandName: string;
  industry: string;
  targetAudience: string;
  mission: string;
  coreValues: string[];
  archetypeId: JungianArchetypeId;
  formality: number; // 1 (rất gần gũi, đời thường) -> 5 (rất trang trọng, học thuật)
  humor: number; // 1 (nghiêm cẩn tuyệt đối) -> 5 (hài hước, duyên dáng)
  emotion: number; // 1 (lý trí, dữ liệu) -> 5 (giàu cảm xúc, truyền cảm hứng)
  assertiveness: number; // 1 (khiêm tốn, lắng nghe) -> 5 (tự tin, dẫn dắt mạnh mẽ)
}

export interface VoiceRule {
  dimension: string;
  levelDesc: string;
  dos: string[];
  donts: string[];
}

export interface ContentPillar {
  title: string;
  purpose: string;
  exampleTopics: string[];
}

export interface BrandStrategyResult {
  archetype: ArchetypeInfo;
  taglineSuggestions: string[];
  positioningStatement: string;
  voiceRules: VoiceRule[];
  powerWords: string[];
  wordsToAvoid: string[];
  contentPillars: ContentPillar[];
  viralHooks: string[];
  aiSystemPrompt: string;
  fullMarkdownDoc: string;
}
