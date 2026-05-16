-- ============================================
-- Nashark (نشارك) - Storage Bucket Setup
-- Run this in Supabase SQL Editor to create
-- the 'avatars' bucket for profile pictures.
-- ============================================

-- Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true, -- public bucket
    2097152, -- 2MB file size limit in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true, 
    file_size_limit = 2097152, 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist to allow clean re-runs
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Removed ALTER TABLE as it causes permission errors and RLS is already enabled on this table by default.

-- 1. Public SELECT (Anyone can view avatars)
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- 2. User INSERT (Authenticated users can upload to their own folder: user_id/...)
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid() = owner
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 3. User UPDATE (Users can only update files in their own folder)
CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid() = owner
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid() = owner
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 4. User DELETE (Users can only delete files in their own folder)
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid() = owner
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================
-- Cover image buckets
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'event-covers',
    'event-covers',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'club-covers',
    'club-covers',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Event cover images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event covers" ON storage.objects;
DROP POLICY IF EXISTS "Club cover images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload club covers" ON storage.objects;

CREATE POLICY "Event cover images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-covers');

CREATE POLICY "Authenticated users can upload event covers"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'event-covers'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Club cover images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'club-covers');

CREATE POLICY "Authenticated users can upload club covers"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'club-covers'
        AND auth.uid() IS NOT NULL
    );
