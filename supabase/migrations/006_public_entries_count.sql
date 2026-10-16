-- MIGRATION 006: Public entry count (for live slot availability)
-- The entries table has no public SELECT policy (participant privacy).
-- Expose only the total count via a SECURITY DEFINER function.

CREATE OR REPLACE FUNCTION public.get_entries_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::INTEGER FROM public.entries;
$$;

REVOKE ALL ON FUNCTION public.get_entries_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_entries_count() TO anon, authenticated;
