-- Create storage policies for user-scoped file access in conversions bucket

-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload their own conversions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'conversions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to download their own files
CREATE POLICY "Users can download their own conversions"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'conversions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own conversions"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'conversions' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);