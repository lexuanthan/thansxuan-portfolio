import React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuizRoom } from '@/lib/training-quiz/roomEngine';
import { TRAINING_QUIZ_QUESTIONS } from '@/lib/training-quiz/questionsData';
import {
  ShapeTriangle,
  ShapeDiamond,
  ShapeCircle,
  ShapeSquare,
  QuizShapeIcon,
  SHAPE_THEMES,
} from '@/components/training-quiz/common/QuizShapes';
import { QuizQrCode } from '@/components/training-quiz/QuizQrCode';
import { quizSound } from '@/components/training-quiz/QuizSound';
import { HostView } from '@/components/training-quiz/HostView';
import { PlayerView } from '@/components/training-quiz/PlayerView';

describe('1. QuizShapes & Icons Component Tests', () => {
  it('renders all 4 individual geometric shapes with correct test-ids', () => {
    const { container: c1 } = render(React.createElement(ShapeTriangle));
    expect(c1.querySelector('[data-testid="shape-triangle"]')).not.toBeNull();

    const { container: c2 } = render(React.createElement(ShapeDiamond));
    expect(c2.querySelector('[data-testid="shape-diamond"]')).not.toBeNull();

    const { container: c3 } = render(React.createElement(ShapeCircle));
    expect(c3.querySelector('[data-testid="shape-circle"]')).not.toBeNull();

    const { container: c4 } = render(React.createElement(ShapeSquare));
    expect(c4.querySelector('[data-testid="shape-square"]')).not.toBeNull();
  });

  it('QuizShapeIcon renders correct shape based on numeric index (0 to 3) and letter index (A to D)', () => {
    const { container: c0 } = render(React.createElement(QuizShapeIcon, { index: 0 }));
    expect(c0.querySelector('[data-testid="shape-triangle"]')).not.toBeNull();

    const { container: c1 } = render(React.createElement(QuizShapeIcon, { index: 1 }));
    expect(c1.querySelector('[data-testid="shape-diamond"]')).not.toBeNull();

    const { container: c2 } = render(React.createElement(QuizShapeIcon, { index: 2 }));
    expect(c2.querySelector('[data-testid="shape-circle"]')).not.toBeNull();

    const { container: c3 } = render(React.createElement(QuizShapeIcon, { index: 3 }));
    expect(c3.querySelector('[data-testid="shape-square"]')).not.toBeNull();

    // By letters
    const { container: cA } = render(React.createElement(QuizShapeIcon, { index: 'A' }));
    expect(cA.querySelector('[data-testid="shape-triangle"]')).not.toBeNull();

    const { container: cD } = render(React.createElement(QuizShapeIcon, { index: 'D' }));
    expect(cD.querySelector('[data-testid="shape-square"]')).not.toBeNull();
  });

  it('SHAPE_THEMES defines 4 vibrant Kahoot colors and configurations', () => {
    expect(SHAPE_THEMES).toHaveLength(4);
    expect(SHAPE_THEMES[0].letter).toBe('A');
    expect(SHAPE_THEMES[1].letter).toBe('B');
    expect(SHAPE_THEMES[2].letter).toBe('C');
    expect(SHAPE_THEMES[3].letter).toBe('D');

    for (const theme of SHAPE_THEMES) {
      expect(theme.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.bgClass).toContain('bg-');
    }
  });
});

describe('2. QuizQrCode Component Tests', () => {
  it('renders SVG QR code with correct aria label and container', () => {
    const testUrl = 'https://thansxuan.edu.vn/ai-tools/training-quiz?mode=player&room=UTE202';
    render(React.createElement(QuizQrCode, { value: testUrl, size: 200 }));

    const container = screen.getByTestId('quiz-qr-code');
    expect(container).toBeDefined();

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-label')).toBe(`Mã QR: ${testUrl}`);
    expect(svg?.querySelector('path')).not.toBeNull();
    expect(svg?.querySelector('rect')).not.toBeNull();
  });

  it('handles custom styling and colors', () => {
    const { container } = render(
      React.createElement(QuizQrCode, {
        value: 'ROOM123',
        size: 150,
        fgColor: '#004098',
        bgColor: '#f8fafc',
      })
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('fill')).toBe('#f8fafc');

    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('#004098');
  });
});

