'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RoomState,
  PlayerState,
  QuizQuestion,
  LeaderboardEntry,
  FinalAwardsSummary,
  RoomStatus,
} from '@/lib/training-quiz/types';
import { TRAINING_QUIZ_QUESTIONS } from '@/lib/training-quiz/questionsData';
import { QuizRoom } from '@/lib/training-quiz/roomEngine';
import { getFinalAwards } from '@/lib/training-quiz/scoringEngine';
import { SHAPE_THEMES, QuizShapeIcon } from './common/QuizShapes';
import { QuizQrCode } from './QuizQrCode';
import { QuizConfetti } from './QuizConfetti';
import { quizSound } from './QuizSound';

export interface HostViewProps {
  initialRoomCode?: string;
  initialHostToken?: string;
  standaloneRoom?: QuizRoom;
  onExit?: () => void;
}

export const HostView: React.FC<HostViewProps> = ({
  initialRoomCode,
  initialHostToken,
  standaloneRoom,
  onExit,
}) => {
  const [room, setRoom] = useState<QuizRoom | null>(standaloneRoom || null);
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode || '');
  const [hostToken, setHostToken] = useState<string>(initialHostToken || '');
  const [state, setState] = useState<RoomState | null>(
    standaloneRoom ? standaloneRoom.getState() : null
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15);
  const [previewSeconds, setPreviewSeconds] = useState<number>(3);
  const [isMuted, setIsMuted] = useState<boolean>(quizSound.isMuted());
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState<boolean>(true);

  // Timer intervals
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio unlock on first interaction
  const handleUserGesture = useCallback(() => {
    quizSound.unlockAudio();
  }, []);

  // Initialize or create room
  useEffect(() => {
    if (standaloneRoom) {
      setRoom(standaloneRoom);
      setRoomCode(standaloneRoom.roomCode);
      setHostToken(standaloneRoom.hostToken);
      setState(standaloneRoom.getState());

      const unsubscribe = standaloneRoom.subscribe((newState) => {
        setState({ ...newState });
      });

      return () => {
        unsubscribe();
      };
    }

    // Client-side initialization: try API first, fallback to client QuizRoom
    let isCancelled = false;

    async function initRoom() {
      if (initialRoomCode && initialHostToken) {
        setRoomCode(initialRoomCode);
        setHostToken(initialHostToken);
        return;
      }

      try {
        const res = await fetch('/api/quiz/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setRoomCode(data.roomCode);
            setHostToken(data.hostToken);
            setState(data.state);
          }
          return;
        }
      } catch {
        // Fallback to client-side QuizRoom
      }

      if (!isCancelled) {
        const fallbackCode = `UTE${Math.floor(100 + Math.random() * 900)}`;
        const localRoom = new QuizRoom({
          roomCode: fallbackCode,
          questions: TRAINING_QUIZ_QUESTIONS,
        });
        setRoom(localRoom);
        setRoomCode(localRoom.roomCode);
        setHostToken(localRoom.hostToken);
        setState(localRoom.getState());

        localRoom.subscribe((newState) => {
          setState({ ...newState });
        });
      }
    }

    initRoom();

    return () => {
      isCancelled = true;
    };
  }, [standaloneRoom, initialRoomCode, initialHostToken]);

  const latestStateRef = useRef<RoomState | null>(state);
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const applyIncomingState = useCallback((incoming: RoomState) => {
    if (!incoming || typeof incoming !== 'object') return;
    setState((prev) => {
      if (!prev || prev.roomCode !== incoming.roomCode) {
        latestStateRef.current = incoming;
        return incoming;
      }

      const statusRank: Record<string, number> = {
        LOBBY: 0,
        QUESTION_START: 1,
        QUESTION_ACTIVE: 2,
        QUESTION_REVEAL: 3,
        LEADERBOARD: 4,
        FINAL_RESULTS: 5,
      };
      const prevProg =
        prev.status === 'FINAL_RESULTS'
          ? 1000
          : prev.currentQuestionIndex * 10 + (statusRank[prev.status] ?? 0);
      const incProg =
        incoming.status === 'FINAL_RESULTS'
          ? 1000
          : incoming.currentQuestionIndex * 10 + (statusRank[incoming.status] ?? 0);

      // Union-merge players & answers so no player or answer is ever lost across instances
      const mergedPlayers: Record<string, PlayerState> = { ...prev.players };
      for (const [pid, incPlayer] of Object.entries(incoming.players || {})) {
        const curPlayer = mergedPlayers[pid];
        if (!curPlayer) {
          mergedPlayers[pid] = incPlayer;
        } else {
          const curAnsCount = Object.keys(curPlayer.answers || {}).length;
          const incAnsCount = Object.keys(incPlayer.answers || {}).length;
          const basePlayer =
            incAnsCount > curAnsCount || (incPlayer.score ?? 0) >= (curPlayer.score ?? 0)
              ? incPlayer
              : curPlayer;
          mergedPlayers[pid] = {
            ...basePlayer,
            answers: { ...(curPlayer.answers || {}), ...(incPlayer.answers || {}) },
          };
        }
      }

      const baseState = incProg >= prevProg ? incoming : prev;
      const nextState: RoomState = {
        ...baseState,
        players: mergedPlayers,
      };
      latestStateRef.current = nextState;
      return nextState;
    });
  }, []);

  // Polling / Sync when using API
  useEffect(() => {
    if (standaloneRoom || !roomCode || !hostToken) return;

    let active = true;
    const syncState = async () => {
      try {
        const res = await fetch('/api/quiz/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            op: 'state',
            roomCode,
            hostToken,
            allowRehydrate: true,
            snapshot: latestStateRef.current,
          }),
        });
        if (res.ok && active) {
          const data = await res.json();
          applyIncomingState(data.state || data);
        }
      } catch {
        // Ignore fetch errors during polling
      }
    };

    syncState();
    const interval = setInterval(syncState, 600);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [standaloneRoom, roomCode, hostToken, applyIncomingState]);

  // Dispatch Host Action
  const dispatchAction = useCallback(
    async (
      action:
        | 'START'
        | 'NEXT_QUESTION'
        | 'SHOW_LEADERBOARD'
        | 'END_GAME'
        | 'ACTIVATE_QUESTION'
        | 'TIMEOUT_QUESTION'
    ) => {
      handleUserGesture();

      if (room) {
        if (action === 'ACTIVATE_QUESTION') {
          if (room.status === 'QUESTION_START') {
            room.transitionToQuestionActive();
          }
        } else if (action === 'TIMEOUT_QUESTION') {
          if (room.status === 'QUESTION_ACTIVE') {
            room.handleQuestionTimeout();
          }
        } else {
          room.handleHostAction({ hostToken, action });
        }
        setState(room.getState());
        return;
      }

      try {
        const res = await fetch('/api/quiz/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            op: 'action',
            roomCode,
            hostToken,
            action,
            allowRehydrate: true,
            snapshot: latestStateRef.current,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            applyIncomingState(data.state);
          }
        }
      } catch {
        // Ignore network errors
      }
    },
    [room, roomCode, hostToken, handleUserGesture, applyIncomingState]
  );

  const activeQuestions: QuizQuestion[] =
    state?.questions && state.questions.length > 0
      ? state.questions
      : room?.questions && room.questions.length > 0
      ? room.questions
      : TRAINING_QUIZ_QUESTIONS;

  const totalQuestions = state?.totalQuestions || activeQuestions.length || 15;
  const currentQuestion: QuizQuestion =
    activeQuestions[state?.currentQuestionIndex ?? 0] || activeQuestions[0];

  const activeTimeLimitSec =
    state?.questionTimeLimitSeconds || currentQuestion?.timeLimit || 15;
  const activePreviewSec = state?.previewDurationSeconds || 3;

  // Active question countdown timer & automatic timeout reveal
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (state?.status === 'QUESTION_START') {
      setPreviewSeconds(activePreviewSec);
      quizSound.playQuestionStart();

      const previewInterval = setInterval(() => {
        setPreviewSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(previewInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Fallback for serverless environments where server-side setTimeout may pause
      const activateTimeout = !standaloneRoom
        ? setTimeout(() => {
            if (latestStateRef.current?.status === 'QUESTION_START') {
              dispatchAction('ACTIVATE_QUESTION');
            }
          }, activePreviewSec * 1000 + 100)
        : null;

      return () => {
        clearInterval(previewInterval);
        if (activateTimeout) clearTimeout(activateTimeout);
      };
    }

    if (state?.status === 'QUESTION_ACTIVE' && state.questionDeadline) {
      let timeoutTriggered = false;
      const updateTimer = () => {
        const now = Date.now();
        const diffMs = (state.questionDeadline || now) - now;
        const secs = Math.max(0, Math.ceil(diffMs / 1000));
        setRemainingSeconds(secs);

        if (diffMs <= 0 && !timeoutTriggered) {
          timeoutTriggered = true;
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          if (!standaloneRoom) {
            dispatchAction('TIMEOUT_QUESTION');
          }
          return;
        }

        if (secs > 0) {
          if (secs <= 3) {
            quizSound.playTickFast();
          } else {
            quizSound.playTick();
          }
        }
      };

      updateTimer();
      timerIntervalRef.current = setInterval(updateTimer, 500);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    }

    if (state?.status === 'QUESTION_REVEAL') {
      quizSound.playCorrect();
    }

    if (state?.status === 'FINAL_RESULTS') {
      quizSound.playPodium();
    }
  }, [
    state?.status,
    state?.questionDeadline,
    state?.currentQuestionIndex,
    activePreviewSec,
    standaloneRoom,
    dispatchAction,
  ]);

  const toggleSound = () => {
    handleUserGesture();
    const muted = quizSound.toggleMute();
    setIsMuted(muted);
  };

  // Compute join URL
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/ai-tools/training-quiz?mode=player&room=${roomCode}`
      : `https://thansxuan.edu.vn/ai-tools/training-quiz?mode=player&room=${roomCode}`;

  const copyJoinLink = () => {
    handleUserGesture();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const playersList = Object.values(state?.players || {});
  const answeredCount = playersList.filter(
    (p) =>
      p.answers[state?.currentQuestionIndex ?? 0] !== undefined &&
      p.answers[state?.currentQuestionIndex ?? 0].selectedIndex >= 0
  ).length;
  const unansweredCount = Math.max(0, playersList.length - answeredCount);

  const currentStats =
    state?.statsPerQuestion?.[state?.currentQuestionIndex ?? 0] || {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    };

  const finalAwards: FinalAwardsSummary | null =
    state?.status === 'FINAL_RESULTS'
      ? getFinalAwards(state.players || {}, activeQuestions)
      : null;

  const remainingLeaderboard: LeaderboardEntry[] =
    finalAwards?.fullLeaderboard ? finalAwards.fullLeaderboard.slice(3) : [];

  return (
    <div
      className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-brand-500 selection:text-white"
      onClick={handleUserGesture}
      data-testid="host-view"
    >
      {/* Top Projector Header */}
      <header className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-red-600 flex items-center justify-center font-black text-xl shadow-md shadow-brand-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              {state?.programTitle || 'ĐẤU TRÍ ĐOÀN - HỘI HCMUTE'}
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-900/80 text-brand-300 border border-brand-700/50">
                Màn hình Giảng viên
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {state?.programSubtitle ||
                'Tập huấn kỹ năng xây dựng kế hoạch & tổ chức hoạt động'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Room PIN badge */}
          {roomCode && (
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Mã PIN:</span>
              <span className="text-base font-black tracking-wider text-amber-400 font-mono" data-testid="room-pin">
                {roomCode}
              </span>
            </div>
          )}

          {/* Room Lock Badge once game starts */}
          {state && state.status !== 'LOBBY' && (
            <div
              className="hidden md:flex px-3 py-1.5 rounded-xl bg-red-950/70 border border-red-800/80 text-xs font-bold text-red-300 items-center gap-1.5"
              data-testid="room-locked-badge"
            >
              <span>🔒</span>
              <span>Đã khóa phòng</span>
            </div>
          )}

          {/* Player Count */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5" data-testid="player-counter">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{playersList.length}</span>
            <span className="hidden sm:inline">học viên</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-label="Toggle sound"
            data-testid="sound-toggle"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 text-xs font-semibold transition"
            >
              Thoát
            </button>
          )}
        </div>
      </header>

      {/* Main Screen Body */}
      <main className="flex-1 p-6 md:p-8 flex flex-col justify-center items-center max-w-7xl w-full mx-auto">
        {/* 1. LOBBY VIEW */}
        {(!state || state.status === 'LOBBY') && (
          <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" data-testid="host-lobby">
            {/* Left: QR Code & Connection Info */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Sảnh chờ trực tiếp sẵn sàng
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Quét mã QR để vào phòng
                </h2>
                <p className="mt-2 text-slate-300 text-base sm:text-lg">
                  Hoặc truy cập website và nhập mã PIN gồm 6 ký tự
                </p>
              </div>

              {/* Big PIN Display */}
              <div className="p-4 sm:p-6 bg-slate-900 rounded-3xl border-2 border-slate-700 w-full max-w-md shadow-2xl flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  MÃ PHÒNG (ROOM PIN)
                </span>
                <span className="text-5xl sm:text-6xl font-black tracking-widest text-amber-400 font-mono my-2 select-all" data-testid="big-room-pin">
                  {roomCode || 'ĐANG TẠO...'}
                </span>
                <div className="w-full flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 truncate max-w-[240px] font-mono">
                    {joinUrl}
                  </span>
                  <button
                    type="button"
                    onClick={copyJoinLink}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition shrink-0"
                  >
                    {copiedLink ? '✓ Đã chép' : 'Sao chép link'}
                  </button>
                </div>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={() => dispatchAction('START')}
                disabled={playersList.length === 0}
                className={`w-full max-w-md py-4 px-8 rounded-2xl font-black text-lg sm:text-xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                  playersList.length > 0
                    ? 'bg-gradient-to-r from-brand-600 to-accent-red-600 hover:from-brand-500 hover:to-accent-red-500 text-white shadow-brand-600/30 cursor-pointer animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
                data-testid="start-game-btn"
              >
                <span>🚀 BẮT ĐẦU TRÒ CHƠI</span>
                {playersList.length > 0 && (
                  <span className="text-sm font-normal opacity-90">
                    ({playersList.length} học viên)
                  </span>
                )}
              </button>
            </div>

            {/* Right: QR Code Visual & Player Avatar Grid */}
            <div className="lg:col-span-6 flex flex-col items-center space-y-6">
              <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-slate-800 inline-block transform hover:scale-105 transition-transform duration-300">
                <QuizQrCode value={joinUrl} size={240} />
              </div>

              <div className="w-full bg-slate-900/80 rounded-2xl p-5 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <span>👥 Danh sách học viên trong phòng</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-brand-900 text-brand-300 font-mono">
                      {playersList.length}
                    </span>
                  </span>
                  {playersList.length === 0 && (
                    <span className="text-xs text-amber-400 animate-pulse">
                      Đang đợi học viên tham gia...
                    </span>
                  )}
                </div>

                {playersList.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                    Chưa có học viên nào vào phòng. Chiếu mã QR hoặc gửi mã PIN lên màn hình.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1" data-testid="player-chips">
                    {playersList.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200 animate-fadeIn"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-white">{p.nickname}</span>
                        {p.unit && (
                          <span className="text-xs text-slate-400 font-normal">
                            ({p.unit})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 2. QUESTION_START (3s Preview) */}
        {state?.status === 'QUESTION_START' && (
          <section className="w-full max-w-4xl flex flex-col items-center text-center space-y-6 animate-fadeIn" data-testid="question-start">
            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-brand-900/80 text-brand-300 border border-brand-700/60 uppercase tracking-widest">
              Câu {state.currentQuestionIndex + 1} / {totalQuestions}
            </span>

            <div className="text-6xl sm:text-7xl font-black text-amber-400 animate-bounce">
              {previewSeconds}
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-relaxed">
              {currentQuestion.question}
            </h2>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-700">
              <span>Mức độ:</span>
              <span className="text-brand-300 font-bold">{currentQuestion.level}</span>
            </div>
          </section>
        )}

        {/* 3. QUESTION_ACTIVE (Countdown + 4 Cards) */}
        {state?.status === 'QUESTION_ACTIVE' && (
          <section className="w-full flex flex-col space-y-6 animate-fadeIn" data-testid="question-active">
            {/* Top Bar: Question Info + Countdown + Answered Counter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-brand-950 border border-brand-700/60 text-brand-300 font-black text-sm">
                  CÂU {state.currentQuestionIndex + 1} / {totalQuestions}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                  {currentQuestion.level}
                </span>
              </div>

              {/* Big Circular / Badge Timer */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl border-2 transition-all ${
                    remainingSeconds <= 3
                      ? 'bg-red-600/90 text-white border-red-400 animate-ping'
                      : remainingSeconds <= 5
                      ? 'bg-amber-600/90 text-white border-amber-400'
                      : 'bg-brand-600/80 text-white border-brand-400'
                  }`}
                  data-testid="countdown-timer"
                >
                  {remainingSeconds}
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">
                    Thời gian còn lại
                  </span>
                  <span className="text-xs text-slate-300 font-mono">{activeTimeLimitSec} giây</span>
                </div>
              </div>

              {/* Answers submitted counter */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700" data-testid="live-submission-count">
                <span className="text-xs text-slate-400 font-medium">Đã trả lời:</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {answeredCount} / {playersList.length}
                </span>
              </div>
            </div>

            {/* Countdown progress bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  remainingSeconds <= 3
                    ? 'bg-red-500'
                    : remainingSeconds <= 5
                    ? 'bg-amber-400'
                    : 'bg-brand-500'
                }`}
                style={{ width: `${Math.min(100, (remainingSeconds / Math.max(1, activeTimeLimitSec)) * 100)}%` }}
              />
            </div>

            {/* Question Text Box */}
            <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border-2 border-slate-800 shadow-xl text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* 4 Kahoot Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((optionText, idx) => {
                const theme = SHAPE_THEMES[idx];
                return (
                  <div
                    key={theme.letter}
                    className={`p-5 rounded-2xl border-2 shadow-lg flex items-center gap-4 transition-transform ${theme.bgClass} ${theme.borderClass}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                      <QuizShapeIcon index={idx} size={28} className="text-white drop-shadow" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                        Phương án {theme.letter}
                      </span>
                      <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                        {optionText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. QUESTION_REVEAL */}
        {state?.status === 'QUESTION_REVEAL' && (
          <section className="w-full flex flex-col space-y-6 animate-fadeIn" data-testid="question-reveal">
            {/* Top Bar with Next Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-black text-sm">
                  KẾT QUẢ CÂU {state.currentQuestionIndex + 1}
                </span>
                <span className="text-xs text-slate-400">
                  {currentQuestion.level}
                </span>
                {unansweredCount > 0 && (
                  <span
                    className="px-3 py-1 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold"
                    data-testid="unanswered-wrong-badge"
                  >
                    ⏰ Không trả lời / Tính sai: {unansweredCount} học viên
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => dispatchAction('SHOW_LEADERBOARD')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                  data-testid="show-leaderboard-btn"
                >
                  🏆 Xem Bảng Xếp Hạng
                </button>
                <button
                  type="button"
                  onClick={() => dispatchAction('NEXT_QUESTION')}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                  data-testid="next-question-btn"
                >
                  Câu tiếp theo ➔
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {currentQuestion.question}
              </h2>
            </div>

            {/* 4 Cards with Correct Highlight & Response Counts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((optionText, idx) => {
                const theme = SHAPE_THEMES[idx];
                const isCorrect = idx === currentQuestion.correctIndex;
                const letter = theme.letter as 'A' | 'B' | 'C' | 'D';
                const count = currentStats[letter] || 0;
                const totalAnswers = Math.max(1, answeredCount);
                const percent = Math.round((count / totalAnswers) * 100);

                return (
                  <div
                    key={theme.letter}
                    className={`relative p-5 rounded-2xl border-4 shadow-xl flex flex-col justify-between overflow-hidden transition-all ${
                      isCorrect
                        ? 'bg-emerald-800/90 border-emerald-400 ring-4 ring-emerald-500/40 transform scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800 opacity-60'
                    }`}
                    data-testid={`reveal-option-${idx}`}
                  >
                    <div className="flex items-center gap-4 z-10">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${theme.bgClass}`}
                      >
                        <QuizShapeIcon index={idx} size={28} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-white/80">
                            Phương án {theme.letter}
                          </span>
                          {isCorrect && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-400 text-emerald-950 uppercase tracking-wider animate-bounce">
                              ✓ ĐÁP ÁN ĐÚNG
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-white mt-1">
                          {optionText}
                        </p>
                      </div>
                    </div>

                    {/* Response distribution mini bar */}
                    <div className="mt-4 pt-3 border-t border-white/10 z-10 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-300 font-mono">
                        {count} lượt chọn ({percent}%)
                      </span>
                      <div className="w-32 bg-slate-950/60 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isCorrect ? 'bg-emerald-400' : 'bg-slate-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation and Fastest Player Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Explanation Card */}
              <div className="lg:col-span-8 p-5 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                  📖 Căn cứ bài giảng BTV Đoàn trường:
                </span>
                <p className="mt-2 text-slate-200 text-sm leading-relaxed" data-testid="explanation-text">
                  {currentQuestion.explanation}
                </p>
              </div>

              {/* Fastest Player Spotlight Card */}
              <div className="lg:col-span-4 p-5 bg-gradient-to-br from-amber-950/50 to-slate-900 rounded-2xl border border-amber-600/40 flex flex-col justify-between" data-testid="fastest-player-card">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    ⚡ Người nhanh nhất câu này:
                  </span>
                  {state.fastestPlayerInCurrentQuestion ? (
                    <div className="mt-2">
                      <p className="text-lg font-black text-white truncate" data-testid="fastest-player-name">
                        {state.fastestPlayerInCurrentQuestion.nickname}
                      </p>
                      {state.fastestPlayerInCurrentQuestion.unit && (
                        <p className="text-xs text-slate-400">
                          {state.fastestPlayerInCurrentQuestion.unit}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400 italic">
                      Chưa có câu trả lời chính xác
                    </p>
                  )}
                </div>

                {state.fastestPlayerInCurrentQuestion && (
                  <div className="mt-3 pt-2 border-t border-amber-900/40 flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300">
                      ⏱ {(state.fastestPlayerInCurrentQuestion.responseTimeMs / 1000).toFixed(2)}s
                    </span>
                    <span className="font-bold text-emerald-400">
                      +{state.fastestPlayerInCurrentQuestion.pointsEarned ?? 1000} đ
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 5. LEADERBOARD */}
        {state?.status === 'LEADERBOARD' && (
          <section className="w-full max-w-4xl flex flex-col space-y-6 animate-fadeIn" data-testid="leaderboard-view">
            <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                  🏆 BẢNG XẾP HẠNG TẠM THỜI
                </h2>
                <p className="text-xs text-slate-400">
                  Sau câu {state.currentQuestionIndex + 1} / {totalQuestions}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dispatchAction('NEXT_QUESTION')}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-md transition transform active:scale-95 cursor-pointer"
                data-testid="advance-next-btn"
              >
                {state.currentQuestionIndex + 1 >= totalQuestions
                  ? '🏁 Xem Tổng Kết Chung Cuộc'
                  : 'Câu tiếp theo ➔'}
              </button>
            </div>

            {/* Standings List */}
            <div className="space-y-3">
              {Object.values(state.players)
                .sort((a, b) => b.score - a.score || a.totalResponseTimeMs - b.totalResponseTimeMs)
                .slice(0, 5)
                .map((p, idx) => {
                  const rankIcons = ['🥇', '🥈', '🥉', '4', '5'];
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        idx === 0
                          ? 'bg-amber-950/40 border-amber-600/60 shadow-lg shadow-amber-900/20'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                      data-testid={`leaderboard-item-${idx}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-lg">
                          {rankIcons[idx]}
                        </span>
                        <div>
                          <p className="text-base font-bold text-white flex items-center gap-2">
                            <span>{p.nickname}</span>
                            {p.streak >= 2 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-900 text-orange-200">
                                🔥 Chuỗi x{p.streak}
                              </span>
                            )}
                          </p>
                          {p.unit && (
                            <p className="text-xs text-slate-400">{p.unit}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-amber-400 font-mono">
                          {p.score.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 block">
                          {p.correctCount}/{totalQuestions} câu đúng
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* 6. FINAL_RESULTS (Podium, Lightning Award, Class Analytics) */}
        {state?.status === 'FINAL_RESULTS' && (
          <section className="w-full flex flex-col space-y-8 animate-fadeIn" data-testid="final-results-view">
            <QuizConfetti durationMs={8000} />

            <div className="text-center space-y-2">
              <span className="px-4 py-1 rounded-full text-xs font-black bg-amber-900/60 text-amber-300 border border-amber-700/60 uppercase tracking-widest">
                {state?.programTitle || 'ĐẤU TRÍ ĐOÀN - HỘI HCMUTE'}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                TỔNG KẾT & BỤC VINH DANH CHUNG CUỘC
              </h2>
              <p className="text-slate-400 text-sm">
                Hoàn thành xuất sắc {totalQuestions} câu hỏi tập huấn xây dựng kế hoạch và tổ chức hoạt động
              </p>
            </div>

            {/* Podium Top 3 */}
            <div className="flex items-end justify-center gap-4 sm:gap-6 pt-10 pb-4" data-testid="podium-section">
              {/* Rank 2 (Silver) */}
              <div className="flex flex-col items-center w-32 sm:w-44 text-center" data-testid="podium-rank-2">
                <span className="text-3xl sm:text-4xl mb-1">🥈</span>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Á quân (Hạng 2)
                </span>
                <span className="text-sm sm:text-base font-black text-white truncate max-w-full mt-0.5">
                  {finalAwards?.podium[1]?.nickname || 'Chưa có'}
                </span>
                {finalAwards?.podium[1]?.unit && (
                  <span className="text-[11px] text-slate-400 truncate max-w-full">
                    {finalAwards.podium[1].unit}
                  </span>
                )}
                <span className="text-xs sm:text-sm text-slate-200 font-mono font-bold mt-1">
                  {finalAwards?.podium[1] ? `${finalAwards.podium[1].score.toLocaleString()} đ` : '—'}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold mb-2">
                  {finalAwards?.podium[1] ? `${finalAwards.podium[1].correctCount}/${totalQuestions} câu đúng` : ''}
                </span>
                <div className="w-full h-32 sm:h-40 rounded-t-2xl bg-gradient-to-t from-slate-700 to-slate-500 border-t-4 border-slate-300 flex items-center justify-center text-2xl font-black text-slate-900 shadow-xl">
                  2
                </div>
              </div>

              {/* Rank 1 (Gold - Winner) */}
              <div className="flex flex-col items-center w-36 sm:w-52 text-center" data-testid="podium-rank-1">
                <span className="text-5xl sm:text-6xl mb-1 animate-bounce">👑</span>
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                  Quán quân (Hạng 1)
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300 truncate max-w-full mt-0.5">
                  {finalAwards?.podium[0]?.nickname || 'Chưa có'}
                </span>
                {finalAwards?.podium[0]?.unit && (
                  <span className="text-xs text-amber-200/80 truncate max-w-full">
                    {finalAwards.podium[0].unit}
                  </span>
                )}
                <span className="text-sm sm:text-base text-amber-400 font-mono font-black mt-1">
                  {finalAwards?.podium[0] ? `${finalAwards.podium[0].score.toLocaleString()} đ` : '0 đ'}
                </span>
                <span className="text-xs text-emerald-400 font-bold mb-2">
                  {finalAwards?.podium[0] ? `${finalAwards.podium[0].correctCount}/${totalQuestions} câu đúng` : ''}
                </span>
                <div className="w-full h-44 sm:h-56 rounded-t-2xl bg-gradient-to-t from-amber-600 to-yellow-400 border-t-4 border-yellow-200 flex items-center justify-center text-3xl font-black text-amber-950 shadow-2xl">
                  1
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="flex flex-col items-center w-32 sm:w-44 text-center" data-testid="podium-rank-3">
                <span className="text-3xl sm:text-4xl mb-1">🥉</span>
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                  Quý quân (Hạng 3)
                </span>
                <span className="text-sm sm:text-base font-black text-white truncate max-w-full mt-0.5">
                  {finalAwards?.podium[2]?.nickname || 'Chưa có'}
                </span>
                {finalAwards?.podium[2]?.unit && (
                  <span className="text-[11px] text-slate-400 truncate max-w-full">
                    {finalAwards.podium[2].unit}
                  </span>
                )}
                <span className="text-xs sm:text-sm text-amber-300 font-mono font-bold mt-1">
                  {finalAwards?.podium[2] ? `${finalAwards.podium[2].score.toLocaleString()} đ` : '—'}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold mb-2">
                  {finalAwards?.podium[2] ? `${finalAwards.podium[2].correctCount}/${totalQuestions} câu đúng` : ''}
                </span>
                <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-700 border-t-4 border-amber-600 flex items-center justify-center text-2xl font-black text-amber-200 shadow-xl">
                  3
                </div>
              </div>
            </div>

            {/* Danh sách điểm những học viên còn lại (Hạng 4 trở đi) */}
            {remainingLeaderboard.length > 0 && (
              <div
                className="w-full max-w-5xl mx-auto bg-slate-900/95 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl"
                data-testid="remaining-players-section"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>📋</span>
                    <span>Danh sách điểm các học viên tiếp theo (Hạng 4 — Hạng {finalAwards?.fullLeaderboard.length})</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    {remainingLeaderboard.length} học viên
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {remainingLeaderboard.map((entry) => (
                    <div
                      key={entry.playerId}
                      className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between gap-3"
                      data-testid={`remaining-player-rank-${entry.rank}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-sm text-slate-300 shrink-0">
                          #{entry.rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {entry.nickname}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {entry.unit || 'Học viên tập huấn'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-amber-400 font-mono block">
                          {entry.score.toLocaleString()} đ
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          {entry.correctCount}/{totalQuestions} đúng
                        </span>
                        {entry.totalResponseTimeMs > 0 && (
                          <span className="text-[11px] text-slate-400 font-mono ml-2">
                            • {(entry.totalResponseTimeMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Lightning Award Card */}
            {finalAwards?.lightningAward && (
              <div className="max-w-xl mx-auto w-full p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-500/50 shadow-xl flex items-center gap-4" data-testid="lightning-award">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shrink-0">
                  ⚡
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Giải thưởng danh dự
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Tia Chớp Đoàn - Hội (Phản xạ nhanh nhất)
                  </h3>
                  <p className="text-sm font-semibold text-slate-200 mt-1">
                    {finalAwards.lightningAward.nickname}
                    {finalAwards.lightningAward.unit && ` (${finalAwards.lightningAward.unit})`}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-black text-amber-400">
                    {isFinite(finalAwards.lightningAward.averageResponseTimeMs)
                      ? (finalAwards.lightningAward.averageResponseTimeMs / 1000).toFixed(2)
                      : '0.00'}s
                  </span>
                  <span className="text-xs text-slate-400 block">Thời gian TB</span>
                </div>
              </div>
            )}

            {/* Class Analytics & Full Leaderboard Table Section */}
            {finalAwards?.classAnalytics && (
              <div className="w-full max-w-5xl mx-auto bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6" data-testid="class-analytics">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  📊 Thống kê kết quả & Bảng điểm toàn lớp
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-slate-400 block">Tổng người tham gia</span>
                    <span className="text-xl font-black text-white font-mono">
                      {finalAwards.classAnalytics.totalParticipants}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-slate-400 block">Điểm trung bình</span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {finalAwards.classAnalytics.averageScore.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-slate-400 block">Câu khó nhất</span>
                    <span className="text-sm font-bold text-red-400 truncate block">
                      {finalAwards.classAnalytics.hardestQuestion
                        ? `Câu ${finalAwards.classAnalytics.hardestQuestion.questionId} (${finalAwards.classAnalytics.hardestQuestion.accuracyRate}%)`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-xs text-slate-400 block">Câu dễ nhất</span>
                    <span className="text-sm font-bold text-emerald-400 truncate block">
                      {finalAwards.classAnalytics.easiestQuestion
                        ? `Câu ${finalAwards.classAnalytics.easiestQuestion.questionId} (${finalAwards.classAnalytics.easiestQuestion.accuracyRate}%)`
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Full Leaderboard Table Always Shown by Default */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                      🏆 Bảng tổng sắp điểm toàn bộ học viên ({finalAwards.fullLeaderboard.length} học viên)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
                      className="text-xs font-bold text-brand-400 hover:text-brand-300 underline cursor-pointer"
                    >
                      {showFullLeaderboard
                        ? 'Thu gọn bảng chi tiết'
                        : 'Hiện bảng chi tiết'}
                    </button>
                  </div>

                  {showFullLeaderboard && finalAwards.fullLeaderboard && (
                    <div className="overflow-x-auto rounded-xl border border-slate-800" data-testid="full-leaderboard-table">
                      <table className="w-full text-left text-xs sm:text-sm text-slate-200">
                        <thead className="bg-slate-800/90 text-slate-300 uppercase font-mono text-xs">
                          <tr>
                            <th className="py-3 px-4">Hạng</th>
                            <th className="py-3 px-4">Học viên</th>
                            <th className="py-3 px-4">Đơn vị / Chi đoàn</th>
                            <th className="py-3 px-4 text-center">Số câu đúng</th>
                            <th className="py-3 px-4 text-center">Chuỗi đúng</th>
                            <th className="py-3 px-4 text-right">Phản xạ TB</th>
                            <th className="py-3 px-4 text-right">Tổng điểm</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                          {finalAwards.fullLeaderboard.map((entry) => {
                            const medal =
                              entry.rank === 1
                                ? '🥇 #1'
                                : entry.rank === 2
                                ? '🥈 #2'
                                : entry.rank === 3
                                ? '🥉 #3'
                                : `#${entry.rank}`;
                            return (
                              <tr
                                key={entry.playerId}
                                className={`transition-colors ${
                                  entry.rank <= 3
                                    ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                    : 'hover:bg-slate-800/50'
                                }`}
                              >
                                <td className="py-3 px-4 font-black font-mono text-white">
                                  {medal}
                                </td>
                                <td className="py-3 px-4 font-bold text-white">
                                  {entry.nickname}
                                </td>
                                <td className="py-3 px-4 text-slate-400">
                                  {entry.unit || '-'}
                                </td>
                                <td className="py-3 px-4 text-center font-semibold text-emerald-400">
                                  {entry.correctCount}/{totalQuestions}
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-orange-300">
                                  x{state?.players?.[entry.playerId]?.maxStreak ?? entry.streak}
                                </td>
                                <td className="py-3 px-4 text-right font-mono text-slate-300">
                                  {entry.totalResponseTimeMs > 0
                                    ? `${(entry.totalResponseTimeMs / 1000).toFixed(1)}s`
                                    : '-'}
                                </td>
                                <td className="py-3 px-4 text-right font-black text-amber-400 font-mono text-base">
                                  {entry.score.toLocaleString()} đ
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default HostView;
