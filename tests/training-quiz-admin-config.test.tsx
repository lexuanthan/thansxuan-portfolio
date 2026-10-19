import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  DEFAULT_TRAINING_QUIZ_CONFIG,
  getActiveQuizConfig,
  setActiveQuizConfig,
  resetActiveQuizConfigToDefault,
  buildRoomQuestionsFromConfig,
} from '@/lib/training-quiz/configManager';
import {
  generateQuizExcelBuffer,
  generateQuizCsvContent,
  parseQuizExcelBuffer,
} from '@/lib/training-quiz/excelParser';
import { quizRoomManager } from '@/lib/training-quiz/roomManager';
import TrainingQuizAdminClient from '@/app/admin/training-quiz/TrainingQuizAdminClient';

describe('Training Quiz Admin Customization & Excel Import/Export', () => {
  beforeEach(() => {
    resetActiveQuizConfigToDefault();
    quizRoomManager.reset();
  });

  it('supports customizing question content, question count (maxQuestionsPerGame), and countdown timer', () => {
    const customConfig = {
      ...DEFAULT_TRAINING_QUIZ_CONFIG,
      general: {
        ...DEFAULT_TRAINING_QUIZ_CONFIG.general,
        title: 'Hội Thi Cán Bộ Đoàn Giỏi 2026',
        subtitle: 'Vòng Chung Kết Trực Tiếp',
      },
      settings: {
        ...DEFAULT_TRAINING_QUIZ_CONFIG.settings,
        questionTimeLimitSeconds: 25,
        previewDurationSeconds: 5,
        maxQuestionsPerGame: 5,
        shuffleQuestions: false,
        shuffleOptions: false,
        baseMaxPoints: 2000,
      },
      questions: DEFAULT_TRAINING_QUIZ_CONFIG.questions.map((q, idx) =>
        idx === 0
          ? {
              ...q,
              question: 'Câu hỏi tùy chỉnh số 1 từ Admin?',
              options: ['Đáp án Mới A', 'Đáp án Mới B', 'Đáp án Mới C', 'Đáp án Mới D'] as [
                string,
                string,
                string,
                string,
              ],
              correctIndex: 2,
              timeLimitSeconds: 25,
            }
          : q
      ),
    };

    const normalized = setActiveQuizConfig(customConfig);
    expect(normalized.settings.questionTimeLimitSeconds).toBe(25);
    expect(normalized.settings.maxQuestionsPerGame).toBe(5);

    const builtQuestions = buildRoomQuestionsFromConfig(getActiveQuizConfig());
    expect(builtQuestions).toHaveLength(5);
    expect(builtQuestions[0].question).toBe('Câu hỏi tùy chỉnh số 1 từ Admin?');
    expect(builtQuestions[0].options[2]).toBe('Đáp án Mới C');
    expect(builtQuestions[0].correctIndex).toBe(2);

    // Verify new room inherits customized settings
    const { room } = quizRoomManager.createRoom({ customCode: 'ADM001' });
    expect(room.questions).toHaveLength(5);
    expect(room.questionTimeLimitSeconds).toBe(25);
    expect(room.previewDurationSeconds).toBe(5);
    expect(room.baseMaxPoints).toBe(2000);
    expect(room.programTitle).toBe('Hội Thi Cán Bộ Đoàn Giỏi 2026');

    const p1 = room.joinPlayer('Minh Anh', 'Chi đoàn CNTT');
    room.startGame(room.hostToken);
    room.transitionToQuestionActive();
    expect(room.questionStartTime).toBeDefined();
    expect((room.questionDeadline || 0) - (room.questionStartTime || 0)).toBe(25000);

    // Submit correct answer C (index 2) after 2.5s
    const submission = room.submitAnswer({
      playerId: p1.id,
      questionIndex: 0,
      selectedIndex: 2,
      clientTimeMs: (room.questionStartTime || Date.now()) + 2500,
    });
    expect(submission?.isCorrect).toBe(true);
    expect(submission?.points).toBeGreaterThan(1500);
  });

  it('generates valid binary .xlsx buffer and parses it back accurately (roundtrip)', async () => {
    const sampleQuestions = DEFAULT_TRAINING_QUIZ_CONFIG.questions.slice(0, 4);
    const xlsxBuffer = generateQuizExcelBuffer(sampleQuestions);
    expect(xlsxBuffer.byteLength).toBeGreaterThan(500);

    const parsed = await parseQuizExcelBuffer(
      xlsxBuffer.buffer.slice(
        xlsxBuffer.byteOffset,
        xlsxBuffer.byteOffset + xlsxBuffer.byteLength
      ) as ArrayBuffer,
      'mau-cau-hoi.xlsx',
      20
    );

    expect(parsed.warnings).toHaveLength(0);
    expect(parsed.questions).toHaveLength(4);
    expect(parsed.questions[0].question).toBe(sampleQuestions[0].question);
    expect(parsed.questions[0].options).toEqual(sampleQuestions[0].options);
    expect(parsed.questions[0].correctIndex).toBe(sampleQuestions[0].correctIndex);
    expect(parsed.questions[0].level).toBe(sampleQuestions[0].level);
    expect(parsed.questions[0].explanation).toBe(sampleQuestions[0].explanation);
  });

  it('parses CSV and Excel-pasted TSV content with Vietnamese headers', async () => {
    const csvContent = generateQuizCsvContent(
      DEFAULT_TRAINING_QUIZ_CONFIG.questions.slice(0, 3)
    );
    const encoder = new TextEncoder();
    const uint8 = encoder.encode(csvContent);

    const parsed = await parseQuizExcelBuffer(
      uint8.buffer.slice(
        uint8.byteOffset,
        uint8.byteOffset + uint8.byteLength
      ) as ArrayBuffer,
      'danh-sach.csv',
      15
    );

    expect(parsed.questions).toHaveLength(3);
    expect(parsed.questions[1].question).toBe(
      DEFAULT_TRAINING_QUIZ_CONFIG.questions[1].question
    );
    expect(parsed.questions[2].correctIndex).toBe(
      DEFAULT_TRAINING_QUIZ_CONFIG.questions[2].correctIndex
    );
  });

  it('renders TrainingQuizAdminClient and allows editing questions, timers, and question counts', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        ok: true,
        config: getActiveQuizConfig(),
        message: 'Đã lưu cấu hình thành công!',
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <TrainingQuizAdminClient initialConfig={DEFAULT_TRAINING_QUIZ_CONFIG} />
    );

    expect(screen.getByTestId('training-quiz-admin')).toBeTruthy();
    expect(screen.getByTestId('kpi-total-questions').textContent).toBe('15');
    expect(screen.getByTestId('kpi-countdown-seconds').textContent).toBe('15s');

    // Add a new question
    fireEvent.click(screen.getByTestId('add-question-btn'));
    expect(screen.getByTestId('kpi-total-questions').textContent).toBe('16');

    // Switch to Settings tab and change countdown timer to 30s & max questions to 10
    fireEvent.click(screen.getByTestId('tab-settings'));
    expect(screen.getByTestId('settings-panel')).toBeTruthy();

    fireEvent.click(screen.getByTestId('preset-timer-30'));
    expect(screen.getByTestId('kpi-countdown-seconds').textContent).toBe('30s');

    fireEvent.click(screen.getByTestId('preset-qcount-10'));
    expect(screen.getByTestId('kpi-game-questions').textContent).toBe('10');

    // Switch to General tab and update title
    fireEvent.click(screen.getByTestId('tab-general'));
    const titleInput = screen.getByTestId('input-general-title');
    fireEvent.change(titleInput, {
      target: { value: 'Đấu Trí Cán Bộ Đoàn 2026' },
    });

    // Save changes
    fireEvent.click(screen.getByTestId('save-quiz-config-btn'));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    vi.unstubAllGlobals();
  });
});
