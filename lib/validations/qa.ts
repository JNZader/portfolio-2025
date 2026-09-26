import { z } from 'zod';
import { QA_LOCALE } from '@/lib/qa';

export const QA_QUERY_MAX_LENGTH = 500;

export const qaQuerySchema = z.object({
  query: z.string().trim().min(1).max(QA_QUERY_MAX_LENGTH),
  locale: z.enum([QA_LOCALE.ES, QA_LOCALE.EN]),
});

export type QaQueryInput = z.infer<typeof qaQuerySchema>;
