-- Fix table reference issues for proper demo functionality

-- Update job_services table structure to match component expectations
-- Make sure we have proper relationship between jobs and services

-- First, let's ensure the services table exists with the right name
-- The components expect 'services' but schema has 'service_catalog'
-- Create a view to maintain compatibility
CREATE OR REPLACE VIEW services AS
SELECT
  id,
  service_name as name,
  service_category,
  description,
  base_price,
  estimated_duration_hours,
  aircraft_size_multiplier,
  active,
  created_at,
  updated_at
FROM service_catalog;

-- Update the jobs table to have the missing columns that components expect
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_date DATE;
UPDATE jobs SET scheduled_date = scheduled_start::date WHERE scheduled_date IS NULL;

-- Ensure proper sample data exists for demo
-- Update service names to match component expectations
UPDATE service_catalog SET service_name = 'Full Interior Detailing' WHERE service_name = 'Full Interior Detailing';
UPDATE service_catalog SET service_name = 'Exterior Wash & Detail' WHERE service_name = 'Exterior Wash & Detail';
UPDATE service_catalog SET service_name = 'Brightwork Polishing' WHERE service_name = 'Brightwork Polishing';
UPDATE service_catalog SET service_name = 'Carpet Deep Cleaning' WHERE service_name = 'Carpet Deep Cleaning';
UPDATE service_catalog SET service_name = 'Leather Conditioning' WHERE service_name = 'Leather Conditioning';
UPDATE service_catalog SET service_name = 'Paint Seal Application' WHERE service_name = 'Paint Seal Application';

-- Insert sample data to ensure demo works
-- Insert customers if they don't exist
INSERT INTO customers (company_name, contact_name, email, phone, billing_address, preferred_payment_method, credit_limit)
VALUES
('Demo Aviation LLC', 'John Demo', 'demo@aviation.com', '555-0100', '123 Demo St, Miami, FL', 'Net 30', 50000.00)
ON CONFLICT (email) DO NOTHING;

-- Get the customer ID for demo data
DO $$
DECLARE
    demo_customer_id UUID;
    demo_aircraft_id UUID;
    demo_service_id UUID;
    demo_job_id UUID;
BEGIN
    -- Get demo customer
    SELECT id INTO demo_customer_id FROM customers WHERE email = 'demo@aviation.com' LIMIT 1;

    -- Get first aircraft
    SELECT id INTO demo_aircraft_id FROM aircraft LIMIT 1;

    -- Get first service
    SELECT id INTO demo_service_id FROM service_catalog LIMIT 1;

    -- Insert a demo job if we have the required data
    IF demo_customer_id IS NOT NULL AND demo_aircraft_id IS NOT NULL THEN
        INSERT INTO jobs (job_number, aircraft_id, customer_id, status, scheduled_start, scheduled_end, scheduled_date, total_estimated_cost)
        VALUES (
            'DEMO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
            demo_aircraft_id,
            demo_customer_id,
            'completed',
            NOW() - INTERVAL '7 days',
            NOW() - INTERVAL '7 days' + INTERVAL '4 hours',
            (NOW() - INTERVAL '7 days')::date,
            1200.00
        )
        ON CONFLICT (job_number) DO NOTHING
        RETURNING id INTO demo_job_id;

        -- Insert job service if we have a job
        IF demo_job_id IS NOT NULL AND demo_service_id IS NOT NULL THEN
            INSERT INTO job_services (job_id, service_id, quantity, unit_price, total_price, status)
            VALUES (demo_job_id, demo_service_id, 1, 1200.00, 1200.00, 'completed')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- Create indexes for better performance during demo
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_aircraft_scheduled ON jobs(aircraft_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_job_services_job_service ON job_services(job_id, service_id);