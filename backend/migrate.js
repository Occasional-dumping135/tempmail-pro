require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Ensure schema_migrations exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(50) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get applied migrations
    const { rows: applied } = await client.query("SELECT version FROM schema_migrations");
    const appliedSet = new Set(applied.map(r => r.version));

    // Get all migration files
    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const version = file.replace(".sql", "");
      if (appliedSet.has(version)) {
        console.log(`SKIP: ${version} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      console.log(`APPLYING: ${version}`);
      
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
        await client.query("COMMIT");
        console.log(`SUCCESS: ${version}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`FAILED: ${version}`, err.message);
        throw err;
      }
    }
    console.log("All migrations completed!");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
