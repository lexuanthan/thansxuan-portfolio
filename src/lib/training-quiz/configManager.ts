import { CognitiveLevel, QuizQuestion } from './types';
import { TRAINING_QUIZ_QUESTIONS } from './questionsData';

export interface TrainingQuizGeneralConfig {
  badgeText: string;
  title: string;
  subtitle: string;
  topicHighlight: string;
  description: string;
  hostCardTitle: string;
  hostCardDesc: string;
  playerCardTitle: string;
  playerCardDesc: string;
  footerText: string;
}

export interface TrainingQuizGameplayConfig {
  questionTimeLimitSeconds: number; // default 15
  previewDurationSeconds: number; // default 3
  maxQuestionsPerGame: number; // default 15 (0 means all active questions)
  shuffleQuestions: boolean; // default false
  shuffleOptions: boolean; // default false
  fastShortCircuit: boolean; // default true
  lockRoomOnStart: boolean; // default true
  baseMaxPoints: number; // default 1000
  allowPerQuestionTimeLimit: boolean; // default false
}

export interface TrainingQuizSystemConfig {
  general: TrainingQuizGeneralConfig;
  gameplay: TrainingQuizGameplayConfig;
  settings: TrainingQuizGameplayConfig;
  questions: QuizQuestion[];
  updated_at: string;
}

const VALID_LEVELS: readonly CognitiveLevel[] = [
  'Nhận biết',
  'Thông hiểu',
  'Tình huống thực tế',
] as const;

const DEFAULT_GAMEPLAY_CONFIG: TrainingQuizGameplayConfig = {
  questionTimeLimitSeconds: 15,
  previewDurationSeconds: 3,
  maxQuestionsPerGame: 15,
  shuffleQuestions: false,
  shuffleOptions: false,
  fastShortCircuit: true,
  lockRoomOnStart: true,
  baseMaxPoints: 1000,
  allowPerQuestionTimeLimit: false,
};

export const DEFAULT_TRAINING_QUIZ_CONFIG: TrainingQuizSystemConfig = {
  general: {
    badgeText: 'TRÒ CHƠI TẬP HUẤN TRỰC TIẾP (LIVE QUIZ)',
    title: 'Đấu Trí Đoàn - Hội HCMUTE',
    subtitle: 'Chuyên đề:',
    topicHighlight: 'Công tác xây dựng kế hoạch và tổ chức hoạt động',
    description:
      'Tương tác thời gian thực với bộ câu hỏi trắc nghiệm tốc độ cao.',
    hostCardTitle: 'Màn hình Giảng viên (Host)',
    hostCardDesc:
      'Dành cho báo cáo viên chiếu lên màn hình lớn: tạo mã phòng PIN & mã QR, điều khiển nhịp độ câu hỏi, xem thống kê đáp án và bục vinh danh Top 3.',
    playerCardTitle: 'Màn hình Học viên (Player)',
    playerCardDesc:
      'Dành cho học viên tham gia trên điện thoại: quét QR hoặc nhập mã PIN 6 ký tự, chạm chọn nhanh 4 biểu tượng màu sắc và tích lũy chuỗi đúng.',
    footerText:
      'Đoàn Thanh niên - Hội Sinh viên Trường ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)',
  },
  gameplay: { ...DEFAULT_GAMEPLAY_CONFIG },
  settings: { ...DEFAULT_GAMEPLAY_CONFIG },
  questions: TRAINING_QUIZ_QUESTIONS.map((q) => ({
    ...q,
    timeLimitSeconds: q.timeLimit,
    options: [...q.options] as [string, string, string, string],
    active: true,
  })),
  updated_at: '2026-04-20T00:00:00.000Z',
};

declare global {
  // eslint-disable-next-line no-var
  var __TRAINING_QUIZ_CONFIG__: TrainingQuizSystemConfig | undefined;
  // eslint-disable-next-line no-var
  var __TRAINING_QUIZ_CONFIG_FETCHED_AT__: number | undefined;
}

export function normalizeCognitiveLevel(val: unknown): CognitiveLevel {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();
    if (lower.includes('nhận biết') || lower.includes('nhan biet') || lower === '1' || lower === 'dễ' || lower === 'de') {
      return 'Nhận biết';
    }
    if (lower.includes('thông hiểu') || lower.includes('thong hieu') || lower === '2' || lower === 'trung bình' || lower === 'trung binh') {
      return 'Thông hiểu';
    }
    if (
      lower.includes('tình huống') ||
      lower.includes('tinh huong') ||
      lower.includes('vận dụng') ||
      lower.includes('van dung') ||
      lower === '3' ||
      lower === 'khó' ||
      lower === 'kho'
    ) {
      return 'Tình huống thực tế';
    }
    if ((VALID_LEVELS as readonly string[]).includes(trimmed)) {
      return trimmed as CognitiveLevel;
    }
  }
  return 'Nhận biết';
}

