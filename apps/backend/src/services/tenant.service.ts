import { Client } from "pg";
import fs from "fs";
import path from "path";

const tenantSchema = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_types (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  event_id VARCHAR(255) REFERENCES events(id),
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES orders(id),
  ticket_type_id VARCHAR(255) REFERENCES ticket_types(id),
  user_id VARCHAR(255) REFERENCES users(id),
  code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
`;

export async function createTenantDatabase(dbName: string) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created tenant database: ${dbName}`);
    
    const tenantClient = new Client({ connectionString: `postgresql://viniciusreinehr@localhost:5432/${dbName}?schema=public` });
    await tenantClient.connect();
    try {
      await tenantClient.query(tenantSchema);
      console.log(`Migrated tenant DB: ${dbName}`);
    } finally {
      await tenantClient.end();
    }
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
