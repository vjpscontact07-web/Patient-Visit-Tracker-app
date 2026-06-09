import pool from "./pool.js";
import { getExpectedColumns, getSchema } from "./schema/index.js";

const schema = getSchema();
const tableNames = Object.keys(schema.tables);
let issues = 0;

const { rows: tables } = await pool.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`);

console.log("Tables in database:", tables.map((t) => t.table_name).join(", "));

for (const tableName of tableNames) {
  const expected = getExpectedColumns(tableName);
  const { rows: actual } = await pool.query(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [tableName],
  );

  const actualMap = new Map(actual.map((c) => [c.column_name, c.data_type]));

  console.log(`\n=== ${tableName} ===`);
  for (const col of expected) {
    const live = actualMap.get(col.name);
    const ok =
      live &&
      (live === col.pgType ||
        (col.pgType === "character varying" && live === "text"));
    console.log(`  ${ok ? "✓" : "✗"} ${col.name} (${col.type})`);
    if (!live) {
      console.log(`    missing — expected ${col.pgType}`);
      issues += 1;
    } else if (!ok && col.name !== "notes") {
      console.log(`    wrong type — got ${live}, expected ${col.pgType}`);
      issues += 1;
    }
    actualMap.delete(col.name);
  }

  for (const [extra, type] of actualMap) {
    console.log(`  ✗ extra ${extra} (${type}) — not in tables.json`);
    issues += 1;
  }
}

console.log("\n--- Result ---");
if (issues === 0) {
  console.log("Schema matches server/db/schema/tables.json — no duplicates.");
} else {
  console.log(`${issues} issue(s). Run: npm run db:init or npm run db:reset`);
}

await pool.end();
process.exit(issues > 0 ? 1 : 0);
