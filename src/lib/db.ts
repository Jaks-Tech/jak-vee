import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env.local");
}

export const db = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 3,
});
