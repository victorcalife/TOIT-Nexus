import { defineConfig } from "drizzle-kit";

// URL temporária para migrations Railway
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@crossover.proxy.rlwy.net:41834/railway";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});