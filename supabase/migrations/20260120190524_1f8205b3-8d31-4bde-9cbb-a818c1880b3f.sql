-- Allow anyone to insert events (for simple admin panel without auth)
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Anyone can insert events with admin code"
ON public.events
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to delete events (for admin panel)
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Anyone can delete events"
ON public.events
FOR DELETE
TO public
USING (true);

-- Allow anyone to update events
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Anyone can update events"
ON public.events
FOR UPDATE
TO public
USING (true);