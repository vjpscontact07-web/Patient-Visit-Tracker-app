import pool from "./pool.js";
import { buildFullSchemaSql, buildStrictCleanupSql } from "./schema/index.js";
import { seedDemoData, seedUser } from "./seed.js";

async function init() {
  const client = await pool.connect();
  try {
    await client.query(buildFullSchemaSql());
    await client.query(buildStrictCleanupSql());

    const { rows: existingUsers } = await client.query(
      "SELECT id FROM users ORDER BY id ASC LIMIT 1",
    );

    if (!existingUsers.length) {
      await seedUser(client);
    }

    const { rows: clinicianCount } = await client.query(
      "SELECT COUNT(*)::int AS n FROM clinicians",
    );
    if (clinicianCount[0].n === 0) {
      await seedDemoData(client);
    }

    console.log("Database initialized successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

init().catch((err) => {
  console.error("Database initialization failed:", err.message);
  process.exit(1);
});
