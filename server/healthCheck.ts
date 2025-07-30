import { db } from "./db";

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await db.execute(`SELECT 1 as test`);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

export async function checkRequiredEnvironmentVariables(): Promise<string[]> {
  const missing = [];
  
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.SESSION_SECRET) missing.push("SESSION_SECRET");
  if (!process.env.REPL_ID) missing.push("REPL_ID");
  
  return missing;
}