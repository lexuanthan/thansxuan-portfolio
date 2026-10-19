import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  DEFAULT_TRAINING_QUIZ_CONFIG,
  TrainingQuizSystemConfig,
  resetActiveQuizConfigToDefault,
} from '@/lib/training-quiz/configManager';
import {
  loadPersistedQuizConfig,
  savePersistedQuizConfig,
} from '@/lib/training-quiz/configStorage';
import {
  generateQuizCsvContent,
  generateQuizExcelBuffer,
  parseQuizExcelBuffer,
} from '@/lib/training-quiz/excelParser';
import { TRAINING_QUIZ_QUESTIONS } from '@/lib/training-quiz/questionsData';
import { QuizRoomManager } from '@/lib/training-quiz/roomManager';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const isTemplate = url.searchParams.get('template') === '1';
    const includeRooms = url.searchParams.get('includeRooms') === '1';

    const config = await loadPersistedQuizConfig();

    // Download Excel (.xlsx) template or current bank
    if (format === 'xlsx') {
      const targetQuestions = isTemplate
        ? TRAINING_QUIZ_QUESTIONS.slice(0, 5)
        : config.questions;
      const xlsxBytes = generateQuizExcelBuffer(targetQuestions);
      const fileName = isTemplate
        ? 'Mau_Cau_Hoi_Tap_Huan_HCMUTE.xlsx'
        : `Ngan_Hang_Cau_Hoi_Tap_Huan_${targetQuestions.length}cau.xlsx`;

      return new Response(xlsxBytes as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // Download CSV (.csv) template or current bank
    if (format === 'csv') {
      const targetQuestions = isTemplate
        ? TRAINING_QUIZ_QUESTIONS.slice(0, 5)
        : config.questions;
      const csvContent = generateQuizCsvContent(targetQuestions);
      const fileName = isTemplate
        ? 'Mau_Cau_Hoi_Tap_Huan_HCMUTE.csv'
        : `Ngan_Hang_Cau_Hoi_Tap_Huan_${targetQuestions.length}cau.csv`;

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    if (includeRooms) {
      const manager = QuizRoomManager.getInstance();
      const activeRooms = manager.getAllRooms().map((r) => ({
        roomCode: r.roomCode,
        status: r.status,
        currentQuestionIndex: r.currentQuestionIndex,
        totalQuestions: r.questions.length,
        playerCount: Object.keys(r.players).length,
        createdAt: r.createdAt,
        lastActivityAt: r.lastActivityAt,
      }));
      return NextResponse.json({
        ...config,
        config,
        rooms: activeRooms,
        activeRooms,
      });
    }

    return NextResponse.json({
      ...config,
      config,
    });
  } catch (error) {
    console.error('Failed to load training quiz config:', error);
    return NextResponse.json({
      ...DEFAULT_TRAINING_QUIZ_CONFIG,
      config: DEFAULT_TRAINING_QUIZ_CONFIG,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication in production
    if (process.env.NODE_ENV === 'production' && !process.env.VITEST) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return NextResponse.json(
            { error: 'Unauthorized. Vui lòng đăng nhập quyền quản trị.' },
            { status: 401 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Unauthorized. Vui lòng đăng nhập quyền quản trị.' },
          { status: 401 }
        );
      }
    }

    const contentType = req.headers.get('content-type') || '';

    // Support multipart/form-data file upload for Excel/CSV parsing
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const defaultTimeLimit =
        Number(
          formData.get('defaultTimeLimitSeconds') || formData.get('timeLimit')
        ) || 15;

      if (!file) {
        return NextResponse.json(
          { error: 'Vui lòng chọn file Excel (.xlsx, .xls) hoặc .csv để tải lên.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const parsed = await parseQuizExcelBuffer(
        arrayBuffer,
        file.name,
        defaultTimeLimit
      );

      if (parsed.questions.length === 0) {
        return NextResponse.json(
          {
            error:
              'Không đọc được câu hỏi hợp lệ nào từ file. Hãy kiểm tra lại cột Câu hỏi và 4 phương án A, B, C, D.',
            warnings: parsed.warnings,
            errors: parsed.warnings,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        questions: parsed.questions,
        warnings: parsed.warnings,
        errors: parsed.warnings,
        totalRowsRead: parsed.totalRowsRead,
      });
    }

    const body = await req.json().catch(() => ({}));

    // Room management operations from Admin
    if (body?.op === 'delete_room' && typeof body.roomCode === 'string') {
      const manager = QuizRoomManager.getInstance();
      const deleted = manager.deleteRoom(body.roomCode);
      const rooms = manager.getAllRooms().map((r) => ({
        roomCode: r.roomCode,
        status: r.status,
        currentQuestionIndex: r.currentQuestionIndex,
        totalQuestions: r.questions.length,
        playerCount: Object.keys(r.players).length,
        createdAt: r.createdAt,
      }));
      return NextResponse.json({
        success: deleted,
        rooms,
        message: deleted
          ? `Đã đóng phòng ${body.roomCode.toUpperCase()}`
          : 'Không tìm thấy phòng',
      });
    }

    if (body?.op === 'clear_rooms') {
      const manager = QuizRoomManager.getInstance();
      manager.reset();
      return NextResponse.json({
        success: true,
        message: 'Đã đóng tất cả các phòng thi đang mở.',
      });
    }

    if (body?.op === 'reset_default') {
      const defaultCfg = resetActiveQuizConfigToDefault();
      const saved = await savePersistedQuizConfig(defaultCfg);
      return NextResponse.json({
        success: true,
        message: 'Đã khôi phục bộ 15 câu hỏi và cấu hình mặc định thành công!',
        config: saved.config,
      });
    }

    // Standard Save Config
    const payload = (body?.config || body) as Partial<TrainingQuizSystemConfig>;
    const saved = await savePersistedQuizConfig(payload);

    return NextResponse.json({
      success: true,
      message: 'Đã lưu cấu hình Hệ thống Đấu Trí Đoàn - Hội thành công!',
      config: saved.config,
      persistedToSupabase: saved.persistedToSupabase,
      persistedToFile: saved.persistedToFile,
    });
  } catch (error) {
    console.error('Error in POST /api/quiz/config:', error);
    return NextResponse.json(
      { error: 'Không thể xử lý yêu cầu cấu hình Training Quiz' },
      { status: 500 }
    );
  }
}
