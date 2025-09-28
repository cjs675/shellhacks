-- Add sample users and task items for testing the multi-user system

-- Insert sample users (these will be created through Supabase Auth in real usage)
-- For demo purposes, we'll create user records directly
INSERT INTO public.users (id, email, full_name, role, employee_id, phone, hire_date) VALUES
-- Admin users
('550e8400-e29b-41d4-a716-446655440001', 'admin@aircraftdetailing.com', 'Sarah Johnson', 'admin', 'EMP001', '555-0101', '2020-01-15'),
('550e8400-e29b-41d4-a716-446655440002', 'manager@aircraftdetailing.com', 'Mike Rodriguez', 'admin', 'EMP002', '555-0102', '2019-06-20'),

-- Business owners
('550e8400-e29b-41d4-a716-446655440003', 'owner@aircraftdetailing.com', 'David Chen', 'business_owner', 'EMP003', '555-0103', '2018-01-01'),

-- Accounting team
('550e8400-e29b-41d4-a716-446655440004', 'accounting@aircraftdetailing.com', 'Lisa Thompson', 'accounting', 'EMP004', '555-0104', '2021-03-10'),

-- Line crew
('550e8400-e29b-41d4-a716-446655440005', 'tech1@aircraftdetailing.com', 'James Wilson', 'line_crew', 'EMP005', '555-0105', '2022-05-15'),
('550e8400-e29b-41d4-a716-446655440006', 'tech2@aircraftdetailing.com', 'Maria Garcia', 'line_crew', 'EMP006', '555-0106', '2022-08-20'),
('550e8400-e29b-41d4-a716-446655440007', 'tech3@aircraftdetailing.com', 'Robert Kim', 'line_crew', 'EMP007', '555-0107', '2023-01-12'),
('550e8400-e29b-41d4-a716-446655440008', 'tech4@aircraftdetailing.com', 'Amanda Davis', 'line_crew', 'EMP008', '555-0108', '2023-04-18');

-- Update existing jobs to assign them to line crew
UPDATE public.jobs SET 
    assigned_to = '550e8400-e29b-41d4-a716-446655440005', -- James Wilson
    status = 'in_progress'
WHERE id = (SELECT id FROM public.jobs LIMIT 1);

UPDATE public.jobs SET 
    assigned_to = '550e8400-e29b-41d4-a716-446655440006', -- Maria Garcia
    status = 'pending'
WHERE id = (SELECT id FROM public.jobs OFFSET 1 LIMIT 1);

-- Create detailed task items for Full Interior service
INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Pre-inspection Documentation',
    'Document current condition with photos, note any existing damage or wear',
    1,
    15,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Full Interior'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440005'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Remove Loose Items',
    'Remove all loose items, personal belongings, and trash from cabin',
    2,
    20,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Full Interior'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440005'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Vacuum Carpets and Seats',
    'Thoroughly vacuum all carpeted areas, seat cushions, and crevices',
    3,
    45,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Full Interior'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440005'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Clean and Condition Leather',
    'Clean leather surfaces with appropriate cleaner, apply conditioner',
    4,
    60,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Full Interior'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440005'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Clean Windows and Mirrors',
    'Clean all interior windows, mirrors, and glass surfaces streak-free',
    5,
    30,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Full Interior'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440005'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Detail Dashboard and Controls',
    'Clean and detail instrument panel, controls, and electronic displays',
    6,
    40,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Full Interior'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440005'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Final Inspection and Touch-ups',
    'Perform final quality check, address any missed areas, take completion photos',
    7,
    20,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Full Interior'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440005'
LIMIT 1;

-- Create task items for Exterior Wash service
INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Pre-wash Inspection',
    'Document aircraft condition, check for damage, remove covers and plugs',
    1,
    20,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Exterior Wash'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440006'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Initial Rinse',
    'Rinse aircraft with clean water to remove loose dirt and debris',
    2,
    15,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Exterior Wash'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440006'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Apply Cleaning Solution',
    'Apply approved aircraft cleaning solution, work from top to bottom',
    3,
    30,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Exterior Wash'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440006'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Scrub and Agitate',
    'Gently scrub surfaces with appropriate brushes and mitts',
    4,
    45,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Exterior Wash'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440006'
LIMIT 1;

INSERT INTO public.task_items (job_id, service_id, title, description, sequence_order, estimated_duration, is_required) 
SELECT 
    j.id,
    s.id,
    'Final Rinse and Dry',
    'Thoroughly rinse all surfaces, dry with clean chamois and microfiber towels',
    5,
    40,
    true
FROM public.jobs j
JOIN public.services s ON s.name = 'Exterior Wash'
WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440006'
LIMIT 1;

-- Grant some permissions to users
INSERT INTO public.user_permissions (user_id, permission, granted_by) VALUES
-- Admin permissions
('550e8400-e29b-41d4-a716-446655440001', 'manage_users', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440001', 'approve_tasks', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440001', 'edit_fleet', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440001', 'view_analytics', '550e8400-e29b-41d4-a716-446655440003'),

-- Manager permissions
('550e8400-e29b-41d4-a716-446655440002', 'approve_tasks', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', 'view_analytics', '550e8400-e29b-41d4-a716-446655440003'),

-- Business owner permissions (all permissions)
('550e8400-e29b-41d4-a716-446655440003', 'manage_users', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440003', 'approve_tasks', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440003', 'edit_fleet', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440003', 'view_analytics', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440003', 'manage_billing', '550e8400-e29b-41d4-a716-446655440003'),

-- Accounting permissions
('550e8400-e29b-41d4-a716-446655440004', 'manage_billing', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440004', 'view_analytics', '550e8400-e29b-41d4-a716-446655440003');

-- Log some sample activity
SELECT public.log_activity('job_assigned', 'job', j.id, NULL, json_build_object('assigned_to', '550e8400-e29b-41d4-a716-446655440005'))
FROM public.jobs j WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440005';

SELECT public.log_activity('job_assigned', 'job', j.id, NULL, json_build_object('assigned_to', '550e8400-e29b-41d4-a716-446655440006'))
FROM public.jobs j WHERE j.assigned_to = '550e8400-e29b-41d4-a716-446655440006';
