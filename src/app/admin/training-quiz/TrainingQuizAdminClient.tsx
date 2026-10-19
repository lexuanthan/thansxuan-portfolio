'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { QuizQuestion, QuestionLevel } from '@/lib/training-quiz/types';
import {
  TrainingQuizSystemConfig,
  DEFAULT_TRAINING_QUIZ_CONFIG,
} from '@/lib/training-quiz/configManager';

interface ActiveRoomSummary {
  roomCode: string;
  status: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  playerCount: number;
  createdAt: number;
}

interface TrainingQuizAdminClientProps {
  initialConfig: TrainingQuizSystemConfig;
}

const QUESTION_LEVELS: QuestionLevel[] = [
  'Nhận biết',
  'Thông hiểu',
  'Tình huống thực tế',
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function TrainingQuizAdminClient({
  initialConfig,
}: TrainingQuizAdminClientProps) {
  const [config, setConfig] = useState<TrainingQuizSystemConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<
    'questions' | 'settings' | 'general' | 'rooms'
  >('questions');

  // Search & filter state for questions
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
    initialConfig.questions[0]?.id ?? null
  );

  // Saving & feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Excel upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [importedPreview, setImportedPreview] = useState<{
    fileName: string;
    sheetName?: string;
    totalRowsRead: number;
    questions: QuizQuestion[];
    errors: string[];
  } | null>(null);

  // Paste from Excel modal state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // Live rooms state
  const [rooms, setRooms] = useState<ActiveRoomSummary[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const showNotice = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/quiz/config?includeRooms=1');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.rooms)) {
          setRooms(data.rooms);
        }
      }
    } catch {
      // Ignore error
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rooms') {
      fetchRooms();
    }
  }, [activeTab]);

  // Save entire configuration to backend
  const handleSaveConfig = async (configToSave: TrainingQuizSystemConfig = config) => {
    if (configToSave.questions.length === 0) {
      showNotice('error', 'Ngân hàng câu hỏi phải có ít nhất 1 câu hỏi!');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/quiz/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          op: 'save',
          config: configToSave,
        }),
      });
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
        setHasUnsavedChanges(false);
        showNotice(
          'success',
          data.message ||
            `Đã lưu thành công (${data.config.questions.length} câu hỏi, đếm ngược ${data.config.settings.questionTimeLimitSeconds}s)!`
        );
      } else {
        showNotice('error', data.error || 'Không thể lưu cấu hình.');
      }
    } catch {
      showNotice('error', 'Lỗi kết nối máy chủ khi lưu cấu hình.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default 15 questions & settings
  const handleResetDefault = async () => {
    if (
      !window.confirm(
        'Bạn có chắc chắn muốn khôi phục toàn bộ 15 câu hỏi và cài đặt về mặc định ban đầu?'
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/quiz/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'reset_default' }),
      });
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
        setHasUnsavedChanges(false);
        showNotice('success', 'Đã khôi phục cấu hình & 15 câu hỏi gốc mặc định!');
      } else {
        showNotice('error', data.error || 'Lỗi khôi phục mặc định');
      }
    } catch {
      showNotice('error', 'Lỗi kết nối khi khôi phục mặc định');
    } finally {
      setIsSaving(false);
    }
  };

  // Question CRUD helpers
  const updateQuestion = (
    id: number,
    updater: (q: QuizQuestion) => QuizQuestion
  ) => {
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? updater(q) : q)),
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddQuestion = () => {
    const nextId =
      config.questions.reduce((max, q) => Math.max(max, q.id), 0) + 1;
    const defaultLimit = config.settings.questionTimeLimitSeconds || 15;
    const newQuestion: QuizQuestion = {
      id: nextId,
      level: 'Nhận biết',
      question: `Nội dung câu hỏi mới số ${config.questions.length + 1}?`,
      options: [
        'Phương án A',
        'Phương án B',
        'Phương án C',
        'Phương án D',
      ],
      correctIndex: 0,
      explanation: 'Giải thích đáp án đúng cho câu hỏi này.',
      timeLimit: defaultLimit,
      timeLimitSeconds: defaultLimit,
      active: true,
    };

    setConfig((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setExpandedQuestionId(nextId);
    setHasUnsavedChanges(true);
    showNotice('info', `Đã thêm câu hỏi mới #${config.questions.length + 1}. Nhớ bấm "Lưu cấu hình" sau khi chỉnh sửa!`);
  };

  const handleDuplicateQuestion = (q: QuizQuestion) => {
    const nextId =
      config.questions.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const copy: QuizQuestion = {
      ...q,
      id: nextId,
      question: `${q.question} (Bản sao)`,
      options: [...q.options] as [string, string, string, string],
    };
    const idx = config.questions.findIndex((item) => item.id === q.id);
    const nextQuestions = [...config.questions];
    nextQuestions.splice(idx + 1, 0, copy);
    setConfig((prev) => ({ ...prev, questions: nextQuestions }));
    setExpandedQuestionId(nextId);
    setHasUnsavedChanges(true);
  };

  const handleDeleteQuestion = (id: number) => {
    if (config.questions.length <= 1) {
      showNotice('error', 'Hệ thống cần tối thiểu 1 câu hỏi trong ngân hàng!');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
    setHasUnsavedChanges(true);
  };

  const handleMoveQuestion = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= config.questions.length) return;
    const next = [...config.questions];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setConfig((prev) => ({ ...prev, questions: next }));
    setHasUnsavedChanges(true);
  };

  const handleToggleAllQuestions = (active: boolean) => {
    setConfig((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => ({ ...q, active })),
    }));
    setHasUnsavedChanges(true);
  };

  // Excel File Upload Handler
  const handleExcelFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingExcel(true);
    setImportedPreview(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'defaultTimeLimitSeconds',
        String(config.settings.questionTimeLimitSeconds || 15)
      );

      const res = await fetch('/api/quiz/config', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data.questions)) {
        setImportedPreview({
          fileName: file.name,
          sheetName: data.sheetName,
          totalRowsRead: data.totalRowsRead || data.questions.length,
          questions: data.questions,
          errors: data.errors || [],
        });

        if (data.questions.length > 0) {
          showNotice(
            'success',
            `Đã đọc thành công ${data.questions.length} câu hỏi từ file "${file.name}". Kiểm tra bản xem trước bên dưới để áp dụng!`
          );
        } else {
          showNotice(
            'error',
            data.errors?.[0] ||
              'Không tìm thấy câu hỏi hợp lệ trong file. Vui lòng kiểm tra cấu trúc cột!'
          );
        }
      } else {
        showNotice('error', data.error || 'Không thể đọc file Excel/CSV.');
      }
    } catch {
      showNotice('error', 'Lỗi khi tải lên và phân tích file Excel.');
    } finally {
      setIsUploadingExcel(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Confirm applying imported Excel questions
  const handleConfirmExcelImport = async (saveImmediately: boolean) => {
    if (!importedPreview || importedPreview.questions.length === 0) return;

    let mergedQuestions: QuizQuestion[];
    if (importMode === 'replace') {
      mergedQuestions = importedPreview.questions.map((q, idx) => ({
        ...q,
        id: idx + 1,
        active: true,
      }));
    } else {
      const baseId = config.questions.reduce((m, q) => Math.max(m, q.id), 0);
      const appended = importedPreview.questions.map((q, idx) => ({
        ...q,
        id: baseId + idx + 1,
        active: true,
      }));
      mergedQuestions = [...config.questions, ...appended];
    }

    const updatedConfig: TrainingQuizSystemConfig = {
      ...config,
      questions: mergedQuestions,
    };

    setConfig(updatedConfig);
    setImportedPreview(null);
    setExpandedQuestionId(mergedQuestions[0]?.id ?? null);

    if (saveImmediately) {
      await handleSaveConfig(updatedConfig);
    } else {
      setHasUnsavedChanges(true);
      showNotice(
        'info',
        `Đã nạp ${mergedQuestions.length} câu hỏi vào trình chỉnh sửa. Bấm "Lưu cấu hình" để áp dụng chính thức!`
      );
    }
  };

  // Handle direct copy-paste from Excel (TSV/CSV text)
  const handleParsePastedExcel = async () => {
    if (!pasteText.trim()) {
      showNotice('error', 'Vui lòng dán dữ liệu từ bảng Excel vào ô văn bản!');
      return;
    }

    setIsUploadingExcel(true);
    try {
      const blob = new Blob([pasteText], { type: 'text/tab-separated-values' });
      const file = new File([blob], 'pasted-from-excel.tsv', {
        type: 'text/tab-separated-values',
      });
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'defaultTimeLimitSeconds',
        String(config.settings.questionTimeLimitSeconds || 15)
      );

      const res = await fetch('/api/quiz/config', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        setImportedPreview({
          fileName: 'Dữ liệu dán trực tiếp từ Excel',
          sheetName: 'Clipboard',
          totalRowsRead: data.totalRowsRead || data.questions.length,
          questions: data.questions,
          errors: data.errors || [],
        });
        setShowPasteModal(false);
        setPasteText('');
        showNotice(
          'success',
          `Đã phân tích ${data.questions.length} câu hỏi từ dữ liệu dán Excel!`
        );
      } else {
        showNotice(
          'error',
          data.errors?.[0] ||
            'Không nhận diện được các cột câu hỏi. Hãy copy kèm dòng tiêu đề hoặc đúng thứ tự: STT | Cấp độ | Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng | Giải thích'
        );
      }
    } catch {
      showNotice('error', 'Lỗi phân tích dữ liệu dán từ Excel.');
    } finally {
      setIsUploadingExcel(false);
    }
  };

  // Room management actions
  const handleDeleteRoom = async (roomCode: string) => {
    try {
      const res = await fetch('/api/quiz/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'delete_room', roomCode }),
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
        showNotice('success', `Đã đóng phòng thi ${roomCode}`);
      }
    } catch {
      showNotice('error', 'Không thể xóa phòng thi.');
    }
  };

  const handleClearAllRooms = async () => {
    if (!window.confirm('Đóng toàn bộ các phòng thi đang mở?')) return;
    try {
      const res = await fetch('/api/quiz/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'clear_rooms' }),
      });
      if (res.ok) {
        setRooms([]);
        showNotice('success', 'Đã đóng tất cả phòng thi.');
      }
    } catch {
      showNotice('error', 'Lỗi khi đóng các phòng thi.');
    }
  };

  // Computed stats
  const activeQuestionsCount = config.questions.filter(
    (q) => q.active !== false
  ).length;
  const effectiveGameQuestionCount =
    config.settings.maxQuestionsPerGame > 0
      ? Math.min(config.settings.maxQuestionsPerGame, activeQuestionsCount)
      : activeQuestionsCount;

  const levelCounts = {
    'Nhận biết': config.questions.filter((q) => q.level === 'Nhận biết').length,
    'Thông hiểu': config.questions.filter((q) => q.level === 'Thông hiểu').length,
    'Tình huống thực tế': config.questions.filter(
      (q) => q.level === 'Tình huống thực tế'
    ).length,
  };

  const filteredQuestions = config.questions.filter((q) => {
    if (levelFilter !== 'ALL' && q.level !== levelFilter) return false;
    if (statusFilter === 'ACTIVE' && q.active === false) return false;
    if (statusFilter === 'INACTIVE' && q.active !== false) return false;
    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase();
      const inQ = q.question.toLowerCase().includes(kw);
      const inOpts = q.options.some((o) => o.toLowerCase().includes(kw));
      const inExp = q.explanation.toLowerCase().includes(kw);
      return inQ || inOpts || inExp;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16" data-testid="training-quiz-admin">
      {/* Top Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              ⚡ Quản trị Hệ thống Trò chơi Tập huấn
            </span>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                ● Có thay đổi chưa lưu
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {config.general.title || 'Đấu Trí Đoàn - Hội HCMUTE'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tùy chỉnh ngân hàng câu hỏi & đáp án, tải lên file Excel (.xlsx/.csv), điều chỉnh số lượng câu hỏi, thời gian đếm ngược và giao diện hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/ai-tools/training-quiz"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition inline-flex items-center gap-1.5"
          >
            <span>🚀 Mở Trang Thi Đấu</span>
            <span>↗</span>
          </Link>

          <button
            type="button"
            onClick={handleResetDefault}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-medium transition cursor-pointer disabled:opacity-50"
          >
            🔄 Khôi phục gốc
          </button>

          <button
            type="button"
            onClick={() => handleSaveConfig()}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            data-testid="save-quiz-config-btn"
          >
            <span>💾 {isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between gap-3 shadow-sm ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}
          data-testid="admin-toast"
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Tổng ngân hàng câu hỏi
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900" data-testid="kpi-total-questions">
              {config.questions.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              ({activeQuestionsCount} đang bật)
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Số câu hỏi / trận thi đấu
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600" data-testid="kpi-game-questions">
              {effectiveGameQuestionCount}
            </span>
            <span className="text-xs text-slate-500">
              {config.settings.maxQuestionsPerGame === 0
                ? '(Tất cả câu đang bật)'
                : `(Giới hạn tối đa ${config.settings.maxQuestionsPerGame} câu)`}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Thời gian đếm ngược
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600" data-testid="kpi-countdown-seconds">
              {config.settings.questionTimeLimitSeconds}s
            </span>
            <span className="text-xs text-slate-500">
              (+ {config.settings.previewDurationSeconds}s đọc đề)
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Phân bổ cấp độ câu hỏi
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Nhận biết: {levelCounts['Nhận biết']}
            </span>
            <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
              Thông hiểu: {levelCounts['Thông hiểu']}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Thực tế: {levelCounts['Tình huống thực tế']}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          data-testid="tab-questions"
        >
          <span>📚 Ngân hàng Câu hỏi & Nhập Excel</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'questions'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {config.questions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          data-testid="tab-settings"
        >
          <span>⏱️ Cấu hình Luật chơi, Số câu & Đếm ngược</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          data-testid="tab-general"
        >
          <span>🎨 Giao diện & Nội dung Hệ thống</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'rooms'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          data-testid="tab-rooms"
        >
          <span>📡 Quản lý Phòng thi Trực tiếp</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: NGÂN HÀNG CÂU HỎI & NHẬP NHANH EXCEL
      ===================================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Excel Import / Export Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📊</span>
                  <span>Nhập nhanh Câu hỏi & Đáp án từ File Excel / CSV</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hỗ trợ tải lên trực tiếp file Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) hoặc <strong>.csv</strong>, hoặc sao chép vùng bảng từ Excel và dán trực tiếp.
                </p>
              </div>

              {/* Template & Export Download Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/api/quiz/config?format=xlsx&template=1"
                  download
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition inline-flex items-center gap-1.5"
                  data-testid="download-xlsx-template-btn"
                >
                  <span>📥 Tải File Excel Mẫu (.xlsx)</span>
                </a>
                <a
                  href="/api/quiz/config?format=csv&template=1"
                  download
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition inline-flex items-center gap-1.5"
                >
                  <span>📥 Tải CSV Mẫu (.csv)</span>
                </a>
                <a
                  href="/api/quiz/config?format=xlsx&template=0"
                  download
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition inline-flex items-center gap-1.5"
                >
                  <span>📤 Xuất Bộ Câu Hỏi Hiện Tại (.xlsx)</span>
                </a>
              </div>
            </div>

            {/* Upload Dropzone & Paste Button */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
              <div className="md:col-span-8">
                <label
                  htmlFor="quiz-excel-upload"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl bg-indigo-50/40 hover:bg-indigo-50/80 transition cursor-pointer text-center"
                >
                  <span className="text-3xl mb-1.5">📂</span>
                  <span className="text-sm font-bold text-slate-800">
                    {isUploadingExcel
                      ? 'Đang phân tích dữ liệu file Excel...'
                      : 'Bấm để chọn File Excel (.xlsx, .xls, .csv) tải lên'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Các cột hỗ trợ: STT | Cấp độ | Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (A/B/C/D) | Giải thích | Thời gian (giây)
                  </span>
                  <input
                    id="quiz-excel-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.tsv"
                    onChange={handleExcelFileChange}
                    className="hidden"
                    data-testid="excel-file-input"
                  />
                </label>
              </div>

              <div className="md:col-span-4 flex flex-col justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    ⚡ Nhập siêu tốc từ Clipboard
                  </span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Bạn đang mở sẵn file Excel hoặc Google Sheets? Chỉ cần bôi đen các dòng câu hỏi, bấm <strong>Ctrl+C</strong> và dán trực tiếp vào đây!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold shadow-2xs transition cursor-pointer"
                  data-testid="open-paste-excel-btn"
                >
                  📋 Dán dữ liệu trực tiếp từ Excel
                </button>
              </div>
            </div>

            {/* Imported Excel Preview Panel */}
            {importedPreview && (
              <div
                className="mt-4 p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-4"
                data-testid="excel-import-preview"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200 pb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                      ✓ Đã đọc file thành công
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {importedPreview.fileName}{' '}
                      <span className="text-sm font-normal text-slate-600">
                        ({importedPreview.questions.length} câu hỏi hợp lệ)
                      </span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={importMode}
                      onChange={(e) =>
                        setImportMode(e.target.value as 'replace' | 'append')
                      }
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800"
                      data-testid="excel-import-mode-select"
                    >
                      <option value="replace">
                        Thay thế toàn bộ ngân hàng hiện tại ({importedPreview.questions.length} câu)
                      </option>
                      <option value="append">
                        Thêm nối tiếp vào ngân hàng hiện tại (+{importedPreview.questions.length} câu)
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleConfirmExcelImport(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      data-testid="confirm-excel-import-save-btn"
                    >
                      ✓ Áp dụng & Lưu ngay
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportedPreview(null)}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>

                {importedPreview.errors.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                    <p className="font-bold">⚠️ Cảnh báo một số dòng dữ liệu:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {importedPreview.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto rounded-xl border border-emerald-200 bg-white divide-y divide-slate-100">
                  {importedPreview.questions.slice(0, 20).map((q, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">
                          Câu {idx + 1}: {q.question}
                        </div>
                        <div className="flex flex-wrap gap-2 text-slate-600">
                          {q.options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className={`px-2 py-0.5 rounded ${
                                oIdx === q.correctIndex
                                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {OPTION_LETTERS[oIdx]}. {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium shrink-0">
                        {q.level} • {q.timeLimitSeconds || 15}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Paste from Excel Modal */}
          {showPasteModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    📋 Dán dữ liệu câu hỏi trực tiếp từ bảng Excel / Google Sheets
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Mở file Excel, bôi đen các dòng câu hỏi (có thể bao gồm cả dòng tiêu đề cột hoặc không) theo thứ tự cột:{' '}
                  <strong>
                    STT | Cấp độ | Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (A/B/C/D) | Giải thích | Thời gian (giây)
                  </strong>{' '}
                  rồi dán (Ctrl+V) vào khung bên dưới:
                </p>

                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Dán (Ctrl+V) các dòng copy từ Excel vào đây..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                  data-testid="paste-excel-textarea"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleParsePastedExcel}
                    disabled={isUploadingExcel}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    data-testid="submit-paste-excel-btn"
                  >
                    {isUploadingExcel ? 'Đang phân tích...' : 'Phân tích dữ liệu ➔'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Question Filter & Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Tìm kiếm nội dung câu hỏi, đáp án, giải thích..."
                  className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  data-testid="search-questions-input"
                />

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="ALL">Tất cả cấp độ ({config.questions.length})</option>
                  {QUESTION_LEVELS.map((lv) => (
                    <option key={lv} value={lv}>
                      {lv} ({levelCounts[lv]})
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
                  }
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="ALL">Mọi trạng thái</option>
                  <option value="ACTIVE">Đang bật ({activeQuestionsCount})</option>
                  <option value="INACTIVE">
                    Đang ẩn ({config.questions.length - activeQuestionsCount})
                  </option>
                </select>
              </div>

              {/* Bulk Actions & Add Question */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAllQuestions(true)}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  ✓ Bật tất cả
                </button>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                  data-testid="add-question-btn"
                >
                  <span>➕ Thêm câu hỏi mới</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3 pt-2">
              {filteredQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                  Không tìm thấy câu hỏi nào khớp với bộ lọc hiện tại.
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const realIndex = config.questions.findIndex(
                    (item) => item.id === q.id
                  );
                  const isExpanded = expandedQuestionId === q.id;
                  const isActive = q.active !== false;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border transition-all ${
                        isExpanded
                          ? 'border-indigo-400 bg-white shadow-md'
                          : isActive
                          ? 'border-slate-200 bg-white hover:border-slate-300'
                          : 'border-slate-200 bg-slate-50/70 opacity-75'
                      }`}
                      data-testid={`question-card-${realIndex}`}
                    >
                      {/* Question Header Bar */}
                      <div
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                        onClick={() =>
                          setExpandedQuestionId(isExpanded ? null : q.id)
                        }
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <span
                            className={`w-9 h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            #{realIndex + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  q.level === 'Nhận biết'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : q.level === 'Thông hiểu'
                                    ? 'bg-violet-50 text-violet-700 border border-violet-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {q.level}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                                Đáp án đúng: {OPTION_LETTERS[q.correctIndex]}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono">
                                ⏱ {q.timeLimitSeconds || config.settings.questionTimeLimitSeconds}s
                              </span>
                              {!isActive && (
                                <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold">
                                  Đang tạm ẩn
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2">
                              {q.question}
                            </h3>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateQuestion(q.id, (item) => ({
                                ...item,
                                active: item.active === false ? true : false,
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Bật/Tắt sử dụng câu hỏi này trong phòng thi"
                          >
                            {isActive ? '✓ Đang dùng' : 'Đã ẩn'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(realIndex, -1)}
                            disabled={realIndex === 0}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs disabled:opacity-30 cursor-pointer"
                            title="Di chuyển lên"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(realIndex, 1)}
                            disabled={realIndex === config.questions.length - 1}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs disabled:opacity-30 cursor-pointer"
                            title="Di chuyển xuống"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateQuestion(q)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs cursor-pointer"
                            title="Nhân bản câu hỏi"
                          >
                            📋
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs cursor-pointer"
                            title="Xóa câu hỏi"
                            data-testid={`delete-question-${realIndex}`}
                          >
                            🗑️
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedQuestionId(isExpanded ? null : q.id)
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            {isExpanded ? 'Thu gọn ▲' : 'Sửa ▼'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Question Editor */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
                          {/* Question Text & Metadata Row */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-8">
                              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                Nội dung câu hỏi #{realIndex + 1} *
                              </label>
                              <textarea
                                rows={2}
                                value={q.question}
                                onChange={(e) =>
                                  updateQuestion(q.id, (item) => ({
                                    ...item,
                                    question: e.target.value,
                                  }))
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                                data-testid={`edit-question-text-${realIndex}`}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                Cấp độ nhận thức
                              </label>
                              <select
                                value={q.level}
                                onChange={(e) =>
                                  updateQuestion(q.id, (item) => ({
                                    ...item,
                                    level: e.target.value as QuestionLevel,
                                  }))
                                }
                                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                              >
                                {QUESTION_LEVELS.map((lv) => (
                                  <option key={lv} value={lv}>
                                    {lv}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                                Thời gian riêng (giây)
                              </label>
                              <input
                                type="number"
                                min={3}
                                max={120}
                                value={
                                  q.timeLimitSeconds ||
                                  config.settings.questionTimeLimitSeconds
                                }
                                onChange={(e) =>
                                  updateQuestion(q.id, (item) => ({
                                    ...item,
                                    timeLimitSeconds: Math.max(
                                      3,
                                      Math.min(120, Number(e.target.value) || 15)
                                    ),
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-mono font-bold text-slate-900"
                              />
                            </div>
                          </div>

                          {/* 4 Answer Options Grid */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-2">
                              4 Phương án trả lời (Bấm chọn nút tròn để đặt làm ĐÁP ÁN ĐÚNG)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {OPTION_LETTERS.map((letter, optIdx) => {
                                const isCorrect = q.correctIndex === optIdx;
                                const badgeColors = [
                                  'bg-red-600 text-white',
                                  'bg-blue-600 text-white',
                                  'bg-amber-500 text-white',
                                  'bg-emerald-600 text-white',
                                ];
                                return (
                                  <div
                                    key={letter}
                                    className={`p-3 rounded-xl border-2 transition flex items-start gap-3 ${
                                      isCorrect
                                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                                        : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQuestion(q.id, (item) => ({
                                          ...item,
                                          correctIndex: optIdx,
                                        }))
                                      }
                                      className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 cursor-pointer ${badgeColors[optIdx]}`}
                                      title={`Đặt phương án ${letter} làm đáp án đúng`}
                                      data-testid={`set-correct-${realIndex}-${optIdx}`}
                                    >
                                      {letter}
                                    </button>

                                    <div className="flex-1 space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                                          Phương án {letter}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateQuestion(q.id, (item) => ({
                                              ...item,
                                              correctIndex: optIdx,
                                            }))
                                          }
                                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                                            isCorrect
                                              ? 'bg-emerald-600 text-white'
                                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                          }`}
                                        >
                                          {isCorrect
                                            ? '✓ ĐÁP ÁN ĐÚNG'
                                            : 'Chọn làm đáp án đúng'}
                                        </button>
                                      </div>

                                      <input
                                        type="text"
                                        value={q.options[optIdx]}
                                        onChange={(e) => {
                                          const newOpts = [...q.options] as [
                                            string,
                                            string,
                                            string,
                                            string,
                                          ];
                                          newOpts[optIdx] = e.target.value;
                                          updateQuestion(q.id, (item) => ({
                                            ...item,
                                            options: newOpts,
                                          }));
                                        }}
                                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                                        data-testid={`edit-option-${realIndex}-${optIdx}`}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Explanation Field */}
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                              📖 Giải thích đáp án đúng (Hiển thị sau khi hết giờ câu hỏi)
                            </label>
                            <textarea
                              rows={2}
                              value={q.explanation}
                              onChange={(e) =>
                                updateQuestion(q.id, (item) => ({
                                  ...item,
                                  explanation: e.target.value,
                                }))
                              }
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                              data-testid={`edit-explanation-${realIndex}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CẤU HÌNH LUẬT CHƠI, SỐ LƯỢNG CÂU & THỜI GIAN ĐẾM NGƯỢC
      ===================================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6" data-testid="settings-panel">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              ⏱️ Tùy chỉnh Thời gian Đếm ngược, Số lượng Câu hỏi & Luật tính điểm
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Các thông số này sẽ áp dụng trực tiếp cho mọi phòng thi mới khi Giảng viên mở màn hình Host.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Countdown Timer Seconds */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900">
                  ⏳ Thời gian đếm ngược mỗi câu hỏi (giây)
                </label>
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 font-mono font-black text-base">
                  {config.settings.questionTimeLimitSeconds} giây
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Thời gian để học viên bấm chọn đáp án trên điện thoại trước khi hệ thống khóa câu trả lời.
              </p>
              <input
                type="range"
                min={5}
                max={90}
                step={1}
                value={config.settings.questionTimeLimitSeconds}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setConfig((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      questionTimeLimitSeconds: val,
                    },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[10, 15, 20, 30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          questionTimeLimitSeconds: sec,
                        },
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      config.settings.questionTimeLimitSeconds === sec
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    data-testid={`preset-timer-${sec}`}
                  >
                    {sec} giây
                  </button>
                ))}
                <input
                  type="number"
                  min={3}
                  max={120}
                  value={config.settings.questionTimeLimitSeconds}
                  onChange={(e) => {
                    const val = Math.max(
                      3,
                      Math.min(120, Number(e.target.value) || 15)
                    );
                    setConfig((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        questionTimeLimitSeconds: val,
                      },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-20 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-center"
                  data-testid="input-countdown-seconds"
                />
              </div>
            </div>

            {/* 2. Max Questions Per Game */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900">
                  📚 Số lượng câu hỏi mỗi trận thi đấu
                </label>
                <span className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-800 font-mono font-black text-base">
                  {config.settings.maxQuestionsPerGame === 0
                    ? `Tất cả (${activeQuestionsCount} câu)`
                    : `${effectiveGameQuestionCount} câu`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Đặt bằng <strong>0</strong> để dùng toàn bộ câu hỏi đang bật ({activeQuestionsCount} câu), hoặc giới hạn số câu mỗi lượt chơi (kết hợp trộn ngẫu nhiên để tạo đề thi khác nhau).
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[0, 5, 10, 15, 20, 25, 30].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          maxQuestionsPerGame: cnt,
                        },
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      config.settings.maxQuestionsPerGame === cnt
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    data-testid={`preset-qcount-${cnt}`}
                  >
                    {cnt === 0 ? `Tất cả (${activeQuestionsCount})` : `${cnt} câu`}
                  </button>
                ))}
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={config.settings.maxQuestionsPerGame}
                  onChange={(e) => {
                    const val = Math.max(
                      0,
                      Math.min(200, Number(e.target.value) || 0)
                    );
                    setConfig((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        maxQuestionsPerGame: val,
                      },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-20 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-center"
                  data-testid="input-max-questions"
                />
              </div>
            </div>

            {/* 3. Preview Duration Seconds */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900">
                  👀 Thời gian chiếu trước câu hỏi (Preview)
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={config.settings.previewDurationSeconds}
                  onChange={(e) => {
                    const val = Math.max(
                      0,
                      Math.min(15, Number(e.target.value) || 0)
                    );
                    setConfig((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        previewDurationSeconds: val,
                      },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-20 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-sm font-mono font-bold text-center"
                />
              </div>
              <p className="text-xs text-slate-500">
                Số giây hiển thị câu hỏi trên máy chiếu trước khi mở 4 nút đáp án trên điện thoại học viên (mặc định: 3 giây).
              </p>
            </div>

            {/* 4. Base Max Points */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900">
                  🎯 Điểm gốc tối đa mỗi câu (Base Max Points)
                </label>
                <input
                  type="number"
                  min={100}
                  max={10000}
                  step={100}
                  value={config.settings.baseMaxPoints}
                  onChange={(e) => {
                    const val = Math.max(
                      100,
                      Math.min(10000, Number(e.target.value) || 1000)
                    );
                    setConfig((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        baseMaxPoints: val,
                      },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-28 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-sm font-mono font-bold text-center"
                />
              </div>
              <p className="text-xs text-slate-500">
                Điểm thưởng tối đa cho câu trả lời đúng và nhanh nhất (mặc định: 1000 điểm + điểm thưởng chuỗi đúng liên tiếp).
              </p>
            </div>
          </div>

          {/* Toggle Switches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              {
                key: 'shuffleQuestions' as const,
                title: '🔀 Trộn ngẫu nhiên thứ tự câu hỏi',
                desc: 'Mỗi phòng thi mới sẽ xáo trộn thứ tự các câu hỏi để tăng tính khách quan.',
              },
              {
                key: 'shuffleOptions' as const,
                title: '🎲 Trộn ngẫu nhiên vị trí 4 phương án A/B/C/D',
                desc: 'Tự động đảo vị trí các phương án A, B, C, D và cập nhật lại vị trí đáp án đúng tương ứng.',
              },
              {
                key: 'fastShortCircuit' as const,
                title: '⚡ Tự động mở đáp án sớm khi 100% học viên đã nộp bài',
                desc: 'Không cần đợi hết giờ đếm ngược nếu toàn bộ học viên trong phòng đều đã bấm chọn đáp án.',
              },
              {
                key: 'allowPerQuestionTimeLimit' as const,
                title: '⏱️ Cho phép thời gian đếm ngược riêng theo từng câu hỏi',
                desc: 'Nếu bật, các câu hỏi tình huống dài có thể đặt thời gian riêng (ví dụ 25s) thay vì dùng chung mức mặc định.',
              },
              {
                key: 'lockRoomOnStart' as const,
                title: '🔒 Khóa phòng thi ngay khi bắt đầu',
                desc: 'Ngăn người lạ truy cập vào phòng sau khi Giảng viên đã bấm Bắt đầu trò chơi.',
              },
            ].map((item) => (
              <label
                key={item.key}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white flex items-start justify-between gap-4 cursor-pointer transition"
              >
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-900 block">
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-500 block leading-relaxed">
                    {item.desc}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(config.settings[item.key])}
                  onChange={(e) => {
                    setConfig((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        [item.key]: e.target.checked,
                      },
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-5 h-5 accent-indigo-600 rounded mt-1 shrink-0 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: GIAO DIỆN & NỘI DUNG HỆ THỐNG
      ===================================================================== */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6" data-testid="general-panel">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              🎨 Tùy chỉnh Tiêu đề Chương trình, Chuyên đề & Nội dung Hiển thị
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dễ dàng tái sử dụng hệ thống cho các lớp tập huấn, cuộc thi Olympic hoặc hội thi Rung Chuông Vàng khác.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Tiêu đề chính của Trò chơi / Hội thi
              </label>
              <input
                type="text"
                value={config.general.title}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: { ...prev.general, title: e.target.value },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                data-testid="input-general-title"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Nhãn Huy hiệu (Badge Text)
              </label>
              <input
                type="text"
                value={config.general.badgeText}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: { ...prev.general, badgeText: e.target.value },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Phụ đề trên màn hình Máy chiếu (Subtitle)
              </label>
              <input
                type="text"
                value={config.general.subtitle}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: { ...prev.general, subtitle: e.target.value },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Tên chuyên đề nổi bật (Topic Highlight)
              </label>
              <input
                type="text"
                value={config.general.topicHighlight}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: { ...prev.general, topicHighlight: e.target.value },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Lời dẫn giới thiệu chương trình
              </label>
              <input
                type="text"
                value={config.general.description}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: { ...prev.general, description: e.target.value },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Tiêu đề Thẻ Giảng viên (Host Card)
              </label>
              <input
                type="text"
                value={config.general.hostCardTitle}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: { ...prev.general, hostCardTitle: e.target.value },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900"
              />
              <textarea
                rows={2}
                value={config.general.hostCardDesc}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: { ...prev.general, hostCardDesc: e.target.value },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Tiêu đề Thẻ Học viên (Player Card)
              </label>
              <input
                type="text"
                value={config.general.playerCardTitle}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: {
                      ...prev.general,
                      playerCardTitle: e.target.value,
                    },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900"
              />
              <textarea
                rows={2}
                value={config.general.playerCardDesc}
                onChange={(e) => {
                  setConfig((prev) => ({
                    ...prev,
                    general: { ...prev.general, playerCardDesc: e.target.value },
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: QUẢN LÝ PHÒNG THI TRỰC TIẾP
      ===================================================================== */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4" data-testid="rooms-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                📡 Danh sách Phòng thi Trực tiếp đang hoạt động
              </h2>
              <p className="text-xs text-slate-500">
                Giám sát các phòng thi đang mở trên máy chủ hoặc dọn dẹp các phòng thi cũ.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchRooms}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                🔄 Làm mới
              </button>
              {rooms.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllRooms}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold cursor-pointer"
                >
                  🗑️ Đóng tất cả phòng ({rooms.length})
                </button>
              )}
            </div>
          </div>

          {loadingRooms ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Đang tải danh sách phòng thi...
            </div>
          ) : rooms.length === 0 ? (
            <div className="py-12 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm text-slate-500">
                Hiện không có phòng thi trực tiếp nào đang mở.
              </p>
              <Link
                href="/ai-tools/training-quiz?mode=host"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                <span>🖥️ Mở Màn hình Giảng viên để tạo phòng mới</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã PIN</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Tiến độ câu hỏi</th>
                    <th className="py-3 px-4">Số học viên</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((r) => (
                    <tr key={r.roomCode} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-black text-indigo-600 text-base">
                        {r.roomCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        Câu {r.currentQuestionIndex + 1} / {r.totalQuestions}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {r.playerCount} học viên
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/ai-tools/training-quiz?mode=player&room=${r.roomCode}`}
                          target="_blank"
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          Link vào phòng ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(r.roomCode)}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold cursor-pointer"
                        >
                          Đóng phòng
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
