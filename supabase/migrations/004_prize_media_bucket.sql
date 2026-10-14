-- ============================================================================
-- MIGRATION 004: Prize media storage bucket and policies
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prize-media',
  'prize-media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public view prize media" ON storage.objects;
CREATE POLICY "Public view prize media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'prize-media');

DROP POLICY IF EXISTS "Admins upload prize media" ON storage.objects;
CREATE POLICY "Admins upload prize media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'prize-media'
    AND auth.uid() IN (SELECT id FROM public.admin_profiles)
  );

DROP POLICY IF EXISTS "Admins delete prize media" ON storage.objects;
CREATE POLICY "Admins delete prize media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'prize-media'
    AND auth.uid() IN (SELECT id FROM public.admin_profiles)
  );