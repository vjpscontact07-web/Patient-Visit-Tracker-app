import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const schema = JSON.parse(readFileSync(join(__dirname, "tables.json"), "utf8"));

export function getSchema() {
  return schema;
}

function columnDefinition(col) {
  if (col.primaryKey) {
    return `${col.name} ${col.type} PRIMARY KEY`;
  }

  let def = `${col.name} ${col.type}`;
  if (col.notNull) def += " NOT NULL";
  if (col.unique) def += " UNIQUE";
  if (col.default) def += ` DEFAULT ${col.default}`;
  if (col.references) {
    const { table, column, onDelete } = col.references;
    def += ` REFERENCES ${table}(${column}) ON DELETE ${onDelete}`;
  }
  return def;
}

export function buildCreateTableSql(tableName) {
  const table = schema.tables[tableName];
  if (!table) throw new Error(`Unknown table: ${tableName}`);

  const cols = table.columns.map(columnDefinition).join(",\n  ");
  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${cols}\n);`;
}

export function buildEnsureColumnSql(tableName) {
  const table = schema.tables[tableName];
  const statements = [];

  for (const col of table.columns) {
    if (col.primaryKey) continue;

    let alter = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
    if (col.notNull && col.default) {
      alter += ` NOT NULL DEFAULT ${col.default}`;
    }
    if (col.references) {
      const { table: refTable, column, onDelete } = col.references;
      alter += ` REFERENCES ${refTable}(${column}) ON DELETE ${onDelete}`;
    }
    statements.push(`${alter};`);
  }

  return statements.join("\n");
}

export function buildIndexSql(tableName) {
  const table = schema.tables[tableName];
  if (!table.indexes?.length) return "";

  return table.indexes
    .map((idx) => {
      const cols = idx.columns.join(", ");
      const order = idx.order ? ` ${idx.order}` : "";
      return `CREATE INDEX IF NOT EXISTS ${idx.name} ON ${tableName}(${cols}${order});`;
    })
    .join("\n");
}

export function buildFullSchemaSql() {
  const tableOrder = ["users", "clinicians", "patients", "visits"];
  const parts = [];

  for (const name of tableOrder) {
    parts.push(buildCreateTableSql(name));
  }

  for (const name of tableOrder) {
    parts.push(buildEnsureColumnSql(name));
  }

  parts.push(
    "UPDATE visits SET status = 'scheduled' WHERE status IS NULL OR status = '';",
  );

  for (const name of tableOrder) {
    const indexSql = buildIndexSql(name);
    if (indexSql) parts.push(indexSql);
  }

  return parts.join("\n\n");
}

export function buildStrictCleanupSql() {
  const blocks = [];

  for (const [tableName, tableDef] of Object.entries(schema.tables)) {
    const allowed = tableDef.columns.map((c) => `'${c.name}'`).join(", ");

    blocks.push(`
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = '${tableName}'
      AND column_name NOT IN (${allowed})
  LOOP
    EXECUTE format('ALTER TABLE %I DROP COLUMN %I', '${tableName}', r.column_name);
    RAISE NOTICE 'Dropped unauthorized column %.%.', '${tableName}', r.column_name;
  END LOOP;
END $$;`);
  }

  return blocks.join("\n");
}

export function getAllowedColumnNames(tableName) {
  return schema.tables[tableName]?.columns.map((c) => c.name) ?? [];
}

export function getExpectedColumns(tableName) {
  return schema.tables[tableName]?.columns.map((c) => ({
    name: c.name,
    type: c.type,
    pgType: pgTypeFromSchema(c.type),
  }));
}

function pgTypeFromSchema(type) {
  if (type.startsWith("SERIAL")) return "integer";
  if (type.startsWith("VARCHAR")) return "character varying";
  if (type === "TEXT") return "text";
  if (type === "DATE") return "date";
  if (type === "TIMESTAMPTZ") return "timestamp with time zone";
  if (type === "INTEGER") return "integer";
  return type.toLowerCase();
}
