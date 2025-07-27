import { z } from 'zod';

const configSchema = z.object({
  name: z.string().optional().default('md-book'),
  author: z.string().optional().default('unknown'),
  version: z.string().optional().default('1.0.0'),
  lang: z.string().optional().default('en'),
});

export function parseConfig(obj: unknown) {
  return configSchema.parse(obj);
}
