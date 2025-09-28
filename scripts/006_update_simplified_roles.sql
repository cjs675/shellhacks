-- Update user roles to simplified structure
-- Combines admin/business_owner into single admin role, removes accounting

-- Drop existing enum and recreate with simplified roles
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM ('line_crew', 'admin');

-- Update users table to use new enum
ALTER TABLE public.users
ALTER COLUMN role TYPE user_role USING
CASE
    WHEN role::text IN ('admin', 'business_owner') THEN 'admin'::user_role
    ELSE role::text::user_role
END;

-- Drop old enum
DROP TYPE user_role_old;

-- Update RLS policies to reflect simplified roles
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Update task permissions
DROP POLICY IF EXISTS "Users can view assigned tasks" ON public.task_items;
CREATE POLICY "Users can view assigned tasks" ON public.task_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs
            WHERE jobs.id = task_items.job_id
            AND (jobs.assigned_to = auth.uid() OR auth.uid() IN (
                SELECT id FROM public.users WHERE role = 'admin'
            ))
        )
    );

DROP POLICY IF EXISTS "Admins can update all tasks" ON public.task_items;
CREATE POLICY "Admins can update all tasks" ON public.task_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Update activity log permissions
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_log;
CREATE POLICY "Admins can view all activity" ON public.activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Update the handle_new_user function for simplified roles
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