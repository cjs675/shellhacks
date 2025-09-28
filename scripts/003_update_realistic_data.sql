-- Updated sample data with realistic aircraft and pricing
-- This replaces the generic data with actual Challenger and Lear jets and real pricing

-- Clear existing data
DELETE FROM service_catalog;
DELETE FROM aircraft;

-- Insert realistic service catalog based on actual pricing
INSERT INTO service_catalog (service_name, service_category, description, base_price, estimated_duration_hours, aircraft_size_multiplier) VALUES
('Full Interior Detailing', 'Interior', 'Complete interior cleaning including seats, panels, and galley', 465.00, 6.0, '{"Challenger": 1.0, "Lear": 0.60}'),
('Exterior Wash & Detail', 'Exterior', 'Complete exterior washing, polishing, and detailing', 1200.00, 5.0, '{"Challenger": 1.0, "Lear": 0.625}'),
('Brightwork Polishing', 'Exterior', 'Professional polishing of all metal brightwork and trim', 3000.00, 8.0, '{"Challenger": 1.0, "Lear": 0.40}'),
('Carpet Deep Cleaning', 'Interior', 'Deep cleaning and shampooing of all carpeted areas', 600.00, 3.0, '{"Challenger": 1.0, "Lear": 0.50}'),
('Leather Conditioning', 'Interior', 'Professional conditioning of all leather surfaces', 75.00, 1.5, '{"Challenger": 1.0, "Lear": 1.0}'),
('Paint Seal Application', 'Exterior', 'Premium paint sealant application for long-term protection', 6500.00, 12.0, '{"Challenger": 1.0, "Lear": 0.69}');

-- Insert realistic aircraft fleet
INSERT INTO aircraft (tail_number, icao24_address, aircraft_type, manufacturer, model, year_manufactured, owner_name, base_location, tracking_enabled) VALUES
('N350CL', 'A8B2C4', 'Medium Jet', 'Bombardier', 'Challenger 350', 2019, 'Executive Aviation LLC', 'Miami International Airport', true),
('N605CL', 'B9D3E5', 'Medium Jet', 'Bombardier', 'Challenger 605', 2018, 'Skyline Charter Services', 'Fort Lauderdale Executive Airport', true),
('N75LR', 'C1F4G7', 'Light Jet', 'Bombardier', 'Learjet 75', 2021, 'Premier Flight Solutions', 'Palm Beach International Airport', true),
('N45LR', 'D2G5H8', 'Light Jet', 'Bombardier', 'Learjet 45XR', 2020, 'Atlantic Jets Inc', 'Naples Municipal Airport', false),
('N650CL', 'E3H6I9', 'Heavy Jet', 'Bombardier', 'Challenger 650', 2022, 'Executive Aviation LLC', 'Miami International Airport', true),
('N60LR', 'F4I7J1', 'Light Jet', 'Bombardier', 'Learjet 60XR', 2017, 'Skyline Charter Services', 'Fort Lauderdale Executive Airport', true);

-- Insert sample jobs using realistic aircraft and pricing
INSERT INTO jobs (aircraft_id, customer_id, service_id, job_status, priority, scheduled_date, estimated_cost, notes) VALUES
(1, 1, 1, 'scheduled', 'medium', '2024-01-15 09:00:00', 465.00, 'Full interior detail for Challenger 350'),
(2, 2, 2, 'in_progress', 'high', '2024-01-14 08:00:00', 1200.00, 'Exterior wash for Challenger 605'),
(3, 3, 6, 'scheduled', 'low', '2024-01-16 07:00:00', 3105.00, 'Paint seal for Learjet 75 - calculated with 0.69 multiplier'),
(4, 4, 3, 'completed', 'medium', '2024-01-12 10:00:00', 1200.00, 'Brightwork polishing for Learjet 45XR'),
(5, 1, 4, 'scheduled', 'medium', '2024-01-17 11:00:00', 600.00, 'Carpet cleaning for Challenger 650');

-- Insert sample invoices
INSERT INTO invoices (customer_id, invoice_number, invoice_date, due_date, subtotal, tax_amount, total_amount, payment_status, payment_date) VALUES
(4, 'INV-2024-001', '2024-01-13', '2024-02-12', 1200.00, 84.00, 1284.00, 'paid', '2024-01-13'),
(1, 'INV-2024-002', '2024-01-14', '2024-02-13', 465.00, 32.55, 497.55, 'pending', NULL),
(2, 'INV-2024-003', '2024-01-14', '2024-02-13', 1200.00, 84.00, 1284.00, 'pending', NULL);
