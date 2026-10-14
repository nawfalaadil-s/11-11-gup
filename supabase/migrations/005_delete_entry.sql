-- ============================================================================
-- MIGRATION 005: Delete one entry (admin only)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delete_entry(p_entry_id UUID)
RETURNS JSON AS $$
DECLARE
  v_admin UUID := auth.uid();
BEGIN
  IF v_admin IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE id = v_admin
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Admin privileges required');
  END IF;

  IF EXISTS (SELECT 1 FROM public.winners WHERE entry_id = p_entry_id) THEN
    RETURN json_build_object('success', false, 'error', 'Winner entries cannot be deleted. Reset the draw first.');
  END IF;

  DELETE FROM public.winners WHERE entry_id = p_entry_id;
  DELETE FROM public.entries WHERE id = p_entry_id;

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id)
  VALUES (v_admin, 'entry_deleted', 'entry', p_entry_id);

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_entry(UUID) TO authenticated;