-- Add user roles and authentication system
-- This extends the existing schema with user management and approval workflows

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('line_crew', 'admin', 'business_owner', 'accounting');

-- Create user status enum  
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');

-- Create task status enum (extends existing job status)
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed_pending_review', 'approved', 'rejected', 'cancelled');

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'line_crew',
    status user_status NOT NULL DEFAULT 'active',
    employee_id TEXT UNIQUE,
    phone TEXT,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user permissions table
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    granted_by UUID REFERENCES public.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, permission)
);

-- Update jobs table to include task assignments and approval workflow
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS task_notes TEXT;

-- Create task_items table for individual checklist items
CREATE TABLE IF NOT EXISTS public.task_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id),
    title TEXT NOT NULL,
    description TEXT,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    estimated_duration INTEGER, -- minutes
    is_required BOOLEAN DEFAULT true,
    status task_status DEFAULT 'pending',
    completed_by UUID REFERENCES public.users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_log table for audit trail
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'job', 'task_item', 'aircraft', etc.
    resource_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON public.jobs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_jobs_reviewed_by ON public.jobs(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_task_items_job_id ON public.task_items(job_id);
CREATE INDEX IF NOT EXISTS idx_task_items_status ON public.task_items(status);
CREATE INDEX IF NOT EXISTS idx_task_items_completed_by ON public.task_items(completed_by);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON public.activity_log(resource_type, resource_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'business_owner')
        )
    );

CREATE POLICY "Admins can update users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'business_owner')
        )
    );

-- RLS Policies for task_items table
CREATE POLICY "Users can view assigned tasks" ON public.task_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = task_items.job_id 
            AND (jobs.assigned_to = auth.uid() OR auth.uid() IN (
                SELECT id FROM public.users WHERE role IN ('admin', 'business_owner')
            ))
        )
    );

CREATE POLICY "Line crew can update their assigned tasks" ON public.task_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = task_items.job_id 
            AND jobs.assigned_to = auth.uid()
        )
    );

CREATE POLICY "Admins can update all tasks" ON public.task_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'business_owner')
        )
    );

-- RLS Policies for activity_log table
CREATE POLICY "Users can view their own activity" ON public.activity_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" ON public.activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'business_owner')
        )
    );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'line_crew')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.activity_log (
        user_id, action, resource_type, resource_id, old_values, new_values
    ) VALUES (
        auth.uid(), p_action, p_resource_type, p_resource_id, p_old_values, p_new_values
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
