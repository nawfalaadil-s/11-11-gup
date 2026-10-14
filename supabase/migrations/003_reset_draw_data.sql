-- ============================================================================
-- MIGRATION 003: Reset draw / delete all entries (admin only)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reset_draw_data(p_delete_entries BOOLEAN DEFAULT false)
RETURNS JSON AS $$
DECLARE
  v_admin UUID := auth.uid();
BEGIN
  IF v_admin IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE id = v_admin
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Admin privileges required');
  END IF;

  -- Always clear winners before touching entries.
  DELETE FROM public.winners WHERE true;

  IF p_delete_entries THEN
    DELETE FROM public.entries WHERE true;
    -- Storage objects cannot be deleted directly from SQL.
    -- Remove them from the Supabase Storage dashboard if needed.
  END IF;

  -- Reset draw state to "not executed".
  UPDATE public.draw_state
  SET draw_executed = false,
      draw_executed_at = NULL,
      draw_executed_by = NULL,
      total_eligible_entries = NULL,
      updated_at = NOW()
  WHERE id = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;

  INSERT INTO public.audit_logs (admin_id, action, entity_type, details)
  VALUES (
    v_admin,
    CASE WHEN p_delete_entries THEN 'entries_cleared' ELSE 'draw_reset' END,
    'draw',
    json_build_object('delete_entries', p_delete_entries)
  );

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.reset_draw_data(BOOLEAN) TO authenticated;
