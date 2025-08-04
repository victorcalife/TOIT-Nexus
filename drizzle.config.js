import { defineConfig } from "drizzle-kit";

// DATABASE_URL definida no Railway Dashboard como variável de ambiente
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});