import { describe, it, expect } from 'vitest';
import { TRAINING_QUIZ_QUESTIONS } from '../src/lib/training-quiz/questionsData';
import { CognitiveLevel, QuizQuestion } from '../src/lib/training-quiz/types';

describe('Training Quiz Questions Data Integrity', () => {
  it('should contain exactly 15 questions', () => {
    expect(TRAINING_QUIZ_QUESTIONS).toBeDefined();
    expect(Array.isArray(TRAINING_QUIZ_QUESTIONS)).toBe(true);
    expect(TRAINING_QUIZ_QUESTIONS.length).toBe(15);
  });

  it('should have strictly sequential IDs from 1 to 15', () => {
    TRAINING_QUIZ_QUESTIONS.forEach((q, index) => {
      expect(q.id).toBe(index + 1);
    });
  });

  it('should have balanced cognitive levels: exactly 5 Nhận biết, 5 Thông hiểu, 5 Tình huống thực tế', () => {
    const counts: Record<CognitiveLevel, number> = {
      'Nhận biết': 0,
      'Thông hiểu': 0,
      'Tình huống thực tế': 0,
    };

    TRAINING_QUIZ_QUESTIONS.forEach((q) => {
      expect(['Nhận biết', 'Thông hiểu', 'Tình huống thực tế']).toContain(q.level);
      counts[q.level]++;
    });

    expect(counts['Nhận biết']).toBe(5);
    expect(counts['Thông hiểu']).toBe(5);
    expect(counts['Tình huống thực tế']).toBe(5);
  });

  it('should organize cognitive levels in blocks (1-5 Nhận biết, 6-10 Thông hiểu, 11-15 Tình huống thực tế)', () => {
    const block1 = TRAINING_QUIZ_QUESTIONS.slice(0, 5);
    const block2 = TRAINING_QUIZ_QUESTIONS.slice(5, 10);
    const block3 = TRAINING_QUIZ_QUESTIONS.slice(10, 15);

    block1.forEach((q) => expect(q.level).toBe('Nhận biết'));
    block2.forEach((q) => expect(q.level).toBe('Thông hiểu'));
    block3.forEach((q) => expect(q.level).toBe('Tình huống thực tế'));
  });

  it('should enforce 15-second timeLimit on every question', () => {
    TRAINING_QUIZ_QUESTIONS.forEach((q) => {
      expect(q.timeLimit).toBe(15);
    });
  });

  it('should have non-empty question text with proper Vietnamese diacritics', () => {
    TRAINING_QUIZ_QUESTIONS.forEach((q) => {
      expect(typeof q.question).toBe('string');
      expect(q.question.trim().length).toBeGreaterThan(20);
      // Verify presence of Vietnamese accented vowels
      expect(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(q.question)).toBe(true);
    });
  });

  it('should have exactly 4 distinct, non-empty options for every question', () => {
    TRAINING_QUIZ_QUESTIONS.forEach((q) => {
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBe(4);

      // Check all options are non-empty
      q.options.forEach((opt) => {
        expect(typeof opt).toBe('string');
        expect(opt.trim().length).toBeGreaterThan(0);
      });

      // Check distinct options
      const uniqueOptions = new Set(q.options);
      expect(uniqueOptions.size).toBe(4);
    });
  });

  it('should have valid correctIndex between 0 and 3 pointing to a valid option', () => {
    TRAINING_QUIZ_QUESTIONS.forEach((q) => {
      expect(Number.isInteger(q.correctIndex)).toBe(true);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);

      const correctOption = q.options[q.correctIndex];
      expect(correctOption).toBeDefined();
      expect(correctOption.trim().length).toBeGreaterThan(0);
    });
  });

  it('should have detailed, authentic explanations citing HCMUTE training slides', () => {
    TRAINING_QUIZ_QUESTIONS.forEach((q) => {
      expect(typeof q.explanation).toBe('string');
      expect(q.explanation.trim().length).toBeGreaterThan(30);
      // Explanations should cite Slide / căn cứ
      expect(q.explanation).toMatch(/Slide|Căn cứ/i);
    });
  });

  it('should conform to QuizQuestion interface structure', () => {
    const requiredKeys: (keyof QuizQuestion)[] = [
      'id',
      'question',
      'level',
      'timeLimit',
      'options',
      'correctIndex',
      'explanation',
    ];

    TRAINING_QUIZ_QUESTIONS.forEach((q) => {
      requiredKeys.forEach((key) => {
        expect(q).toHaveProperty(key);
      });
    });
  });
});
