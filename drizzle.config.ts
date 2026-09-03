import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    // Usa MIGRATE_DATABASE_URL (session/transaction pooler sem pgbouncer) para migrations
    // e DATABASE_URL como fallback para desenvolvimento local
    url: process.env.MIGRATE_DATABASE_URL || process.env.DATABASE_URL!,
  },
});
