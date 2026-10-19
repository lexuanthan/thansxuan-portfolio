'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SiteShell from '@/components/SiteShell';
import { Container } from '@/components/ui';
import HostView from '@/components/training-quiz/HostView';
import PlayerView from '@/components/training-quiz/PlayerView';
import {
  DEFAULT_TRAINING_QUIZ_CONFIG,
  TrainingQuizSystemConfig,
  buildRoomQuestionsFromConfig,
} from '@/lib/training-quiz/configManager';

function TrainingQuizContainer() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const roomParam = searchParams.get('room') || '';
  const hostTokenParam = searchParams.get('hostToken') || '';

  const [mode, setMode] = useState<'select' | 'host' | 'player'>('select');
  const [quizConfig, setQuizConfig] = useState<TrainingQuizSystemConfig>(
    DEFAULT_TRAINING_QUIZ_CONFIG
  );

  useEffect(() => {
    if (modeParam === 'host') {
      setMode('host');
    } else if (modeParam === 'player' || roomParam) {
      setMode('player');
    }
  }, [modeParam, roomParam]);

  useEffect(() => {
    let active = true;
    fetch('/api/quiz/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.config) {
          setQuizConfig(data.config);
        }
      })
      .catch(() => {
        // Keep default config on error
      });
    return () => {
      active = false;
    };
  }, []);

  // If in Host mode, show full-screen Host view
  if (mode === 'host') {
    return (
      <HostView
        initialRoomCode={roomParam || undefined}
        initialHostToken={hostTokenParam || undefined}
        onExit={() => setMode('select')}
      />
    );
  }

  // If in Player mode, show mobile-optimized Player view
  if (mode === 'player') {
    return (
      <PlayerView
        initialRoomCode={roomParam}
        onExit={() => setMode('select')}
      />
    );
  }

  const activeQuestionCount = buildRoomQuestionsFromConfig(quizConfig).length;
  const general = quizConfig.general || DEFAULT_TRAINING_QUIZ_CONFIG.general;
  const settings = quizConfig.settings || DEFAULT_TRAINING_QUIZ_CONFIG.settings;

  // Welcome / Selection Screen
  return (
    <SiteShell>
      <Container className="py-10 max-w-5xl">
        <div className="space-y-10" data-testid="quiz-landing">
          {/* Hero Banner */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
              <span>⚡</span> {general.badgeText}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-ink-900 tracking-tight">
              {general.title}
            </h1>
            <p className="text-base sm:text-lg text-ink-600 max-w-2xl mx-auto leading-relaxed">
              {general.description}{' '}
              <strong className="text-brand-600">
                &ldquo;{general.topicHighlight}&rdquo;
              </strong>.
            </p>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-500">
              <span className="px-2.5 py-1 rounded-full bg-surface-soft border border-line font-medium">
                📚 {activeQuestionCount} câu hỏi / lượt thi
              </span>
              <span className="px-2.5 py-1 rounded-full bg-surface-soft border border-line font-medium">
                ⏱️ {settings.questionTimeLimitSeconds} giây đếm ngược / câu
              </span>
              <span className="px-2.5 py-1 rounded-full bg-surface-soft border border-line font-medium">
                🎯 Điểm gốc tối đa: {settings.baseMaxPoints} điểm
              </span>
              <Link
                href="/admin/training-quiz"
                className="px-3 py-1 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-semibold transition inline-flex items-center gap-1"
              >
                <span>⚙️ Quản trị & Tùy chỉnh câu hỏi</span>
              </Link>
            </div>
          </div>

          {/* Dual Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Host Card */}
            <div
              className="p-8 rounded-3xl bg-white border-2 border-line hover:border-brand-500 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between group"
              data-testid="select-host-card"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🖥️
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block">
                    Dành cho Giảng viên / Ban tổ chức
                  </span>
                  <h2 className="text-2xl font-black text-ink-900 mt-1">
                    {general.hostCardTitle}
                  </h2>
                </div>
                <p className="text-sm text-ink-600 leading-relaxed">
                  {general.hostCardDesc}
                </p>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => setMode('host')}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-brand transition flex items-center justify-center gap-2 cursor-pointer"
                  data-testid="btn-choose-host"
                >
                  <span>Mở Màn hình Máy chiếu</span>
                  <span>➔</span>
                </button>
              </div>
            </div>

            {/* Player Card */}
            <div
              className="p-8 rounded-3xl bg-white border-2 border-line hover:border-accent-red-500 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between group"
              data-testid="select-player-card"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-accent-red-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  📱
                </div>
                <div>
                  <span className="text-xs font-bold text-accent-red-600 uppercase tracking-wider block">
                    Dành cho Học viên / Người tham gia
                  </span>
                  <h2 className="text-2xl font-black text-ink-900 mt-1">
                    {general.playerCardTitle}
                  </h2>
                </div>
                <p className="text-sm text-ink-600 leading-relaxed">
                  {general.playerCardDesc}
                </p>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => setMode('player')}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-accent-red-600 hover:bg-accent-red-700 text-white shadow-accent transition flex items-center justify-center gap-2 cursor-pointer"
                  data-testid="btn-choose-player"
                >
                  <span>Vào Phòng Thi Đấu</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>

          {/* Training Program Features */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-soft border border-line">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
                <span>🌟</span>
                <span>Đặc trưng nổi bật của hệ thống trò chơi</span>
              </h3>
              <Link
                href="/admin/training-quiz"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Tùy chỉnh câu hỏi, đếm ngược & nhập Excel tại trang Admin →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-ink-600">
              <div className="p-4 rounded-2xl bg-white border border-line/60">
                <div className="text-lg font-bold text-ink-900 mb-1">
                  📚 {activeQuestionCount} Câu hỏi chuẩn hóa
                </div>
                <p className="text-xs leading-relaxed">
                  Trích xuất nguyên bản từ tài liệu bài giảng BTV Đoàn trường ĐH Sư phạm Kỹ thuật
                  TP.HCM theo 3 cấp độ: Nhận biết, Thông hiểu và Tình huống thực tế.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-line/60">
                <div className="text-lg font-bold text-ink-900 mb-1">
                  ⏱️ Tính điểm phản xạ ({settings.questionTimeLimitSeconds}s)
                </div>
                <p className="text-xs leading-relaxed">
                  Công thức điểm tốc độ kết hợp thưởng chuỗi đúng (Streak bonus) chính xác tới từng
                  mili-giây, tìm ra người nhanh nhất từng câu.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-line/60">
                <div className="text-lg font-bold text-ink-900 mb-1">
                  🏆 Bục vinh danh & Thống kê
                </div>
                <p className="text-xs leading-relaxed">
                  Bục Top 3 rực rỡ kèm hiệu ứng pháo hoa, giải thưởng &ldquo;Tia chớp Đoàn - Hội&rdquo; và bảng
                  phân tích câu hỏi khó nhất/dễ nhất toàn lớp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </SiteShell>
  );
}

export default function TrainingQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-sm font-medium text-ink-500 animate-pulse">
          Đang tải Đấu Trí Đoàn - Hội...
        </div>
      }
    >
      <TrainingQuizContainer />
    </Suspense>
  );
}

