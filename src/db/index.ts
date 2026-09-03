import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

const poolConfig: ConstructorParameters<typeof Pool>[0] = {
  connectionString: databaseUrl,
  // Configurações recomendadas para ambiente serverless (Vercel + Supabase)
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Desabilita prepare em ambientes com PgBouncer/Supabase pooling
if (databaseUrl.includes("pgbouncer=true")) {
  (poolConfig as Record<string, unknown>).prepare = false;
}

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
