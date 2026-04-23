import { Client } from "pg";
import fs from "fs";
import path from "path";

const schemaSQL = fs.readFileSync(path.join(__dirname, "tenant-schema.sql"), "utf8");

export async function migrateTenantDB(dbName: string) {
  const client = new Client({ connectionString: `postgresql://viniciusreinehr@localhost:5432/${dbName}?schema=public` });
  await client.connect();
  try {
    await client.query(schemaSQL);
    console.log(`Migrated tenant DB: ${dbName}`);
  } finally {
    await client.end();
  }
}
