import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

// Configure para Neon (compatível com Railway PostgreSQL)
neonConfig.webSocketConstructor = ws;

// URL temporária para desenvolvimento (usar a mesma do drizzle.config.js)
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:foalaCypsSEvgsygpcDaySNcGiweMsmv@crossover.proxy.rlwy.net:41834/railway";

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set - database operations will fail");
  throw new Error(
    "DATABASE_URL must be set. Railway PostgreSQL database required.",
  );
}

// Log da conexão (sem expor credenciais)
console.log('🗄️  Connecting to PostgreSQL database...');
console.log('📍 Database host:', DATABASE_URL.includes('railway') ? 'Railway PostgreSQL' : 'External PostgreSQL');

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  // Configurações otimizadas para Railway
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // máximo de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle({ client: pool, schema });