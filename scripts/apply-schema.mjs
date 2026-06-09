import { readdir, readFile } from "node:fs/promises";
import { Client } from "pg";

function parseEnv(contents) {
  const env = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    env[key] = rawValue.replace(/^"|"$/g, "");
  }

  return env;
}

const env = parseEnv(await readFile(".env.local", "utf8"));
const connectionString = env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is missing from .env.local");
}

const migrationDir = "supabase/migrations";
const migrationFiles = (await readdir(migrationDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  for (const file of migrationFiles) {
    const sql = await readFile(`${migrationDir}/${file}`, "utf8");
    await client.query(sql);
    console.log(`Applied ${file}`);
  }

  console.log("Schema and storage buckets applied successfully.");
} finally {
  await client.end();
}
