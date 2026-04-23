import { Client } from "pg";
import { migrateTenantDB } from "../../../packages/db/migrate-tenant";

export async function createTenantDatabase(dbName: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created tenant database: ${dbName}`);
    await migrateTenantDB(dbName);
  } catch (err: any) {
    if (err.code === "42P04") console.log(`Database ${dbName} already exists`);
    else throw err;
  } finally {
    await client.end();
  }
}

export async function getTenantConnection(dbName: string) {
  const { Client } = await import("pg");
  return new Client({ connectionString: `postgresql://viniciusreinehr@localhost:5432/${dbName}?schema=public` });
}
