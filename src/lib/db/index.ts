import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzleNeon<typeof schema>>;

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

  if (isLocal) {
    const sql = postgres(connectionString);
    return drizzlePg(sql, { schema }) as unknown as Db;
  }

  const sql = neon(connectionString);
  return drizzleNeon(sql, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof createDb>];
  },
});

export * from "./schema";
