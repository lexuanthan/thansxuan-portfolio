import { describe, expect, it } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  DEFAULT_HOME_CONFIG,
  resolveFeaturedShowcase,
  resolveHomeConfig,
} from "@/lib/home-config";
import { FALLBACK_AI_TOOLS, FALLBACK_PROJECTS, FALLBACK_SETTINGS } from "@/lib/fallback";
import { describeScoreScale } from "@/components/UniversityLookup";
import { HeroLxt3D } from "@/components/home/HeroLxt3D";
import {
  AiToolsDirectory,
  classifyToolGroup,
  isComingSoonTool,
  normalizeToolLink,
} from "@/components/tools/AiToolsDirectory";

describe("Master Upgrade Synchronization & Data Contract (T01 - T18)", () => {
  it("resolves DEFAULT_HOME_CONFIG cleanly from FALLBACK_SETTINGS", () => {
    const config = resolveHomeConfig(FALLBACK_SETTINGS);
    expect(config.eyebrow).toBe("TRUYỀN THÔNG / SÁNG TẠO / CÔNG NGHỆ");
    expect(config.headline_line1).toBe("Tư duy sáng tạo.");
    expect(config.headline_line2).toBe("Kiến tạo giá trị.");
    expect(config.hero_mode).toBe("3d");
    expect(config.motion_preset).toBe("standard");
    expect(config.featured_ids).toEqual([
      "career-guidance-v3",
      "logo-composer",
      "training-quiz",
    ]);
    expect(config.sections).toHaveLength(5);
  });

  it("supports Draft Preview (useDraft: true) without mutating live config", () => {
    const settingsWithDraft = {
      ...FALLBACK_SETTINGS,
      social: {
        _home_config: {
          headline_line1: "Bản chính thức.",
          draft: {
            headline_line1: "Bản nháp đang thử nghiệm.",
            hero_mode: "portrait" as const,
          },
        },
      },
    };

    const liveConfig = resolveHomeConfig(settingsWithDraft, { useDraft: false });
    const draftConfig = resolveHomeConfig(settingsWithDraft, { useDraft: true });

    expect(liveConfig.headline_line1).toBe("Bản chính thức.");
    expect(liveConfig.hero_mode).toBe("3d");
    expect(draftConfig.headline_line1).toBe("Bản nháp đang thử nghiệm.");
    expect(draftConfig.hero_mode).toBe("portrait");
  });

  it("resolves the 3 Featured Showcase cards by ID and filters out unpublished items (T04)", () => {
    const items = resolveFeaturedShowcase(
      FALLBACK_AI_TOOLS,
      FALLBACK_PROJECTS,
      DEFAULT_HOME_CONFIG.featured_ids
    );

    expect(items).toHaveLength(3);
    expect(items[0].id).toBe("career-guidance-v3");
    expect(items[0].shortTitle).toBe("AI Hướng nghiệp");
    expect(items[0].href).toBe("/ai-tools/career-guidance");

    expect(items[1].id).toBe("logo-composer");
    expect(items[1].shortTitle).toBe("Canvas Studio");
    expect(items[1].href).toBe("/ai-tools/logo-composer");

    expect(items[2].id).toBe("training-quiz");
    expect(items[2].shortTitle).toBe("Game Tập huấn");
    expect(items[2].href).toBe("/ai-tools/training-quiz");

    // When one of the featured tools is unpublished, it must NOT appear in the showcase
    const toolsWithHiddenCanvas = FALLBACK_AI_TOOLS.map((t) =>
      t.id === "logo-composer" ? { ...t, published: false } : t
    );
    const filteredItems = resolveFeaturedShowcase(
      toolsWithHiddenCanvas,
      FALLBACK_PROJECTS,
      DEFAULT_HOME_CONFIG.featured_ids
    );
    expect(filteredItems.some((i) => i.id === "logo-composer")).toBe(false);
    expect(filteredItems).toHaveLength(3);
  });

  it("classifies university cutoff score scales accurately without altering raw scores (T09)", () => {
    const s30 = describeScoreScale(26.75);
    expect(s30.scaleLabel).toBe("Thang 30");
    expect(s30.isNonStandard30).toBe(false);

    const s40 = describeScoreScale(35.42);
    expect(s40.scaleLabel).toBe("Thang 40");
    expect(s40.isNonStandard30).toBe(true);

    const s100 = describeScoreScale(73.13);
    expect(s100.scaleLabel).toBe("Thang 100");
    expect(s100.isNonStandard30).toBe(true);

    const s1200 = describeScoreScale(851);
    expect(s1200.scaleLabel).toBe("Thang 1200");
    expect(s1200.isNonStandard30).toBe(true);
  });

  it("renders HeroLxt3D in 3d, image, and portrait modes with motion presets (T05, T06)", () => {
    const { unmount } = render(
      <HeroLxt3D mode="3d" motionPreset="standard" authorName="Lê Xuân Thân" />
    );
    const el3d = screen.getByTestId("hero-lxt-visual");
    expect(el3d.getAttribute("data-hero-mode")).toBe("3d");
    unmount();

    const { unmount: unmountStatic } = render(
      <HeroLxt3D mode="3d" motionPreset="static" authorName="Lê Xuân Thân" />
    );
    const elStatic = screen.getByTestId("hero-lxt-visual");
    expect(elStatic.getAttribute("data-motion-preset")).toBe("static");
    unmountStatic();

    render(
      <HeroLxt3D
        mode="image"
        posterUrl="/banner.png"
        authorName="Lê Xuân Thân"
      />
    );
    const elImage = screen.getByTestId("hero-lxt-visual");
    expect(elImage.getAttribute("data-hero-mode")).toBe("image");
  });

  it("normalizes University Lookup links and filters tools in AiToolsDirectory (T08, T10)", () => {
    expect(normalizeToolLink("#tra-cuu-dai-hoc")).toBe("/ai-tools/tra-cuu-dai-hoc");
    expect(normalizeToolLink("/#tra-cuu-dai-hoc")).toBe("/ai-tools/tra-cuu-dai-hoc");

    const comingSoonTool = FALLBACK_AI_TOOLS.find(
      (t) => t.id === "content-generator"
    )!;
    expect(isComingSoonTool(comingSoonTool)).toBe(true);
    expect(classifyToolGroup(FALLBACK_AI_TOOLS[1])).toBe("career");

    render(<AiToolsDirectory tools={FALLBACK_AI_TOOLS} />);

    // Search input filters tools
    const searchInput = screen.getByLabelText("Tìm kiếm công cụ");
    fireEvent.change(searchInput, { target: { value: "Ghép Logo" } });
    expect(screen.getByText(/Ghép Logo & Chữ lên ảnh/i)).toBeDefined();
  });
});
