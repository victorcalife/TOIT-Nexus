import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

// DATABASE_URL definida no Railway Dashboard como variável de ambiente
const DATABASE_URL = process.env.DATABASE_URL;

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