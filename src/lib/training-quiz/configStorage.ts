import fs from 'fs';
import path from 'path';
import { createClient as createDirectClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/config';
import {
  DEFAULT_TRAINING_QUIZ_CONFIG,
  TrainingQuizSystemConfig,
  getActiveQuizConfig,
  normalizeQuizConfig,
  setActiveQuizConfig,
} from './configManager';

const CONFIG_FILE_PATH = path.join(
  process.cwd(),
  'src',
  'data',
  'training_quiz_config.json'
);

const CACHE_TTL_MS = 8000;

function getSupabaseAdminOrAnonClient() {
  if (!isSupabaseConfigured) return null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  return createDirectClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Loads the persisted Training Quiz configuration.
 * Order of precedence:
 * 1. Fresh in-memory cache (`globalThis.__TRAINING_QUIZ_CONFIG__`)
 * 2. Supabase `settings.social._training_quiz_config` (in production / non-test runtime)
 * 3. Local JSON file (`src/data/training_quiz_config.json`)
 * 4. `DEFAULT_TRAINING_QUIZ_CONFIG`
 */
export async function loadPersistedQuizConfig(
  forceRefresh = false
): Promise<TrainingQuizSystemConfig> {
  // In unit test environments, use in-memory config directly for deterministic tests
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
    return getActiveQuizConfig();
  }

  const now = Date.now();
  if (
    !forceRefresh &&
    globalThis.__TRAINING_QUIZ_CONFIG__ &&
    globalThis.__TRAINING_QUIZ_CONFIG_FETCHED_AT__ &&
    now - globalThis.__TRAINING_QUIZ_CONFIG_FETCHED_AT__ < CACHE_TTL_MS
  ) {
    return globalThis.__TRAINING_QUIZ_CONFIG__;
  }

  // 1. Try Supabase settings.social._training_quiz_config
  try {
    const client = getSupabaseAdminOrAnonClient();
    if (client) {
      const { data, error } = await client
        .from('settings')
        .select('social')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data?.social && typeof data.social === 'object') {
        const rawQuizConfig = (data.social as Record<string, unknown>)
          ._training_quiz_config as Partial<TrainingQuizSystemConfig> | undefined;
        if (rawQuizConfig && typeof rawQuizConfig === 'object') {
          return setActiveQuizConfig(rawQuizConfig);
        }
      }
    }
  } catch {
    // Fallback to local file if Supabase is unreachable
  }

  // 2. Try local JSON file
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const rawText = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(rawText) as Partial<TrainingQuizSystemConfig>;
      return setActiveQuizConfig(parsed);
    }
  } catch {
    // Fallback to default
  }

  return setActiveQuizConfig(DEFAULT_TRAINING_QUIZ_CONFIG);
}

/**
 * Saves the Training Quiz configuration to memory, Supabase (`settings.social._training_quiz_config`),
 * and local JSON file (`src/data/training_quiz_config.json`).
 */
export async function savePersistedQuizConfig(
  input: Partial<TrainingQuizSystemConfig>
): Promise<{ config: TrainingQuizSystemConfig; persistedToSupabase: boolean; persistedToFile: boolean }> {
  const normalized = normalizeQuizConfig({
    ...input,
    updated_at: new Date().toISOString(),
  });

  setActiveQuizConfig(normalized);

  let persistedToSupabase = false;
  let persistedToFile = false;

  // 1. Save to local JSON file (works locally / dev)
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
    persistedToFile = true;
  } catch {
    // Read-only filesystem on Vercel serverless is expected
  }

  // 2. Save to Supabase settings.social._training_quiz_config (works on Vercel serverless)
  if (!process.env.VITEST && process.env.NODE_ENV !== 'test') {
    try {
      const client = getSupabaseAdminOrAnonClient();
      if (client) {
        const { data: existing } = await client
          .from('settings')
          .select('social')
          .eq('id', 1)
          .maybeSingle();

        const currentSocial =
          existing?.social && typeof existing.social === 'object'
            ? (existing.social as Record<string, unknown>)
            : {};

        const updatedSocial = {
          ...currentSocial,
          _training_quiz_config: normalized,
        };

        const { error } = await client
          .from('settings')
          .update({
            social: updatedSocial,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 1);

        if (!error) {
          persistedToSupabase = true;
        }
      }
    } catch {
      // Ignore Supabase write errors if offline
    }
  }

  return {
    config: normalized,
    persistedToSupabase,
    persistedToFile,
  };
}
