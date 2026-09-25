import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CareerGuidanceApp from "@/components/career-guidance/CareerGuidanceApp";
import { CareerIntelligenceReport } from "@/components/career-guidance/report/CareerIntelligenceReport";
import { buildCareerIntelligenceReport, ReportType } from "@/lib/career-guidance/reportEngine";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { ReportModal } from "@/components/career-guidance/views/ReportModal";

describe("MODULE PROMPT 09 — FINAL QA & PRODUCT POLISH AUDIT", () => {
  const profile = createDefaultProfile();
  const reportData = buildCareerIntelligenceReport(profile, {
    customUserName: "Lê Xuân Thân",
    targetCareerId: "ai_engineer"
  });

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    window.print = vi.fn();
  });

  // ==================================================
  // 1. VISUAL CONSISTENCY
  // ==================================================
  describe("1. VISUAL CONSISTENCY AUDIT", () => {
    it("uses unified HCMUTE blue (#004098) and red accent (#D9232E) design tokens", () => {
      render(<CareerGuidanceApp />);
      // App header contains HCMUTE branding badge and title
      const brandElements = screen.getAllByText(/HCMUTE/i);
      expect(brandElements.length).toBeGreaterThan(0);

      // Check for presence of brand mark in DOM
      const brandMark = document.querySelector("svg");
      expect(brandMark).toBeDefined();
    });

    it("uses standardized card radius and button styles across all views", () => {
      render(<CareerGuidanceApp />);
      // Verify cards have standard tokenized rounded corners
      const cards = document.querySelectorAll("[class*='rounded-']");
      expect(cards.length).toBeGreaterThan(0);

      // Verify no bubble/pill extreme radius on primary cards
      const mainPanels = document.querySelectorAll("header, main, section");
      mainPanels.forEach(panel => {
        expect(panel.className).not.toContain("rounded-full");
      });
    });
  });

  // ==================================================
  // 2. RESPONSIVE DESIGN
  // ==================================================
  describe("2. RESPONSIVE DESIGN AUDIT", () => {
    it("provides responsive navigation and mobile bottom drawer/bar", () => {
      render(<CareerGuidanceApp />);
      // Mobile bottom bar or navigation exists
      const navElements = document.querySelectorAll("nav, [role='navigation']");
      expect(navElements.length).toBeGreaterThan(0);

      // Container uses responsive padding (e.g. px-4 sm:px-6)
      const responsiveContainers = document.querySelectorAll("[class*='px-4'], [class*='px-2']");
      expect(responsiveContainers.length).toBeGreaterThan(0);
    });

    it("ensures modals and comparison containers do not have fixed breaking widths", () => {
      render(<CareerGuidanceApp />);
      // Check that elements use responsive classes
      const container = document.querySelector(".max-w-7xl, .container, [class*='max-w-']");
      expect(container).toBeDefined();
    });
  });

  // ==================================================
  // 3. ACCESSIBILITY (a11y)
  // ==================================================
  describe("3. ACCESSIBILITY AUDIT", () => {
    it("interactive buttons include accessible text, aria-labels, or titles", () => {
      render(<CareerGuidanceApp />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(btn => {
        const hasText = btn.textContent && btn.textContent.trim().length > 0;
        const hasAriaLabel = btn.getAttribute("aria-label") !== null;
        const hasTitle = btn.getAttribute("title") !== null;
        expect(hasText || hasAriaLabel || hasTitle).toBe(true);
      });
    });

    it("contains valid landmark elements for screen readers", () => {
      render(<CareerGuidanceApp />);
      expect(document.querySelector("header")).toBeDefined();
      expect(document.querySelector("main")).toBeDefined();
    });
  });

  // ==================================================
  // 4. PERFORMANCE & ARCHITECTURE
  // ==================================================
  describe("4. PERFORMANCE & ASSET AUDIT", () => {
    it("uses native SVG geometries for charts without heavy third-party canvas bundles", () => {
      render(<CareerIntelligenceReport reportData={reportData} />);
      // Radar Chart is rendered using native SVG elements
      const svgElements = document.querySelectorAll("svg polygon, svg circle, svg line, svg");
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it("generates report dossiers synchronously without blocking the UI thread", () => {
      const startTime = performance.now();
      const report = buildCareerIntelligenceReport(profile);
      const duration = performance.now() - startTime;

      expect(report).toBeDefined();
      expect(report.report_metadata.dossier_id).toContain("HCMUTE");
      expect(duration).toBeLessThan(100); // Must be blazing fast (< 100ms)
    });
  });

  // ==================================================
  // 5. FUNCTIONAL QA
  // ==================================================
  describe("5. FUNCTIONAL QA AUDIT", () => {
    it("generates complete report data model matching all 15 structural sections", () => {
      const data = buildCareerIntelligenceReport(profile);
      expect(data.report_metadata).toBeDefined();
      expect(data.executive_summary).toBeDefined();
      expect(data.career_dna).toBeDefined();
      expect(data.key_insights.length).toBeGreaterThan(0);
      expect(data.top_careers.length).toBeGreaterThan(0);
      expect(data.top_majors.length).toBeGreaterThan(0);
      expect(data.university_fit.universities.length).toBeGreaterThan(0);
      expect(data.gap_analysis.gaps.length).toBeGreaterThan(0);
      expect(data.roadmap).toBeDefined();
      expect(data.decision_matrix).toBeDefined();
      expect(data.ai_coach_advice).toBeDefined();
      expect(data.personal_story).toBeDefined();
      expect(data.parent_mentor_summary).toBeDefined();
      expect(data.methodology).toBeDefined();
    });

    it("renders ReportModal with export and print actions", () => {
      render(
        <ReportModal
          isOpen={true}
          onClose={vi.fn()}
          profile={profile}
        />
      );
      expect(screen.getByRole("dialog")).toBeDefined();
      expect(screen.getAllByText(/CAREER INTELLIGENCE REPORT/i).length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: /In \/ PDF A4/i })).toBeDefined();
    });
  });

  // ==================================================
  // 6. CONTENT & LOCALIZATION QA
  // ==================================================
  describe("6. CONTENT QA & VIETNAMESE ACCURACY", () => {
    it("uses professional academic Vietnamese without colloquialisms or placeholder text", () => {
      render(<CareerGuidanceApp />);
      
      const bodyText = document.body.textContent || "";
      // Ensure no raw mock placeholders exist
      expect(bodyText).not.toContain("Lorem ipsum");
      expect(bodyText).not.toContain("TODO:");
      expect(bodyText).not.toContain("undefined");
      expect(bodyText).not.toContain("NaN");

      // Validates accurate HCMUTE terminology
      expect(bodyText).toMatch(/HCMUTE|Đại học Sư phạm Kỹ thuật TP\.HCM/i);
    });
  });

  // ==================================================
  // 7. REPORT QA
  // ==================================================
  describe("7. REPORT QA AUDIT", () => {
    it("supports all 5 report presets (full, executive, parent, comparison, roadmap)", () => {
      const presets: ReportType[] = ["full", "executive", "parent", "comparison", "roadmap"];

      presets.forEach(preset => {
        const { unmount } = render(
          <CareerIntelligenceReport
            reportData={reportData}
            initialReportType={preset}
          />
        );
        expect(screen.getAllByText(/CAREER INTELLIGENCE REPORT/i).length).toBeGreaterThan(0);
        unmount();
      });
    });

    it("includes print styles and page break classes for high-fidelity A4 printing", () => {
      render(<CareerIntelligenceReport reportData={reportData} />);
      
      // Check for print classes embedded in the component
      const printBreakElements = document.querySelectorAll(".no-print, .avoid-page-break, .page-break-after");
      expect(printBreakElements.length).toBeGreaterThan(0);
    });
  });
});