export function normalizeQuizQuestion(
  raw: Partial<QuizQuestion> | null | undefined,
  index: number,
  defaultTimeLimitSeconds = 15
): QuizQuestion {
  const questionText =
    typeof raw?.question === 'string' && raw.question.trim()
      ? raw.question.trim()
      : `Câu hỏi ${index + 1}`;

  const rawOptions = Array.isArray(raw?.options) ? raw.options : [];
  const options: [string, string, string, string] = [
    typeof rawOptions[0] === 'string' && rawOptions[0].trim() ? rawOptions[0].trim() : 'Phương án A',
    typeof rawOptions[1] === 'string' && rawOptions[1].trim() ? rawOptions[1].trim() : 'Phương án B',
    typeof rawOptions[2] === 'string' && rawOptions[2].trim() ? rawOptions[2].trim() : 'Phương án C',
    typeof rawOptions[3] === 'string' && rawOptions[3].trim() ? rawOptions[3].trim() : 'Phương án D',
  ];

  const correctIndexNum = Number(raw?.correctIndex);
  const correctIndex =
    Number.isInteger(correctIndexNum) && correctIndexNum >= 0 && correctIndexNum <= 3
      ? correctIndexNum
      : 0;

  const timeLimitNum = Number(raw?.timeLimitSeconds ?? raw?.timeLimit);
  const timeLimit =
    Number.isFinite(timeLimitNum) && timeLimitNum >= 3 && timeLimitNum <= 300
      ? Math.round(timeLimitNum)
      : defaultTimeLimitSeconds;

  const explanation =
    typeof raw?.explanation === 'string' && raw.explanation.trim()
      ? raw.explanation.trim()
      : `Đáp án đúng là phương án ${['A', 'B', 'C', 'D'][correctIndex]}: ${options[correctIndex]}`;

  return {
    id: index + 1,
    question: questionText,
    level: normalizeCognitiveLevel(raw?.level),
    timeLimit,
    timeLimitSeconds: timeLimit,
    options,
    correctIndex,
    explanation,
    active: raw?.active !== false,
  };
}

export function normalizeQuizConfig(
  raw: Partial<TrainingQuizSystemConfig> | null | undefined
): TrainingQuizSystemConfig {
  const def = DEFAULT_TRAINING_QUIZ_CONFIG;
  const g = raw?.general || ({} as Partial<TrainingQuizGeneralConfig>);
  const gp: Partial<TrainingQuizGameplayConfig> = {
    ...(raw?.gameplay || {}),
    ...(raw?.settings || {}),
  };

  const questionTimeLimitSeconds = Math.min(
    300,
    Math.max(3, Math.round(Number(gp.questionTimeLimitSeconds) || def.gameplay.questionTimeLimitSeconds))
  );
  const previewDurationSeconds = Math.min(
    15,
    Math.max(0, Math.round(Number(gp.previewDurationSeconds ?? def.gameplay.previewDurationSeconds)))
  );
  const rawMaxQ = Number(gp.maxQuestionsPerGame);
  const maxQuestionsPerGame =
    Number.isFinite(rawMaxQ) && rawMaxQ >= 0
      ? Math.round(rawMaxQ)
      : def.gameplay.maxQuestionsPerGame;
  const baseMaxPoints = Math.min(
    10000,
    Math.max(100, Math.round(Number(gp.baseMaxPoints) || def.gameplay.baseMaxPoints))
  );

  const rawQuestions =
    Array.isArray(raw?.questions) && raw.questions.length > 0
      ? raw.questions
      : def.questions;

  const questions = rawQuestions.map((q, idx) =>
    normalizeQuizQuestion(q, idx, questionTimeLimitSeconds)
  );

  const normalizedGameplay: TrainingQuizGameplayConfig = {
    questionTimeLimitSeconds,
    previewDurationSeconds,
    maxQuestionsPerGame,
    shuffleQuestions: Boolean(gp.shuffleQuestions ?? def.gameplay.shuffleQuestions),
    shuffleOptions: Boolean(gp.shuffleOptions ?? def.gameplay.shuffleOptions),
    fastShortCircuit: gp.fastShortCircuit !== false,
    lockRoomOnStart: gp.lockRoomOnStart !== false,
    baseMaxPoints,
    allowPerQuestionTimeLimit: Boolean(
      gp.allowPerQuestionTimeLimit ?? def.gameplay.allowPerQuestionTimeLimit
    ),
  };

  return {
    general: {
      badgeText:
        typeof g.badgeText === 'string' && g.badgeText.trim()
          ? g.badgeText.trim()
          : def.general.badgeText,
      title:
        typeof g.title === 'string' && g.title.trim() ? g.title.trim() : def.general.title,
      subtitle:
        typeof g.subtitle === 'string' && g.subtitle.trim()
          ? g.subtitle.trim()
          : def.general.subtitle,
      topicHighlight:
        typeof g.topicHighlight === 'string' && g.topicHighlight.trim()
          ? g.topicHighlight.trim()
          : def.general.topicHighlight,
      description:
        typeof g.description === 'string' && g.description.trim()
          ? g.description.trim()
          : def.general.description,
      hostCardTitle:
        typeof g.hostCardTitle === 'string' && g.hostCardTitle.trim()
          ? g.hostCardTitle.trim()
          : def.general.hostCardTitle,
      hostCardDesc:
        typeof g.hostCardDesc === 'string' && g.hostCardDesc.trim()
          ? g.hostCardDesc.trim()
          : def.general.hostCardDesc,
      playerCardTitle:
        typeof g.playerCardTitle === 'string' && g.playerCardTitle.trim()
          ? g.playerCardTitle.trim()
          : def.general.playerCardTitle,
      playerCardDesc:
        typeof g.playerCardDesc === 'string' && g.playerCardDesc.trim()
          ? g.playerCardDesc.trim()
          : def.general.playerCardDesc,
      footerText:
        typeof g.footerText === 'string' && g.footerText.trim()
          ? g.footerText.trim()
          : def.general.footerText,
    },
    gameplay: normalizedGameplay,
    settings: normalizedGameplay,
    questions,
    updated_at:
      typeof raw?.updated_at === 'string' && raw.updated_at
        ? raw.updated_at
        : def.updated_at,
  };
}

