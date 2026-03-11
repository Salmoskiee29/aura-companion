
-- Drop restrictive policies on companion_models
DROP POLICY IF EXISTS "Admins can manage models" ON public.companion_models;
DROP POLICY IF EXISTS "Developers can manage models" ON public.companion_models;
DROP POLICY IF EXISTS "Anyone can view models" ON public.companion_models;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can manage models" ON public.companion_models
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Developers can manage models" ON public.companion_models
  FOR ALL TO public USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Anyone can view models" ON public.companion_models
  FOR SELECT TO public USING (true);