describe('3. QuizSound Synthesizer Tests', () => {
  it('toggles mute state correctly', () => {
    quizSound.mute();
    expect(quizSound.isMuted()).toBe(true);

    quizSound.unmute();
    expect(quizSound.isMuted()).toBe(false);

    quizSound.toggleMute();
    expect(quizSound.isMuted()).toBe(true);

    quizSound.unmute();
  });

  it('synthesizer methods execute without error in test environment', () => {
    expect(() => {
      quizSound.unlockAudio();
      quizSound.playTick();
      quizSound.playTickFast();
      quizSound.playQuestionStart();
      quizSound.playCorrect();
      quizSound.playWrong();
      quizSound.playStreak();
      quizSound.playPodium();
    }).not.toThrow();
  });
});

describe('4. HostView Component Lifecycle & State Rendering', () => {
  let room: QuizRoom;

  beforeEach(() => {
    room = new QuizRoom({
      roomCode: 'UTE888',
      questions: TRAINING_QUIZ_QUESTIONS,
      previewDurationMs: 3000,
      questionTimeLimitMs: 15000,
    });
  });

  it('renders LOBBY state with room PIN, QR code, and disabled start button when no players', () => {
    render(React.createElement(HostView, { standaloneRoom: room }));

    expect(screen.getByTestId('host-view')).toBeDefined();
    expect(screen.getByTestId('host-lobby')).toBeDefined();
    expect(screen.getByTestId('big-room-pin').textContent).toBe('UTE888');

    const startBtn = screen.getByTestId('start-game-btn');
    expect(startBtn.hasAttribute('disabled')).toBe(true);
  });

  it('enables start button and displays player chips when players join', () => {
    render(React.createElement(HostView, { standaloneRoom: room }));

    act(() => {
      room.joinPlayer('Nguyễn Văn A', 'Chi đoàn CLC 2022');
      room.joinPlayer('Trần Thị B', 'Khoa Cơ Khí');
    });

    const playerChips = screen.getByTestId('player-chips');
    expect(playerChips.textContent).toContain('Nguyễn Văn A');
    expect(playerChips.textContent).toContain('Trần Thị B');

    const startBtn = screen.getByTestId('start-game-btn');
    expect(startBtn.hasAttribute('disabled')).toBe(false);
  });

  it('transitions to QUESTION_START upon starting game', () => {
    render(React.createElement(HostView, { standaloneRoom: room }));

    act(() => {
      room.joinPlayer('Nguyễn Văn A');
      room.startGame(room.hostToken);
    });

    expect(screen.getByTestId('question-start')).toBeDefined();
    expect(screen.getByText(/Câu 1 \/ 15/i)).toBeDefined();
    expect(screen.getByText(TRAINING_QUIZ_QUESTIONS[0].question)).toBeDefined();
  });

  it('transitions to QUESTION_ACTIVE and renders 15s timer and 4 Kahoot option cards', () => {
    render(React.createElement(HostView, { standaloneRoom: room }));

    act(() => {
      room.joinPlayer('Nguyễn Văn A');
      room.startGame(room.hostToken);
      room.transitionToQuestionActive();
    });

    expect(screen.getByTestId('question-active')).toBeDefined();
    expect(screen.getByTestId('countdown-timer')).toBeDefined();
    expect(screen.getByTestId('live-submission-count')).toBeDefined();

    // Question options
    expect(screen.getByText(TRAINING_QUIZ_QUESTIONS[0].options[0])).toBeDefined();
    expect(screen.getByText(TRAINING_QUIZ_QUESTIONS[0].options[1])).toBeDefined();
    expect(screen.getByText(TRAINING_QUIZ_QUESTIONS[0].options[2])).toBeDefined();
    expect(screen.getByText(TRAINING_QUIZ_QUESTIONS[0].options[3])).toBeDefined();
  });

  it('transitions to QUESTION_REVEAL and highlights correct answer, explanation, and fastest player', () => {
    render(React.createElement(HostView, { standaloneRoom: room }));

    act(() => {
      const p1 = room.joinPlayer('Nguyễn Văn A', 'Chi đoàn CLC');
      room.startGame(room.hostToken);
      room.transitionToQuestionActive();

      // Submit correct answer
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: TRAINING_QUIZ_QUESTIONS[0].correctIndex,
        clientTimeMs: Date.now(),
      });
    });

    expect(screen.getByTestId('question-reveal')).toBeDefined();
    expect(screen.getByText(/✓ ĐÁP ÁN ĐÚNG/i)).toBeDefined();
    expect(screen.getByTestId('explanation-text').textContent).toBe(
      TRAINING_QUIZ_QUESTIONS[0].explanation
    );
    expect(screen.getByTestId('fastest-player-name').textContent).toContain('Nguyễn Văn A');
  });

  it('transitions to LEADERBOARD and displays standings', () => {
    render(React.createElement(HostView, { standaloneRoom: room }));

    act(() => {
      const p1 = room.joinPlayer('Nguyễn Văn A');
      room.startGame(room.hostToken);
      room.transitionToQuestionActive();
      room.submitAnswer({
        playerId: p1.id,
        questionIndex: 0,
        selectedIndex: TRAINING_QUIZ_QUESTIONS[0].correctIndex,
        clientTimeMs: Date.now(),
      });
      room.transitionToLeaderboard(room.hostToken);
    });

    expect(screen.getByTestId('leaderboard-view')).toBeDefined();
    expect(screen.getByTestId('leaderboard-item-0')).toBeDefined();
    expect(screen.getByTestId('advance-next-btn')).toBeDefined();
  });

  it('transitions to FINAL_RESULTS and displays Podium Top 3, Remaining Players (#4+), Lightning Award, and Full Leaderboard Table by default', () => {
    render(React.createElement(HostView, { standaloneRoom: room }));

    act(() => {
      const p1 = room.joinPlayer('Nguyễn Văn A', 'Chi đoàn 1');
      const p2 = room.joinPlayer('Trần Thị B', 'Chi đoàn 2');
      const p3 = room.joinPlayer('Lê Văn C', 'Chi đoàn 3');
      const p4 = room.joinPlayer('Phạm Thị D', 'Chi đoàn 4');
      const p5 = room.joinPlayer('Hoàng Văn E', 'Chi đoàn 5');

      p1.score = 14500;
      p1.correctCount = 14;
      p2.score = 12000;
      p2.correctCount = 12;
      p3.score = 10500;
      p3.correctCount = 10;
      p4.score = 8900;
      p4.correctCount = 9;
      p5.score = 7200;
      p5.correctCount = 7;

      room.endGame(room.hostToken);
    });

    expect(screen.getByTestId('final-results-view')).toBeDefined();
    expect(screen.getByTestId('podium-section')).toBeDefined();
    expect(screen.getByTestId('podium-rank-1').textContent).toContain('Nguyễn Văn A');
    expect(screen.getByTestId('podium-rank-1').textContent).toContain('14');
    expect(screen.getByTestId('podium-rank-2').textContent).toContain('Trần Thị B');
    expect(screen.getByTestId('podium-rank-3').textContent).toContain('Lê Văn C');

    // Remaining players (#4 and #5) shown directly below podium
    const remainingSection = screen.getByTestId('remaining-players-section');
    expect(remainingSection).toBeDefined();
    expect(screen.getByTestId('remaining-player-rank-4').textContent).toContain('Phạm Thị D');
    expect(screen.getByTestId('remaining-player-rank-5').textContent).toContain('Hoàng Văn E');

    // Full leaderboard table visible by default
    expect(screen.getByTestId('full-leaderboard-table')).toBeDefined();
    expect(screen.getByTestId('class-analytics')).toBeDefined();
  });
});

