-- ============================================
-- Nashark Phase 7: Schema Migration
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================

-- ===== 1. SCHEMA ADDITIONS =====

-- Announcements: add priority column
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low'));

-- Event Comments: add is_pinned column
ALTER TABLE event_comments ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Profiles: add status column (active/disabled)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled'));

-- Profiles: add Arabic full name
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name_ar TEXT;

-- ===== 2. SYSTEM ADMIN HELPER FUNCTION =====

CREATE OR REPLACE FUNCTION is_system_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ===== 3. SYSTEM ADMIN RLS POLICIES =====

-- Profiles: system admin can see and update all profiles
CREATE POLICY "System admins can view all profiles"
    ON profiles FOR SELECT USING (is_system_admin());

CREATE POLICY "System admins can update all profiles"
    ON profiles FOR UPDATE USING (is_system_admin());

-- Clubs: system admin full access
CREATE POLICY "System admins can view all clubs"
    ON clubs FOR SELECT USING (is_system_admin());

CREATE POLICY "System admins can update all clubs"
    ON clubs FOR UPDATE USING (is_system_admin());

CREATE POLICY "System admins can delete clubs"
    ON clubs FOR DELETE USING (is_system_admin());

-- Events: system admin full access
CREATE POLICY "System admins can view all events"
    ON events FOR SELECT USING (is_system_admin());

CREATE POLICY "System admins can update all events"
    ON events FOR UPDATE USING (is_system_admin());

CREATE POLICY "System admins can delete all events"
    ON events FOR DELETE USING (is_system_admin());

-- Event Registrations: system admin can view all
CREATE POLICY "System admins can view all registrations"
    ON event_registrations FOR SELECT USING (is_system_admin());

-- Club Memberships: system admin can view and manage all
CREATE POLICY "System admins can view all memberships"
    ON club_memberships FOR SELECT USING (is_system_admin());

CREATE POLICY "System admins can update all memberships"
    ON club_memberships FOR UPDATE USING (is_system_admin());

CREATE POLICY "System admins can delete all memberships"
    ON club_memberships FOR DELETE USING (is_system_admin());

-- Announcements: system admin can manage all
CREATE POLICY "System admins can manage all announcements"
    ON announcements FOR ALL USING (is_system_admin());

-- Notifications: system admin can insert (send notifications to users)
CREATE POLICY "System admins can create notifications"
    ON notifications FOR INSERT WITH CHECK (is_system_admin());

-- Event Comments: admin can delete any comment
CREATE POLICY "System admins can delete any comment"
    ON event_comments FOR DELETE USING (is_system_admin());

-- Club admins can also delete comments on their events
CREATE POLICY "Club admins can delete comments on their events"
    ON event_comments FOR DELETE USING (EXISTS (
        SELECT 1 FROM events JOIN clubs ON clubs.id = events.club_id
        WHERE events.id = event_comments.event_id AND clubs.admin_id = auth.uid()
    ));

-- ===== 4. STORAGE BUCKETS FOR CLUBS & EVENTS =====

-- Club logos/covers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'clubs',
    'clubs',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Event covers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'events',
    'events',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage policies for clubs bucket
DROP POLICY IF EXISTS "Club images are publicly accessible" ON storage.objects;
CREATE POLICY "Club images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'clubs');

DROP POLICY IF EXISTS "Club admins can upload club images" ON storage.objects;
CREATE POLICY "Club admins can upload club images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'clubs' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Club admins can update club images" ON storage.objects;
CREATE POLICY "Club admins can update club images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'clubs' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Club admins can delete club images" ON storage.objects;
CREATE POLICY "Club admins can delete club images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'clubs' AND auth.uid() IS NOT NULL);

-- Storage policies for events bucket
DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
CREATE POLICY "Event images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'events');

DROP POLICY IF EXISTS "Club admins can upload event images" ON storage.objects;
CREATE POLICY "Club admins can upload event images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'events' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Club admins can update event images" ON storage.objects;
CREATE POLICY "Club admins can update event images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'events' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Club admins can delete event images" ON storage.objects;
CREATE POLICY "Club admins can delete event images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'events' AND auth.uid() IS NOT NULL);
