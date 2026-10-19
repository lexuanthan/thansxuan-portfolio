import React from 'react';
import { loadPersistedQuizConfig } from '@/lib/training-quiz/configStorage';
import TrainingQuizAdminClient from './TrainingQuizAdminClient';

export const dynamic = 'force-dynamic';

export default async function TrainingQuizAdminPage() {
  const initialConfig = await loadPersistedQuizConfig();

  return <TrainingQuizAdminClient initialConfig={initialConfig} />;
}