describe('5. PlayerView Component Lifecycle & Mobile Interaction', () => {
  let room: QuizRoom;

  beforeEach(() => {
    room = new QuizRoom({
      roomCode: 'UTE777',
      questions: TRAINING_QUIZ_QUESTIONS,
    });
  });

  it('renders Join Form with inputs and validates empty submissions', () => {
    render(React.createElement(PlayerView, { standaloneRoom: room }));

    expect(screen.getByTestId('player-join-form')).toBeDefined();
    const joinBtn = screen.getByTestId('join-submit-btn');

    // Submit with empty inputs
    fireEvent.click(joinBtn);
    expect(screen.getByText(/Vui lòng nhập mã phòng!/i)).toBeDefined();
  });

  it('successfully joins room and enters Lobby Waiting state', () => {
    render(
      React.createElement(PlayerView, {
        standaloneRoom: room,
        initialRoomCode: 'UTE777',
      })
    );

    const nicknameInput = screen.getByTestId('input-nickname');
    fireEvent.change(nicknameInput, { target: { value: 'Học viên Mẫu' } });

    const joinBtn = screen.getByTestId('join-submit-btn');
    fireEvent.click(joinBtn);

    expect(screen.getByTestId('player-lobby-waiting')).toBeDefined();
    expect(screen.getByText(/Xin chào, Học viên Mẫu!/i)).toBeDefined();
    expect(screen.getByText(/Chờ giảng viên bấm bắt đầu trò chơi/i)).toBeDefined();
  });

  it('renders 4 giant touch buttons in QUESTION_ACTIVE and locks option upon tap', () => {
    render(
      React.createElement(PlayerView, {
        standaloneRoom: room,
        initialRoomCode: 'UTE777',
      })
    );

    // 1. Join room
    fireEvent.change(screen.getByTestId('input-nickname'), {
      target: { value: 'Học viên A' },
    });
    fireEvent.click(screen.getByTestId('join-submit-btn'));

    // 2. Add second player so fast short-circuit is not triggered on single answer, then start
    act(() => {
      room.joinPlayer('Học viên B');
      room.startGame(room.hostToken);
      room.transitionToQuestionActive();
    });

    expect(screen.getByTestId('player-question-active')).toBeDefined();
    expect(screen.getByTestId('touch-options-grid')).toBeDefined();

    // 4 touch buttons present
    const opt0 = screen.getByTestId('player-option-0');
    const opt1 = screen.getByTestId('player-option-1');
    const opt2 = screen.getByTestId('player-option-2');
    const opt3 = screen.getByTestId('player-option-3');
    expect(opt0).toBeDefined();
    expect(opt1).toBeDefined();
    expect(opt2).toBeDefined();
    expect(opt3).toBeDefined();

    // 3. Tap option 0 (Red Triangle)
    fireEvent.click(opt0);

    // Answer locked banner appears immediately
    expect(screen.getByTestId('answer-locked-banner')).toBeDefined();
    expect(screen.getByText(/Đã ghi nhận câu trả lời!/i)).toBeDefined();
  });

  it('shows instant feedback and streak banner in QUESTION_REVEAL for correct answer', () => {
    render(
      React.createElement(PlayerView, {
        standaloneRoom: room,
        initialRoomCode: 'UTE777',
      })
    );

    // 1. Join
    fireEvent.change(screen.getByTestId('input-nickname'), {
      target: { value: 'Chiến Binh Đoàn' },
    });
    fireEvent.click(screen.getByTestId('join-submit-btn'));

    // 2. Start and activate
    act(() => {
      room.startGame(room.hostToken);
      room.transitionToQuestionActive();
    });

    // 3. Choose correct answer
    const correctIdx = TRAINING_QUIZ_QUESTIONS[0].correctIndex;
    const correctBtn = screen.getByTestId(`player-option-${correctIdx}`);
    fireEvent.click(correctBtn);

    // 4. Reveal
    act(() => {
      const players = Object.values(room.players);
      if (players[0]) {
        players[0].streak = 3;
      }
      room.transitionToQuestionReveal(true);
    });

    expect(screen.getByTestId('player-question-reveal')).toBeDefined();
    expect(screen.getByTestId('player-correct-screen')).toBeDefined();
    expect(screen.getByText(/CHÍNH XÁC!/i)).toBeDefined();
    expect(screen.getByTestId('streak-banner').textContent).toContain('Chuỗi đúng liên tiếp x3');
  });

  it('shows final certificate badge in FINAL_RESULTS', () => {
    render(
      React.createElement(PlayerView, {
        standaloneRoom: room,
        initialRoomCode: 'UTE777',
      })
    );

    // 1. Join
    fireEvent.change(screen.getByTestId('input-nickname'), {
      target: { value: 'Bí Thư Chi Đoàn' },
    });
    fireEvent.click(screen.getByTestId('join-submit-btn'));

    // 2. End game
    act(() => {
      const players = Object.values(room.players);
      if (players[0]) {
        players[0].score = 12500;
        players[0].correctCount = 13;
        players[0].maxStreak = 5;
      }
      room.endGame(room.hostToken);
    });

    expect(screen.getByTestId('player-final-results')).toBeDefined();
    expect(screen.getByTestId('player-final-rank')).toBeDefined();
    expect(screen.getByTestId('player-certificate-badge')).toBeDefined();
    expect(screen.getByText(/Quán Quân Đấu Trí Đoàn - Hội/i)).toBeDefined();
  });
});
