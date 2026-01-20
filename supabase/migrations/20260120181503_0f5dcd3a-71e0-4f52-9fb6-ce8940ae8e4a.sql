-- Create app_role enum for admin system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles (users can read their own roles)
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Events table for game events (admin-managed)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    min_age INTEGER NOT NULL DEFAULT 0,
    max_age INTEGER NOT NULL DEFAULT 100,
    category TEXT NOT NULL,
    weight NUMERIC NOT NULL DEFAULT 1.0,
    tags TEXT[] DEFAULT '{}',
    options JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Everyone can read active events (needed for game)
CREATE POLICY "Anyone can read active events"
ON public.events FOR SELECT
USING (is_active = true);

-- Only admins can insert events
CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update events
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete events
CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin settings table (for admin code hash)
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- No direct access to admin_settings (only via edge functions)
CREATE POLICY "No direct access to admin_settings"
ON public.admin_settings FOR SELECT
USING (false);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();