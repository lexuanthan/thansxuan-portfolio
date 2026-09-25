import defaultConfig from "@/data/career_guidance_config.json";

export interface CareerGuidanceSystemConfig {
  coach: {
    system_prompt: string;
    coaching_tone: "empathetic" | "balanced" | "pragmatic" | "analytical";
    ai_provider: "auto" | "cloudflare" | "smart_local";
    temperature: number;
    quick_prompts: string[];
  };
  platform: {
    banner_message: string;
    banner_active: boolean;
    show_ai_exposure_risk: boolean;
    weights: {
      interests: number;
      capabilities: number;
      values: number;
      academic: number;
    };
  };
  curated: {
    featured_career_ids: string[];
    priority_major_ids: string[];
  };
  consultation: {
    enabled: boolean;
    contact_email: string;
    hotline: string;
    notes: string;
  };
  updated_at: string;
}

export const DEFAULT_CAREER_CONFIG: CareerGuidanceSystemConfig = defaultConfig as CareerGuidanceSystemConfig;

/**
 * Lấy cấu hình hệ thống Hướng nghiệp đang hiệu lực
 */
export function getActiveCareerConfig(): CareerGuidanceSystemConfig {
  return DEFAULT_CAREER_CONFIG;
}
