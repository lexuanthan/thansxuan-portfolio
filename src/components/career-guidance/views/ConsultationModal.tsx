"use client";

import React, { useState } from "react";
import { StudentCareerProfile, CareerMatchResult } from "@/lib/career-guidance/types";
import {
  HcmuteBrandMark,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconSparkles
} from "../common/CareerIcons";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentCareerProfile;
  topCareers?: CareerMatchResult[];
}

export function ConsultationModal({
  isOpen,
  onClose,
  profile,
  topCareers = [],
}: ConsultationModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const topCareerNames = topCareers.slice(0, 3).map((c) => c.career.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage("Vui lòng điền Họ tên và Số điện thoại/Zalo để chuyên gia liên hệ.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/career-guidance/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          grade: `${profile.user_context.user_type} (${profile.user_context.education_level})`,
          archetype: profile.profile_archetype.title,
          topCareers: topCareerNames,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gửi thông tin thất bại");
      }

      setSuccessMessage(
        data.message || "Đăng ký thành công! Ban cố vấn HCMUTE sẽ sớm liên hệ đồng hành cùng bạn."
      );
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[16px] bg-surface p-6 sm:p-8 shadow-2xl border border-line space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-700">
              <HcmuteBrandMark className="w-3.5 h-3.5 text-brand-600" />
              <span>Đồng Hành 1-1 Chuyên Sâu • HCMUTE</span>
            </div>
            <h3 className="text-xl font-extrabold text-ink-900 tracking-tight">
              Đăng Ký Tư Vấn & Lưu Kết Quả
            </h3>
            <p className="text-xs text-ink-500">
              Gửi hồ sơ Career DNA của bạn đến ban chuyên gia định hướng để nhận tư vấn cá nhân hóa qua Zalo/Meet.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-[8px] p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-700 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Summary Badge */}
        <div className="rounded-[10px] bg-brand-50/70 border border-brand-200 p-3.5 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink-600">Hình mẫu hiện tại:</span>
            <strong className="text-brand-800 font-bold">{profile.profile_archetype.title}</strong>
          </div>
          {topCareerNames.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-600">Nghề phù hợp nhất:</span>
              <span className="font-medium text-ink-800 truncate max-w-[220px]">
                {topCareerNames.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-800 mb-1">
              Họ và tên học sinh / sinh viên <span className="text-accent-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn An"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:bg-surface focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-800 mb-1">
                Số điện thoại / Zalo <span className="text-accent-red-600">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="09xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-[10px] border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:bg-surface focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-800 mb-1">
                Email nhận báo cáo (tuỳ chọn)
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[10px] border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:bg-surface focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-800 mb-1">
              Băn khoăn hoặc câu hỏi bạn cần giải đáp nhất?
            </label>
            <textarea
              rows={2}
              placeholder="VD: Em đang phân vân giữa ngành Công nghệ Thông tin và Tự động hóa tại HCMUTE..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-surface-soft px-3.5 py-2 text-sm text-ink-900 focus:border-brand-500 focus:bg-surface focus:outline-hidden"
            />
          </div>

          {errorMessage && (
            <div className="rounded-[8px] border border-accent-red-200 bg-accent-red-50 p-3 text-xs text-accent-red-800 flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 text-accent-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-[10px] border border-line px-4 py-2 text-xs font-semibold text-ink-600 hover:bg-surface-soft transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-[10px] bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi Đăng Ký Tư Vấn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
