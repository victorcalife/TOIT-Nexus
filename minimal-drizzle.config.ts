import type { Config } from 'drizzle-kit';

export default {
  schema: './minimal-schema.ts',
  out: './minimal-drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
} satisfies Config;