import type { MigrationConfig } from "drizzle-orm/migrator";
import { existsSync } from "node:fs";

type Config = {
  api: APIConfig;
  db: DBConfig;
};

type APIConfig = {
  port: number;
  allowedOrigins: string[];
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

if (existsSync(".env")) {
  process.loadEnvFile();
}

function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variável de ambiente ${key} não foi definida`);
  }
  return value;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    port: Number(envOrThrow("PORT")),
    allowedOrigins: envOrThrow("ALLOWED_ORIGINS").split(","),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
};

export const PARKING_LAYOUT = [
  { type: "car", count: 20, suffix: "A" },
  { type: "motorcycle", count: 10, suffix: "B" },
] as const;
