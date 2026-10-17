'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, QuizQuestion, PlayerState } from '@/lib/training-quiz/types';
import { TRAINING_QUIZ_QUESTIONS } from '@/lib/training-quiz/questionsData';
import { QuizRoom } from '@/lib/training-quiz/roomEngine';
import { SHAPE_THEMES, QuizShapeIcon } from './common/QuizShapes';
import { quizSound } from './QuizSound';

export interface PlayerViewProps {
  initialRoomCode?: string;
  initialNickname?: string;
  standaloneRoom?: QuizRoom;
  onExit?: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  initialRoomCode = '',
  initialNickname = '',
  standaloneRoom,
  onExit,
}) => {
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode.toUpperCase());
  const [nickname, setNickname] = useState<string>(initialNickname);
  const [unit, setUnit] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [state, setState] = useState<RoomState | null>(
    standaloneRoom ? standaloneRoom.getSanitizedState() : null
  );
  const [selectedOptionState, setSelectedOptionState] = useState<{
    questionIndex: number;
    option: number;
  } | null>(null);

  const selectedOption =
    selectedOptionState &&
    state &&
    selectedOptionState.questionIndex === state.currentQuestionIndex
      ? selectedOptionState.option
      : null;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleUserGesture = useCallback(() => {
    quizSound.unlockAudio();
  }, []);

  // Sync if standaloneRoom provided
  useEffect(() => {
    if (!standaloneRoom) return;

    const unsubscribe = standaloneRoom.subscribe(() => {
      setState(standaloneRoom.getSanitizedState({ requestingPlayerId: playerId }));
    });

    return () => {
      unsubscribe();
    };
  }, [standaloneRoom, playerId]);

  // Polling state when using API
  useEffect(() => {
    if (standaloneRoom || !joined || !roomCode || !playerId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/quiz/rooms?roomCode=${encodeURIComponent(roomCode)}&playerId=${encodeURIComponent(playerId)}`
        );
        if (res.ok) {
          const data = await res.json();
          setState(data.state || data);
        }
      } catch {
        // Ignore polling errors
      }
    }, 600);

    return () => clearInterval(interval);
  }, [standaloneRoom, joined, roomCode, playerId]);

  // Countdown timer in QUESTION_ACTIVE
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (state?.status === 'QUESTION_ACTIVE' && state.questionDeadline) {
      const updateTimer = () => {
        const now = Date.now();
        const diffMs = (state.questionDeadline || now) - now;
        const secs = Math.max(0, Math.ceil(diffMs / 1000));
        setRemainingSeconds(secs);
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 500);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [state?.status, state?.questionDeadline]);

  // Join handler
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    handleUserGesture();

    const trimmedCode = roomCode.trim().toUpperCase();
    const trimmedNick = nickname.trim();

    if (!trimmedCode) {
      setJoinError('Vui lòng nhập mã phòng!');
      return;
    }
    if (!trimmedNick) {
      setJoinError('Vui lòng nhập tên của bạn!');
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    // Standalone direct join
    if (standaloneRoom) {
      if (standaloneRoom.roomCode !== trimmedCode) {
        setJoinError(`Mã phòng không khớp! Phòng hiện tại là: ${standaloneRoom.roomCode}`);
        setIsJoining(false);
        return;
      }
      const player = standaloneRoom.joinPlayer(trimmedNick, unit.trim());
      setPlayerId(player.id);
      setJoined(true);
      setState(standaloneRoom.getSanitizedState({ requestingPlayerId: player.id }));
      setIsJoining(false);
      return;
    }

    // Network API Join
    try {
      const res = await fetch('/api/quiz/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          op: 'join',
          roomCode: trimmedCode,
          nickname: trimmedNick,
          unit: unit.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlayerId(data.playerId);
        setJoined(true);
        setState(data.state);
      } else {
        const err = await res.json().catch(() => ({}));
        setJoinError(err.error || 'Không thể tham gia phòng. Kiểm tra lại mã PIN!');
      }
    } catch {
      setJoinError('Lỗi kết nối tới máy chủ. Vui lòng thử lại!');
    } finally {
      setIsJoining(false);
    }
  };

  // Answer Submission handler
  const handleSelectOption = async (optionIndex: number) => {
    if (selectedOption !== null) return; // Locked on first tap!
    if (state?.status !== 'QUESTION_ACTIVE') return;

    handleUserGesture();
    const questionIndex = state.currentQuestionIndex;
    setSelectedOptionState({ questionIndex, option: optionIndex });

    const clientTimeMs = Date.now();

    if (standaloneRoom && playerId) {
      standaloneRoom.submitAnswer({
        playerId,
        questionIndex,
        selectedIndex: optionIndex,
        clientTimeMs,
      });
      setState(standaloneRoom.getSanitizedState({ requestingPlayerId: playerId }));
      return;
    }

    try {
      const res = await fetch('/api/quiz/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          op: 'answer',
          roomCode,
          playerId,
          questionIndex,
          selectedIndex: optionIndex,
          clientTimeMs,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        }
      }
    } catch {
      // Ignore network errors
    }
  };

  const myPlayer: PlayerState | undefined = playerId ? state?.players?.[playerId] : undefined;
  const myAnswer = myPlayer?.answers?.[state?.currentQuestionIndex ?? 0];

  // Calculate my rank
  const allPlayers = Object.values(state?.players || {}).sort(
    (a, b) => b.score - a.score || a.totalResponseTimeMs - b.totalResponseTimeMs
  );
  const myRank = myPlayer ? allPlayers.findIndex((p) => p.id === myPlayer.id) + 1 : 0;

  return (
    <div
      className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-brand-500"
      onClick={handleUserGesture}
      data-testid="player-view"
    >
      {/* Top Header */}
      <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-sm">
            ⚡
          </span>
          <div>
            <h1 className="text-sm font-extrabold text-white">ĐẤU TRÍ ĐOÀN - HỘI</h1>
            {joined && (
              <p className="text-xs text-slate-400 font-mono">Phòng: {roomCode}</p>
            )}
          </div>
        </div>

        {joined && myPlayer && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-amber-400 font-bold font-mono block" data-testid="player-score">
                {myPlayer.score.toLocaleString()} đ
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {myPlayer.nickname}
              </span>
            </div>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Thoát
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 max-w-md w-full mx-auto">
        {/* 1. JOIN FORM */}
        {!joined && (
          <div className="w-full bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6" data-testid="player-join-form">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-900/80 text-brand-300 border border-brand-700/60 uppercase">
                Gia nhập phòng chơi
              </span>
              <h2 className="text-2xl font-black text-white">
                Tham Gia Tranh Tài
              </h2>
              <p className="text-xs text-slate-400">
                Nhập mã phòng và tên của bạn để bắt đầu
              </p>
            </div>

            {joinError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs text-center font-medium">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase tracking-wider">
                  Mã phòng (Room PIN)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Ví dụ: UTE202"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border-2 border-slate-700 text-center text-2xl font-black font-mono tracking-widest text-amber-400 uppercase placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  data-testid="input-room-code"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase tracking-wider">
                  Tên của bạn (Nickname) *
                </label>
                <input
                  type="text"
                  maxLength={24}
                  placeholder="Nhập tên hiển thị trên bảng điểm"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border-2 border-slate-700 text-base font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  data-testid="input-nickname"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 uppercase tracking-wider">
                  Chi đoàn / Đơn vị (Không bắt buộc)
                </label>
                <input
                  type="text"
                  maxLength={32}
                  placeholder="Ví dụ: CLC 2022, Đoàn Khoa Cơ Khí"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border-2 border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
                  data-testid="input-unit"
                />
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-brand-600 to-accent-red-600 hover:from-brand-500 hover:to-accent-red-500 text-white shadow-lg shadow-brand-600/30 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
                data-testid="join-submit-btn"
              >
                {isJoining ? 'Đang vào phòng...' : 'VÀO PHÒNG CHỜ ➔'}
              </button>
            </form>
          </div>
        )}

        {/* 2. LOBBY WAITING SCREEN */}
        {joined && (!state || state.status === 'LOBBY') && (
          <div className="w-full text-center space-y-6 animate-fadeIn" data-testid="player-lobby-waiting">
            <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/20 animate-pulse">
              ✓
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 uppercase">
                Đã vào phòng thành công
              </span>
              <h2 className="text-3xl font-black text-white">
                Xin chào, {myPlayer?.nickname}!
              </h2>
              {myPlayer?.unit && (
                <p className="text-sm text-slate-400">{myPlayer.unit}</p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs text-amber-400 font-bold block uppercase tracking-wider animate-pulse">
                ⏳ Chờ giảng viên bấm bắt đầu trò chơi...
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nhìn lên màn hình máy chiếu của giảng viên để chuẩn bị đọc đề câu hỏi số 1.
              </p>
            </div>
          </div>
        )}

        {/* 3. QUESTION_START (3s Preview) */}
        {joined && state?.status === 'QUESTION_START' && (
          <div className="w-full text-center space-y-6 animate-fadeIn" data-testid="player-question-start">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-brand-900 text-brand-300 uppercase">
              Câu {state.currentQuestionIndex + 1} / 15
            </span>
            <h2 className="text-2xl font-black text-white">
              Chuẩn bị bấm câu trả lời!
            </h2>
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-3xl mx-auto flex items-center justify-center animate-bounce shadow-xl">
              3
            </div>
            <p className="text-xs text-slate-400">
              Quan sát câu hỏi và các phương án trên màn hình máy chiếu!
            </p>
          </div>
        )}

        {/* 4. QUESTION_ACTIVE (4 Touch Buttons) */}
        {joined && state?.status === 'QUESTION_ACTIVE' && (
          <div className="w-full flex flex-col space-y-4 animate-fadeIn" data-testid="player-question-active">
            {/* Countdown Header */}
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-black text-brand-400">
                CÂU {state.currentQuestionIndex + 1} / 15
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Còn lại:</span>
                <span
                  className={`font-mono font-black text-base px-2 py-0.5 rounded ${
                    remainingSeconds <= 3
                      ? 'bg-red-900 text-red-200 animate-ping'
                      : remainingSeconds <= 5
                      ? 'bg-amber-900 text-amber-200'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                  data-testid="player-timer"
                >
                  {remainingSeconds}s
                </span>
              </div>
            </div>

            {/* If option selected: Locked feedback state */}
            {selectedOption !== null ? (
              <div className="py-12 px-6 rounded-3xl bg-slate-900 border-2 border-slate-700 text-center space-y-4 shadow-2xl" data-testid="answer-locked-banner">
                <div className="w-16 h-16 rounded-2xl bg-brand-600/30 border border-brand-500 text-brand-400 mx-auto flex items-center justify-center text-3xl animate-pulse">
                  ✓
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    Đã ghi nhận câu trả lời!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bạn đã chọn phương án {['A', 'B', 'C', 'D'][selectedOption]}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-amber-400 font-medium">
                  Đang đợi hết giờ hoặc tất cả học viên nộp bài...
                </div>
              </div>
            ) : (
              /* 4 Giant Touch Buttons */
              <div className="grid grid-cols-2 gap-3.5 w-full pt-2" data-testid="touch-options-grid">
                {SHAPE_THEMES.map((theme, idx) => (
                  <button
                    key={theme.letter}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`h-36 sm:h-44 rounded-2xl border-4 ${theme.bgClass} ${theme.borderClass} ${theme.hoverBgClass} ${theme.activeBgClass} shadow-xl flex flex-col items-center justify-center p-3 text-white transition-all transform active:scale-95 cursor-pointer`}
                    data-testid={`player-option-${idx}`}
                  >
                    <QuizShapeIcon index={idx} size={44} className="text-white drop-shadow-md mb-2" />
                    <span className="text-xl font-black tracking-wider">
                      {theme.letter}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. QUESTION_REVEAL */}
        {joined && state?.status === 'QUESTION_REVEAL' && (
          <div className="w-full text-center space-y-6 animate-fadeIn" data-testid="player-question-reveal">
            {myAnswer?.isCorrect ? (
              <div className="p-6 rounded-3xl bg-emerald-950/90 border-2 border-emerald-500 shadow-2xl space-y-4" data-testid="player-correct-screen">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center text-3xl font-black animate-bounce">
                  ✓
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-900 text-emerald-200 uppercase">
                    CHÍNH XÁC!
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">
                    +{myAnswer.pointsEarned} ĐIỂM
                  </h3>
                  <p className="text-xs text-emerald-300 font-mono mt-1">
                    Thời gian phản xạ: {(myAnswer.responseTimeMs / 1000).toFixed(2)}s
                  </p>
                </div>

                {myPlayer && myPlayer.streak >= 2 && (
                  <div className="p-3 rounded-2xl bg-orange-950/80 border border-orange-600 text-orange-200 text-sm font-bold flex items-center justify-center gap-2" data-testid="streak-banner">
                    <span>🔥 Chuỗi đúng liên tiếp x{myPlayer.streak}!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-red-950/90 border-2 border-red-500 shadow-2xl space-y-4" data-testid="player-wrong-screen">
                <div className="w-16 h-16 rounded-full bg-red-600 text-white mx-auto flex items-center justify-center text-3xl font-black">
                  ✕
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-red-900 text-red-200 uppercase">
                    CHƯA CHÍNH XÁC
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2">
                    +0 ĐIỂM
                  </h3>
                  <p className="text-xs text-red-300 mt-1">
                    Chuỗi đúng đã được thiết lập lại về 0. Hãy bứt phá ở câu sau!
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              Nhìn lên máy chiếu để xem giải thích và học viên có phản xạ nhanh nhất câu này!
            </div>
          </div>
        )}

        {/* 6. LEADERBOARD */}
        {joined && state?.status === 'LEADERBOARD' && (
          <div className="w-full text-center space-y-6 animate-fadeIn" data-testid="player-leaderboard">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-900/80 text-amber-300 uppercase">
                Bảng xếp hạng sau câu {state.currentQuestionIndex + 1}
              </span>

              <div className="py-4">
                <span className="text-xs text-slate-400 uppercase tracking-widest block">
                  VỊ TRÍ CỦA BẠN
                </span>
                <span className="text-5xl font-black text-amber-400 font-mono my-2 block" data-testid="player-rank">
                  #{myRank || '-'}
                </span>
                <span className="text-sm font-bold text-white">
                  {myPlayer?.score.toLocaleString()} điểm
                </span>
              </div>

              {myPlayer && (
                <div className="pt-3 border-t border-slate-800 flex justify-around text-xs text-slate-400">
                  <div>
                    <span className="block font-bold text-white text-sm">
                      {myPlayer.correctCount}/15
                    </span>
                    <span>Số câu đúng</span>
                  </div>
                  <div>
                    <span className="block font-bold text-amber-400 text-sm">
                      x{myPlayer.maxStreak}
                    </span>
                    <span>Chuỗi dài nhất</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. FINAL_RESULTS */}
        {joined && state?.status === 'FINAL_RESULTS' && (
          <div className="w-full text-center space-y-6 animate-fadeIn" data-testid="player-final-results">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 border-2 border-amber-500/50 shadow-2xl space-y-4">
              <span className="px-4 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 uppercase tracking-widest">
                CHỨNG NHẬN THI ĐẤU
              </span>

              <h2 className="text-2xl font-black text-white">
                {myPlayer?.nickname}
              </h2>
              {myPlayer?.unit && (
                <p className="text-xs text-slate-400">{myPlayer.unit}</p>
              )}

              <div className="py-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-widest block">
                  XẾP HẠNG CHUNG CUỘC
                </span>
                <span className="text-5xl font-black text-amber-400 font-mono my-1 block" data-testid="player-final-rank">
                  #{myRank}
                </span>
                <span className="text-xs text-slate-400">
                  trên tổng số {allPlayers.length} học viên
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Tổng điểm</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {myPlayer?.score.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Số câu đúng</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {myPlayer?.correctCount} / 15
                  </span>
                </div>
              </div>

              {/* Certificate badge title */}
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-300 text-xs font-bold" data-testid="player-certificate-badge">
                {myRank === 1
                  ? '🏆 Quán Quân Đấu Trí Đoàn - Hội HCMUTE'
                  : myRank <= 3
                  ? '🥇 Chiến Sĩ Kế Hoạch Đoàn Xuất Sắc'
                  : myRank <= 10
                  ? '⭐ Cán Bộ Đoàn Tiêu Biểu'
                  : '🎖️ Học Viên Tích Cực Đoàn - Hội'}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-[11px] text-slate-400">
        Đoàn Thanh niên - Hội Sinh viên Trường ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)
      </footer>
    </div>
  );
};

export default PlayerView;
