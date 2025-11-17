-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- Create RLS policy to allow anyone to upload
CREATE POLICY "Anyone can upload media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Create RLS policy to allow public read access
CREATE POLICY "Public media access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'media');