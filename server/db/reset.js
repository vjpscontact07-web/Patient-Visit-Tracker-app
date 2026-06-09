import dotenv from "dotenv";
import pool from "./pool.js";
import {
  buildFullSchemaSql,
  getAllowedColumnNames,
  getSchema,
} from "./schema/index.js";
import { seedDemoData, seedUser } from "./seed.js";

dotenv.config();

const DROP_ALL_SQL = `
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO public;
`;

const client = await pool.connect();

try {
  const url = process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    console.log(`Resetting: ${parsed.hostname}${parsed.pathname}\n`);
  }

  console.log("1. Drop all tables...");
  await client.query(DROP_ALL_SQL);

  console.log("2. Create schema from tables.json...");
  await client.query(buildFullSchemaSql());

  console.log("3. Seed demo data...");
  await seedUser(client);
  await seedDemoData(client);

  console.log("4. Verify...");
  const schema = getSchema();
  let issues = 0;

  for (const tableName of Object.keys(schema.tables)) {
    const allowed = new Set(getAllowedColumnNames(tableName));
    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName],
    );

    console.log(`\n${tableName} (${rows.length} columns):`);
    for (const col of rows) {
      const ok = allowed.has(col.column_name);
      console.log(`  ${ok ? "✓" : "✗"} ${col.column_name}`);
      if (!ok) issues += 1;
    }
  }

  const { rows: counts } = await client.query(`
    SELECT 'users' AS t, COUNT(*)::int AS n FROM users
    UNION ALL SELECT 'clinicians', COUNT(*)::int FROM clinicians
    UNION ALL SELECT 'patients', COUNT(*)::int FROM patients
    UNION ALL SELECT 'visits', COUNT(*)::int FROM visits
  `);
  console.log("\nRow counts:");
  counts.forEach((r) => console.log(`  ${r.t}: ${r.n}`));

  if (issues > 0) {
    throw new Error(`${issues} unexpected column(s)`);
  }

  console.log("\nDone. Login: admin@woundtech.net / woundtech123");
} finally {
  client.release();
  await pool.end();
}
