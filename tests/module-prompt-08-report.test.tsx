import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CareerIntelligenceReport } from "@/components/career-guidance/report/CareerIntelligenceReport";
import { buildCareerIntelligenceReport } from "@/lib/career-guidance/reportEngine";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { ReportModal } from "@/components/career-guidance/views/ReportModal";

describe("MODULE PROMPT 08 — PREMIUM CAREER INTELLIGENCE REPORT", () => {
  const profile = createDefaultProfile();
  const reportData = buildCareerIntelligenceReport(profile, {
    customUserName: "Nguyễn Văn An",
    targetCareerId: "ai_engineer"
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    window.print = vi.fn();
  });

  it("1. REPORT ENGINE DATA INTEGRITY: builds exhaustive 15-section data model", () => {
    expect(reportData.report_metadata.report_title).toMatch(/career intelligence report/i);
    expect(reportData.report_metadata.user_name).toBe("Nguyễn Văn An");
    expect(reportData.report_metadata.system_version).toContain("v6.0 HCMUTE AI");
    expect(reportData.report_metadata.headline).toBe("Bản đồ định hướng nghề nghiệp cá nhân");
    expect(reportData.report_metadata.subheading).toContain("Hiểu bản thân — Khám phá cơ hội — Ra quyết định — Kiến tạo tương lai");
    
    // Executive summary
    expect(reportData.executive_summary.career_identity).toBeDefined();
    expect(reportData.executive_summary.top_strengths.length).toBeGreaterThan(0);
    expect(reportData.executive_summary.next_action).toBeDefined();

    // 4 Key Insight Pillars
    expect(reportData.key_insights.length).toBeGreaterThan(0);
    const firstInsight = reportData.key_insights[0];
    expect(firstInsight.insight).toBeDefined();
    expect(firstInsight.evidence).toBeDefined();
    expect(firstInsight.meaning).toBeDefined();
    expect(firstInsight.implication).toBeDefined();

    // Decision matrix (neutral comparison without winner)
    expect(reportData.decision_matrix.career_names.length).toBe(2);
    expect(reportData.decision_matrix.rows.length).toBeGreaterThan(3);

    // AI Coach 5 Pillars
    expect(reportData.ai_coach_advice.what_i_see).toBeDefined();
    expect(reportData.ai_coach_advice.what_matters_most).toBeDefined();
    expect(reportData.ai_coach_advice.what_to_explore.length).toBeGreaterThan(0);
    expect(reportData.ai_coach_advice.what_to_improve.length).toBeGreaterThan(0);
    expect(reportData.ai_coach_advice.what_to_do_next.length).toBeGreaterThan(0);

    // Personal story & Parent summary
    expect(reportData.personal_story.story_text).toBeDefined();
    expect(reportData.parent_mentor_summary.strengths.length).toBeGreaterThan(0);
    expect(reportData.parent_mentor_summary.risks.length).toBeGreaterThan(0);
    expect(reportData.parent_mentor_summary.how_to_support.length).toBeGreaterThan(0);

    // Methodology
    expect(reportData.methodology.data_sources.length).toBeGreaterThan(0);
    expect(reportData.methodology.limitations.length).toBeGreaterThan(0);
  });

  it("2. COVER PAGE: renders premium cover with HCMUTE identity, headline, subheading, and metadata", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getByText("Bản đồ định hướng nghề nghiệp cá nhân")).toBeDefined();
    expect(screen.getByText(/Hiểu bản thân — Khám phá cơ hội — Ra quyết định — Kiến tạo tương lai/)).toBeDefined();
    expect(screen.getByText("Nguyễn Văn An")).toBeDefined();
    expect(screen.getAllByText(/v6.0 HCMUTE AI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Trường Đại học Sư phạm Kỹ thuật TP.HCM/i).length).toBeGreaterThan(0);
  });

  it("3. EXECUTIVE SUMMARY: displays Career Identity, Top Strengths, Top Match, and Next Action", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Tóm tắt Điều hành/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(reportData.executive_summary.career_identity).length).toBeGreaterThan(0);
    expect(screen.getAllByText(reportData.executive_summary.top_match_title).length).toBeGreaterThan(0);
    expect(screen.getByText(/Thế mạnh Cạnh tranh Hàng đầu/i)).toBeDefined();
    expect(screen.getByText(/Hành động Trọng tâm Tiếp theo/i)).toBeDefined();
  });

  it("4. CAREER DNA: displays Archetype, Radar Chart, Capabilities, and Preferred Environment", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Bản đồ Năng lực & Career DNA/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(reportData.career_dna.archetype_title).length).toBeGreaterThan(0);
    expect(screen.getByText(/Biểu đồ Đa giác Năng lực & Sở thích/i)).toBeDefined();
    expect(screen.getByText(/Môi trường Làm việc Lý tưởng:/i)).toBeDefined();
  });

  it("5. KEY INSIGHTS: renders structured 4 pillars (INSIGHT, EVIDENCE, MEANING, IMPLICATION)", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Phân tích Chuyên sâu/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/INSIGHT \(Phát hiện\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/EVIDENCE \(Bằng chứng thực tế\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MEANING \(Bản chất tâm lý & tố chất\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/IMPLICATION \(Hàm ý lựa chọn ngành\/nghề\)/i).length).toBeGreaterThan(0);
  });

  it("6. TOP CAREER & MAJOR MATCHES: displays detailed fit breakdown, salary, and study profile", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    // Careers
    expect(screen.getAllByText(/Top Nghề nghiệp Khuyến nghị Hàng đầu/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(reportData.top_careers[0].career.name).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lý do phù hợp \(Why it fits\):/i).length).toBeGreaterThan(0);

    // Majors
    expect(screen.getAllByText(/Top Ngành học Khuyến nghị/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(reportData.top_majors[0].major.name).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Độ nặng Toán/i).length).toBeGreaterThan(0);
  });

  it("7. UNIVERSITY FIT: displays 5 dimensions (academic, admission, financial, location, career)", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Độ Tương thích Cơ sở Đại học/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Học thuật").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Trúng tuyển").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Học phí/Tài chính").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Vị trí").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cơ hội nghề").length).toBeGreaterThan(0);
  });

  it("8. GAP ANALYSIS & ROADMAP: renders 5-horizon roadmap and prioritized skill gaps", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Phân tích Khoảng trống Năng lực/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lộ trình Hành động Cá nhân hóa/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Khoảng trống \(Gap\)/i).length).toBeGreaterThan(0);
  });

  it("9. DECISION MATRIX: compares top choices neutrally without declaring an arbitrary winner", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Ma trận Khác biệt Quyết định/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tiêu chí So sánh Độc lập/i)).toBeDefined();
    expect(screen.getByText(/Không áp đặt “Người chiến thắng”/i)).toBeDefined();
    expect(screen.getByText(/Độ tương thích hồ sơ \(Match Fit\)/i)).toBeDefined();
  });

  it("10. AI COACH ADVICE: renders 5 structured pillars", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Khuyến nghị từ AI Coach/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WHAT I SEE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WHAT MATTERS MOST/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WHAT TO EXPLORE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WHAT TO IMPROVE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WHAT TO DO NEXT/i).length).toBeGreaterThan(0);
  });

  it("11. PERSONAL STORY & PARENT/MENTOR: renders grounded narrative and guidance", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Câu chuyện Nghề nghiệp của Bạn/i).length).toBeGreaterThan(0);
    expect(screen.getByText(reportData.personal_story.narrative_title)).toBeDefined();

    expect(screen.getAllByText(/Bản Tóm tắt Dành cho Phụ huynh & Cố vấn/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Điểm mạnh Thật của Học sinh/i)).toBeDefined();
    expect(screen.getByText(/Rủi ro & Áp lực Cần lưu ý/i)).toBeDefined();
    expect(screen.getByText(/Cách Đồng hành Hiệu quả Nhất/i)).toBeDefined();
  });

  it("12. METHODOLOGY: transparently lists algorithms, data sources, and limitations", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    expect(screen.getAllByText(/Phương pháp luận & Giới hạn Báo cáo/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Dữ liệu Đầu vào Hồ sơ:/i)).toBeDefined();
    expect(screen.getByText(/Nguồn Dữ liệu Đối chiếu:/i)).toBeDefined();
    expect(screen.getByText(/Lưu ý Giới hạn Báo cáo:/i)).toBeDefined();
  });

  it("13. REPORT TYPES SWITCHER: switches presets (executive, parent, comparison, roadmap, full)", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    // Switch to Executive preset
    const execBtn = screen.getByRole("button", { name: "Executive" });
    fireEvent.click(execBtn);

    // Executive summary should be visible
    expect(screen.getAllByText(/Tóm tắt Điều hành/i).length).toBeGreaterThan(0);
    // Career DNA should be hidden in Executive view
    expect(screen.queryByText(/Bản đồ Năng lực & Career DNA/i)).toBeNull();

    // Switch to Parent preset
    const parentBtn = screen.getByRole("button", { name: "Phụ huynh" });
    fireEvent.click(parentBtn);
    expect(screen.getAllByText(/Bản Tóm tắt Dành cho Phụ huynh & Cố vấn/i).length).toBeGreaterThan(0);

    // Switch back to Full
    const fullBtn = screen.getByRole("button", { name: "Toàn diện" });
    fireEvent.click(fullBtn);
    expect(screen.getAllByText(/Bản đồ Năng lực & Career DNA/i).length).toBeGreaterThan(0);
  });

  it("14. WEB CONTROLS: triggers Print, Collapse All, and Share Modal", () => {
    render(<CareerIntelligenceReport reportData={reportData} />);

    // Print button
    const printBtn = screen.getByRole("button", { name: /In \/ PDF A4/i });
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);

    // Collapse All toggle
    const collapseBtn = screen.getByRole("button", { name: /Thu gọn tất cả/i });
    fireEvent.click(collapseBtn);
    expect(screen.getByRole("button", { name: /Mở rộng tất cả/i })).toBeDefined();

    // Share button & modal
    const shareBtn = screen.getByRole("button", { name: /Chia sẻ/i });
    fireEvent.click(shareBtn);
    expect(screen.getByText(/Chế độ Quyền riêng tư/i)).toBeDefined();
    expect(screen.getByText(/Riêng tư \(Chỉ mình bạn xem\)/i)).toBeDefined();
    expect(screen.getByText(/Chia sẻ Bản Tóm tắt/i)).toBeDefined();
    expect(screen.getByText(/Chia sẻ Toàn diện/i)).toBeDefined();

    // Test copy link
    const copyBtn = screen.getByRole("button", { name: /Sao chép/i });
    fireEvent.click(copyBtn);
    expect(screen.getByText(/Đã sao chép liên kết vào bộ nhớ tạm!/i)).toBeDefined();
  });

  it("15. MODAL WRAPPER: ReportModal renders CareerIntelligenceReport cleanly with modal semantics", () => {
    const handleClose = vi.fn();
    render(<ReportModal isOpen={true} onClose={handleClose} profile={profile} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/Bản đồ định hướng nghề nghiệp cá nhân/i)).toBeDefined();
  });
});
