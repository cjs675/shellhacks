-- Aircraft Detailing Management System Database Schema

-- Aircraft table - stores fleet information
CREATE TABLE IF NOT EXISTS aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tail_number VARCHAR(10) UNIQUE NOT NULL,
  icao24_address VARCHAR(6) UNIQUE NOT NULL,
  aircraft_type VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year_manufactured INTEGER,
  owner_name VARCHAR(100),
  base_location VARCHAR(100),
  tracking_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flight tracking data - stores real-time flight information
CREATE TABLE IF NOT EXISTS flight_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircraft_id UUID REFERENCES aircraft(id) ON DELETE CASCADE,
  icao24 VARCHAR(6) NOT NULL,
  callsign VARCHAR(10),
  origin_country VARCHAR(50),
  time_position BIGINT,
  last_contact BIGINT,
  longitude DECIMAL(10, 7),
  latitude DECIMAL(10, 7),
  baro_altitude DECIMAL(8, 2),
  on_ground BOOLEAN,
  velocity DECIMAL(6, 2),
  true_track DECIMAL(6, 2),
  vertical_rate DECIMAL(6, 2),
  geo_altitude DECIMAL(8, 2),
  squawk VARCHAR(4),
  spi BOOLEAN,
  position_source INTEGER,
  category INTEGER,
  tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service catalog - defines available detailing services
CREATE TABLE IF NOT EXISTS service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  service_category VARCHAR(50) NOT NULL, -- Interior, Exterior, Engine, Avionics
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  estimated_duration_hours DECIMAL(4, 2),
  aircraft_size_multiplier JSONB, -- {"light": 1.0, "medium": 1.5, "heavy": 2.0}
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table - stores customer information
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(100),
  contact_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  billing_address TEXT,
  preferred_payment_method VARCHAR(50),
  credit_limit DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table - tracks detailing jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number VARCHAR(20) UNIQUE NOT NULL,
  aircraft_id UUID REFERENCES aircraft(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  location VARCHAR(100),
  special_instructions TEXT,
  total_estimated_cost DECIMAL(10, 2),
  total_actual_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job services - links jobs to specific services
CREATE TABLE IF NOT EXISTS job_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_catalog(id) ON DELETE RESTRICT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
  technician_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table - billing information
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 4) DEFAULT 0.0875, -- 8.75% default tax rate
  tax_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, paid, overdue, cancelled
  payment_date DATE,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log - tracks system activities
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- aircraft, job, invoice, etc.
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- created, updated, deleted, status_changed
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aircraft_tail_number ON aircraft(tail_number);
CREATE INDEX IF NOT EXISTS idx_aircraft_icao24 ON aircraft(icao24_address);
CREATE INDEX IF NOT EXISTS idx_flight_tracking_aircraft_id ON flight_tracking(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flight_tracking_tracked_at ON flight_tracking(tracked_at);
CREATE INDEX IF NOT EXISTS idx_jobs_aircraft_id ON jobs(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_start ON jobs(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
