-- Sample data for Aircraft Detailing Management System

-- Insert sample service catalog
INSERT INTO service_catalog (service_name, service_category, description, base_price, estimated_duration_hours, aircraft_size_multiplier) VALUES
('Exterior Wash & Wax', 'Exterior', 'Complete exterior cleaning and waxing', 500.00, 4.0, '{"light": 1.0, "medium": 1.3, "heavy": 1.8}'),
('Interior Deep Clean', 'Interior', 'Deep cleaning of cabin, cockpit, and galley', 800.00, 6.0, '{"light": 1.0, "medium": 1.5, "heavy": 2.2}'),
('Leather Conditioning', 'Interior', 'Professional leather seat and trim conditioning', 300.00, 2.0, '{"light": 1.0, "medium": 1.2, "heavy": 1.5}'),
('Engine Bay Cleaning', 'Engine', 'Detailed engine compartment cleaning and inspection', 400.00, 3.0, '{"light": 1.0, "medium": 1.4, "heavy": 1.9}'),
('Avionics Cleaning', 'Avionics', 'Specialized cleaning of cockpit instruments and displays', 250.00, 1.5, '{"light": 1.0, "medium": 1.1, "heavy": 1.3}'),
('Paint Protection Film', 'Exterior', 'Application of protective film to high-wear areas', 1200.00, 8.0, '{"light": 1.0, "medium": 1.6, "heavy": 2.4}'),
('Carpet Shampooing', 'Interior', 'Deep carpet and upholstery cleaning', 350.00, 3.0, '{"light": 1.0, "medium": 1.4, "heavy": 1.8}'),
('Window Tinting', 'Exterior', 'Professional window tinting installation', 600.00, 4.0, '{"light": 1.0, "medium": 1.3, "heavy": 1.7}');

-- Insert sample customers
INSERT INTO customers (company_name, contact_name, email, phone, billing_address, preferred_payment_method, credit_limit) VALUES
('Executive Aviation LLC', 'John Mitchell', 'john.mitchell@execaviation.com', '555-0123', '123 Airport Blvd, Miami, FL 33142', 'Net 30', 50000.00),
('Skyline Charter Services', 'Sarah Johnson', 'sarah@skylinecharter.com', '555-0456', '456 Hangar Row, Fort Lauderdale, FL 33315', 'Credit Card', 25000.00),
('Premier Flight Solutions', 'Michael Chen', 'mchen@premierflights.com', '555-0789', '789 Aviation Way, West Palm Beach, FL 33406', 'Net 15', 75000.00),
('Atlantic Jets Inc', 'Lisa Rodriguez', 'lisa.r@atlanticjets.com', '555-0321', '321 Runway Dr, Naples, FL 34104', 'Net 30', 100000.00);

-- Insert sample aircraft
INSERT INTO aircraft (tail_number, icao24_address, aircraft_type, manufacturer, model, year_manufactured, owner_name, base_location, tracking_enabled) VALUES
('N123EX', 'A12345', 'Light Jet', 'Cessna', 'Citation CJ3+', 2018, 'Executive Aviation LLC', 'Miami International Airport', true),
('N456SL', 'B67890', 'Medium Jet', 'Embraer', 'Legacy 450', 2020, 'Skyline Charter Services', 'Fort Lauderdale Executive Airport', true),
('N789PF', 'C11111', 'Heavy Jet', 'Gulfstream', 'G650ER', 2019, 'Premier Flight Solutions', 'Palm Beach International Airport', true),
('N321AJ', 'D22222', 'Light Jet', 'Bombardier', 'Learjet 75', 2021, 'Atlantic Jets Inc', 'Naples Municipal Airport', false),
('N654EX', 'E33333', 'Medium Jet', 'Dassault', 'Falcon 2000EX', 2017, 'Executive Aviation LLC', 'Miami International Airport', true);