export function getActiveQuizConfig(): TrainingQuizSystemConfig {
  if (globalThis.__TRAINING_QUIZ_CONFIG__) {
    return globalThis.__TRAINING_QUIZ_CONFIG__;
  }
  return DEFAULT_TRAINING_QUIZ_CONFIG;
}

export function setActiveQuizConfig(
  config: Partial<TrainingQuizSystemConfig>
): TrainingQuizSystemConfig {
  const normalized = normalizeQuizConfig(config);
  globalThis.__TRAINING_QUIZ_CONFIG__ = normalized;
  globalThis.__TRAINING_QUIZ_CONFIG_FETCHED_AT__ = Date.now();
  return normalized;
}

export function resetActiveQuizConfigToDefault(): TrainingQuizSystemConfig {
  const fresh = normalizeQuizConfig({
    ...DEFAULT_TRAINING_QUIZ_CONFIG,
    updated_at: new Date().toISOString(),
  });
  globalThis.__TRAINING_QUIZ_CONFIG__ = fresh;
  globalThis.__TRAINING_QUIZ_CONFIG_FETCHED_AT__ = Date.now();
  return fresh;
}

/**
 * Builds the concrete list of QuizQuestion items for a new room based on active system config.
 */
export function buildRoomQuestionsFromConfig(
  config: TrainingQuizSystemConfig = getActiveQuizConfig()
): QuizQuestion[] {
  const activePool = config.questions.filter((q) => q.active !== false);
  const pool =
    activePool.length > 0
      ? activePool
      : config.questions.length > 0
      ? config.questions
      : TRAINING_QUIZ_QUESTIONS;

  let selected = pool.map((q) => ({
    ...q,
    options: [...q.options] as [string, string, string, string],
  }));

  if (config.gameplay.shuffleQuestions && selected.length > 1) {
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }
  }

  const maxQ = config.gameplay.maxQuestionsPerGame;
  if (maxQ > 0 && maxQ < selected.length) {
    selected = selected.slice(0, maxQ);
  }

  return selected.map((q, idx) => {
    let options = [...q.options] as [string, string, string, string];
    let correctIndex = q.correctIndex;

    if (config.gameplay.shuffleOptions) {
      const pairs = options.map((opt, i) => ({ opt, isCorrect: i === correctIndex }));
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      options = [pairs[0].opt, pairs[1].opt, pairs[2].opt, pairs[3].opt];
      correctIndex = pairs.findIndex((p) => p.isCorrect);
    }

    const effectiveTimeLimit = config.gameplay.allowPerQuestionTimeLimit
      ? q.timeLimit || config.gameplay.questionTimeLimitSeconds
      : config.gameplay.questionTimeLimitSeconds;

    return {
      ...q,
      id: idx + 1,
      timeLimit: effectiveTimeLimit,
      options,
      correctIndex,
      active: true,
    };
  });
}
