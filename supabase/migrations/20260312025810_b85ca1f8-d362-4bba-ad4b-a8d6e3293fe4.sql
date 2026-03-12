-- Allow developers to manage model avatar files so model creation works in admin dashboard
DROP POLICY IF EXISTS "Developers can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Developers can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Developers can delete avatars" ON storage.objects;

CREATE POLICY "Developers can upload avatars"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'model-avatars'
  AND has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Developers can update avatars"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'model-avatars'
  AND has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Developers can delete avatars"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'model-avatars'
  AND has_role(auth.uid(), 'developer'::app_role)
);