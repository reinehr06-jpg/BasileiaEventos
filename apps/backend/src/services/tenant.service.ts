import { Client } from "pg";
import fs from "fs";
import path from "path";

const tenantSchema = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- 'admin', 'porteiro', 'user'
  restricted_zone_id VARCHAR(255), -- If role is porteiro, they might be locked to a zone
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
  facial_enabled BOOLEAN DEFAULT false,
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
  external_id VARCHAR(255) UNIQUE,
  user_id VARCHAR(255) REFERENCES users(id),
  event_id VARCHAR(255) REFERENCES events(id),
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  buyer_name VARCHAR(255),
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(50),
  buyer_document VARCHAR(50),
  payment_method VARCHAR(50),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_lots (
  id VARCHAR(255) PRIMARY KEY,
  ticket_type_id VARCHAR(255) REFERENCES ticket_types(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  sold INTEGER DEFAULT 0,
  payment_link TEXT,
  auto_open_at_percent INTEGER DEFAULT 90,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES orders(id),
  ticket_type_id VARCHAR(255) REFERENCES ticket_types(id),
  lot_id VARCHAR(255) REFERENCES ticket_lots(id),
  user_id VARCHAR(255) REFERENCES users(id),
  code VARCHAR(100) UNIQUE NOT NULL,
  qr_token VARCHAR(255) UNIQUE,
  face_id VARCHAR(255),
  facial_status VARCHAR(50) DEFAULT 'not_required', -- 'not_required', 'pending', 'approved'
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  account_id VARCHAR(255),
  user_id VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS access_zones (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_type_zones (
  ticket_type_id VARCHAR(255) REFERENCES ticket_types(id),
  access_zone_id VARCHAR(255) REFERENCES access_zones(id),
  PRIMARY KEY (ticket_type_id, access_zone_id)
);

CREATE TABLE IF NOT EXISTS checkin_logs (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(255) REFERENCES tickets(id),
  user_id VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- 'valid', 'already_used', 'invalid', 'fraud', 'error'
  message TEXT, -- Fraud details or error messages
  device_fingerprint VARCHAR(255),
  ip VARCHAR(50),
  geolocation JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS tracking_links (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  name VARCHAR(255) NOT NULL, -- ex: "Instagram Bio"
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracking_events (
  id SERIAL PRIMARY KEY,
  tracking_link_id VARCHAR(255) REFERENCES tracking_links(id),
  event_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'checkout_start', 'purchase'
  order_id VARCHAR(255), -- If purchase
  metadata JSONB,
  ip VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update orders to link to tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(255) REFERENCES tracking_links(id);
CREATE TABLE IF NOT EXISTS seats (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  ticket_type_id VARCHAR(255) REFERENCES ticket_types(id),
  label VARCHAR(50) NOT NULL, -- ex: "A1"
  status VARCHAR(50) DEFAULT 'available', -- 'available', 'reserved', 'occupied'
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  radius INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  ticket_type_id VARCHAR(255) REFERENCES ticket_types(id),
  user_id VARCHAR(255),
  name VARCHAR(255),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'notified', 'converted', 'expired'
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Update tickets to link to seats
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS seat_id VARCHAR(255) REFERENCES seats(id);
CREATE TABLE IF NOT EXISTS physical_products (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  weight_kg DECIMAL(10,2),
  fulfillment_provider VARCHAR(50) DEFAULT 'manual', -- 'amazon', 'bling', 'webhook', 'manual'
  fulfillment_config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_shipping (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES orders(id),
  physical_product_id VARCHAR(255) REFERENCES physical_products(id),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  tracking_code VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'shipped', 'delivered', 'error'
  fulfillment_order_id VARCHAR(255),
  error_message TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update ticket_types to link to physical products
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS physical_product_id VARCHAR(255) REFERENCES physical_products(id);
CREATE TABLE IF NOT EXISTS event_suppliers (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  contact_info VARCHAR(255),
  estimated_amount DECIMAL(10,2) DEFAULT 0,
  actual_amount DECIMAL(10,2) DEFAULT 0,
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'proposed', -- 'proposed', 'confirmed', 'paid'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_suggestions (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  ticket_lot_id VARCHAR(255) REFERENCES ticket_lots(id),
  suggested_price DECIMAL(10,2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'adjusted', 'ignored'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_tests (
  id VARCHAR(255) PRIMARY KEY,
  ticket_type_id VARCHAR(255) REFERENCES ticket_types(id),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'finished'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_test_variants (
  id VARCHAR(255) PRIMARY KEY,
  test_id VARCHAR(255) REFERENCES ab_tests(id),
  name VARCHAR(50) NOT NULL, -- 'A', 'B'
  price DECIMAL(10,2) NOT NULL,
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) REFERENCES events(id),
  visitor_id VARCHAR(255) NOT NULL,
  history JSONB,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
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
