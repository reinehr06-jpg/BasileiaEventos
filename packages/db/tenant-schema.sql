-- Tenant Database Schema
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

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES orders(id),
  ticket_type_id VARCHAR(255) REFERENCES ticket_types(id),
  lot_id VARCHAR(255) REFERENCES ticket_lots(id),
  user_id VARCHAR(255) REFERENCES users(id),
  code VARCHAR(100) UNIQUE NOT NULL,
  qr_token VARCHAR(255) UNIQUE,
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
  status VARCHAR(50) NOT NULL,
  device_fingerprint VARCHAR(255),
  ip VARCHAR(50),
  geolocation JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
