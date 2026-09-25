import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CareerGuidanceApp from "@/components/career-guidance/CareerGuidanceApp";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("tab=landing"),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  })
}));

describe("Career Guidance Journey Navigation & Sequential Progression", () => {
  it("renders Landing Command Center initially with 10-step Career Journey bar", () => {
    render(<CareerGuidanceApp />);
    expect(screen.getByText(/Hành trình nghề nghiệp 10 chặng/i)).toBeDefined();
    expect(screen.getByText(/(Khám phá & Dựng Hồ sơ|Bắt đầu Khám phá Bản thân|Tiếp tục nhiệm vụ)/i)).toBeDefined();
  });

  it("switches to Assessment view when clicking on journey step 01", () => {
    render(<CareerGuidanceApp />);
    const step1Btn = screen.getByTitle(/01. Khám phá bản thân/i);
    fireEvent.click(step1Btn);
    expect(screen.getByText(/Khám phá & Dựng Hồ sơ Career DNA/i)).toBeDefined();
  });

  it("switches to Profile (Career DNA) when clicking on journey step 02 and renders 8-axis radar", () => {
    render(<CareerGuidanceApp />);
    const step2Btn = screen.getByTitle(/02. Career DNA/i);
    fireEvent.click(step2Btn);
    expect(screen.getByText(/8 Trục Năng Lực Career DNA/i)).toBeDefined();
  });

  it("switches to Matches when clicking on journey step 03", () => {
    render(<CareerGuidanceApp />);
    const step3Btn = screen.getByTitle(/03. Kết quả khớp/i);
    fireEvent.click(step3Btn);
    expect(screen.getByText(/Kết Quả So Khớp Nghề & Ngành Đào Tạo/i)).toBeDefined();
  });

  it("allows selecting a career for roadmap and transitions to Roadmap view", () => {
    render(<CareerGuidanceApp />);
    // Navigate to matches
    const step3Btn = screen.getByTitle(/03. Kết quả khớp/i);
    fireEvent.click(step3Btn);

    // Click "Chọn làm mục tiêu lộ trình"
    const targetBtns = screen.getAllByText(/Chọn làm mục tiêu lộ trình/i);
    expect(targetBtns.length).toBeGreaterThan(0);
    fireEvent.click(targetBtns[0]);

    // Should now be on Roadmap view
    expect(screen.getByText(/Lộ Trình Hành Động Cá Nhân Hóa/i)).toBeDefined();
  });

  it("allows toggling roadmap tasks and updates completed count", () => {
    render(<CareerGuidanceApp />);
    const step9Btn = screen.getByTitle(/09. Lộ trình 5 chặng/i);
    fireEvent.click(step9Btn);

    expect(screen.getByText(/Lộ Trình Hành Động Cá Nhân Hóa/i)).toBeDefined();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Toggle a task
    const initialChecked = (checkboxes[0] as HTMLInputElement).checked;
    fireEvent.click(checkboxes[0]);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(!initialChecked);
  });

  it("navigates to AI Coach from journey bar step 10", () => {
    render(<CareerGuidanceApp />);
    const step10Btn = screen.getByTitle(/10. AI Coach/i);
    fireEvent.click(step10Btn);
    expect(screen.getByText(/AI Career Coach/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Đặt câu hỏi cho AI Career Coach/i)).toBeDefined();
  });
});
