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
