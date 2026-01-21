-- Fix security issues: Make events table admin-only for modifications

-- Drop the permissive policies
DROP POLICY IF EXISTS "Anyone can insert events with admin code" ON public.events;
DROP POLICY IF EXISTS "Anyone can delete events" ON public.events;
DROP POLICY IF EXISTS "Anyone can update events" ON public.events;

-- Create secure admin-only policies using has_role function
CREATE POLICY "Admins can insert events" ON public.events 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events" ON public.events 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events" ON public.events 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix user_roles table: Add policies to prevent privilege escalation
CREATE POLICY "Only admins can insert roles" ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles" ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles" ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));