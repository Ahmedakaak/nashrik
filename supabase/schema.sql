-- ============================================
-- Nashark (نشارك) - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ===== 1. PROFILES TABLE =====
-- Extends Supabase auth.users with app-specific data
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    student_id TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'club_admin', 'system_admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 2. CLUBS TABLE =====
CREATE TABLE IF NOT EXISTS clubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    category TEXT NOT NULL CHECK (category IN ('academic', 'sports', 'cultural', 'community')),
    logo_url TEXT,
    cover_url TEXT,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 3. CLUB MEMBERSHIPS TABLE =====
CREATE TABLE IF NOT EXISTS club_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

-- ===== 4. EVENTS TABLE =====
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,
    description_ar TEXT,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    location_ar TEXT,
    category TEXT NOT NULL CHECK (category IN ('academic', 'sports', 'cultural', 'community')),
    max_capacity INTEGER DEFAULT 100,
    registered_count INTEGER DEFAULT 0,
    cover_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 5. EVENT REGISTRATIONS TABLE =====
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlisted')),
    attended BOOLEAN DEFAULT FALSE,
    qr_token TEXT DEFAULT gen_random_uuid()::text,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    attended_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    check_in_method TEXT CHECK (check_in_method IN ('qr', 'manual')),
    UNIQUE(event_id, user_id)
);

-- ===== 6. ANNOUNCEMENTS TABLE =====
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    title_ar TEXT,
    content TEXT NOT NULL,
    content_ar TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 7. NOTIFICATIONS TABLE =====
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('event', 'club', 'system', 'reminder')),
    title TEXT NOT NULL,
    title_ar TEXT,
    message TEXT,
    message_ar TEXT,
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 8. EVENT COMMENTS TABLE =====
CREATE TABLE IF NOT EXISTS event_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clubs_category ON clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON clubs(status);
CREATE INDEX IF NOT EXISTS idx_clubs_admin ON clubs(admin_id);

CREATE INDEX IF NOT EXISTS idx_events_club ON events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON event_registrations(qr_token);

CREATE INDEX IF NOT EXISTS idx_memberships_club ON club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON club_memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;

CREATE INDEX IF NOT EXISTS idx_comments_event ON event_comments(event_id);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER clubs_updated_at
    BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, student_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.raw_user_meta_data->>'student_id',
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- AUTO-UPDATE registered_count on events
-- ============================================
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events SET registered_count = registered_count + 1
        WHERE id = NEW.event_id AND NEW.status = 'confirmed';
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events SET registered_count = registered_count - 1
        WHERE id = OLD.event_id AND OLD.status = 'confirmed';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
            UPDATE events SET registered_count = registered_count + 1 WHERE id = NEW.event_id;
        ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
            UPDATE events SET registered_count = registered_count - 1 WHERE id = NEW.event_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_registration_change ON event_registrations;
CREATE TRIGGER on_registration_change
    AFTER INSERT OR UPDATE OR DELETE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_event_registration_count();

-- ============================================
-- AUTO-UPDATE member_count on clubs
-- ============================================
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clubs SET member_count = member_count + 1
        WHERE id = NEW.club_id AND NEW.status = 'approved';
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clubs SET member_count = member_count - 1
        WHERE id = OLD.club_id AND OLD.status = 'approved';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            UPDATE clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE clubs SET member_count = member_count - 1 WHERE id = NEW.club_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_membership_change ON club_memberships;
CREATE TRIGGER on_membership_change
    AFTER INSERT OR UPDATE OR DELETE ON club_memberships
    FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

-- ============================================
-- SECURE ATTENDANCE CHECK-IN
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_registration_attended(
    p_registration_id UUID,
    p_method TEXT DEFAULT 'qr'
)
RETURNS event_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_registration event_registrations%ROWTYPE;
    v_role TEXT;
    v_can_check_in BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_method NOT IN ('qr', 'manual') THEN
        RAISE EXCEPTION 'Invalid check-in method';
    END IF;

    SELECT *
    INTO v_registration
    FROM event_registrations
    WHERE id = p_registration_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registration not found';
    END IF;

    SELECT role
    INTO v_role
    FROM profiles
    WHERE id = auth.uid();

    SELECT EXISTS (
        SELECT 1
        FROM events
        JOIN clubs ON clubs.id = events.club_id
        WHERE events.id = v_registration.event_id
          AND clubs.admin_id = auth.uid()
    )
    INTO v_can_check_in;

    IF NOT (v_can_check_in OR v_role = 'system_admin') THEN
        RAISE EXCEPTION 'Not authorized to mark attendance';
    END IF;

    IF v_registration.status <> 'confirmed' THEN
        RAISE EXCEPTION 'Only confirmed registrations can be marked attended';
    END IF;

    IF v_registration.attended THEN
        RETURN v_registration;
    END IF;

    UPDATE event_registrations
    SET attended = TRUE,
        attended_at = NOW(),
        checked_in_by = auth.uid(),
        check_in_method = p_method
    WHERE id = p_registration_id
    RETURNING *
    INTO v_registration;

    RETURN v_registration;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_registration_attended(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_registration_attended(UUID, TEXT) TO authenticated;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- CLUBS
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published clubs are viewable by everyone"
    ON clubs FOR SELECT USING (status = 'approved' OR admin_id = auth.uid());

CREATE POLICY "Club admins can update their club"
    ON clubs FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Authenticated users can create clubs"
    ON clubs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- EVENTS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are viewable by everyone"
    ON events FOR SELECT USING (status = 'published' OR EXISTS (
        SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.admin_id = auth.uid()
    ));

CREATE POLICY "Club admins can manage their events"
    ON events FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.admin_id = auth.uid()
    ));

CREATE POLICY "Club admins can update their events"
    ON events FOR UPDATE USING (EXISTS (
        SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.admin_id = auth.uid()
    ));

CREATE POLICY "Club admins can delete their events"
    ON events FOR DELETE USING (EXISTS (
        SELECT 1 FROM clubs WHERE clubs.id = events.club_id AND clubs.admin_id = auth.uid()
    ));

-- EVENT REGISTRATIONS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
    ON event_registrations FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Club admins can view registrations for their events"
    ON event_registrations FOR SELECT USING (EXISTS (
        SELECT 1 FROM events JOIN clubs ON clubs.id = events.club_id
        WHERE events.id = event_registrations.event_id AND clubs.admin_id = auth.uid()
    ));

CREATE POLICY "System admins can view all registrations"
    ON event_registrations FOR SELECT USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin'
    ));

CREATE POLICY "Users can register for events"
    ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their registration"
    ON event_registrations FOR DELETE USING (user_id = auth.uid());

-- CLUB MEMBERSHIPS
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their memberships"
    ON club_memberships FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Club admins can view all memberships"
    ON club_memberships FOR SELECT USING (EXISTS (
        SELECT 1 FROM clubs WHERE clubs.id = club_memberships.club_id AND clubs.admin_id = auth.uid()
    ));

CREATE POLICY "Users can request membership"
    ON club_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Club admins can manage memberships"
    ON club_memberships FOR UPDATE USING (EXISTS (
        SELECT 1 FROM clubs WHERE clubs.id = club_memberships.club_id AND clubs.admin_id = auth.uid()
    ));

CREATE POLICY "Users can leave clubs"
    ON club_memberships FOR DELETE USING (user_id = auth.uid());

-- ANNOUNCEMENTS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements viewable by club members"
    ON announcements FOR SELECT USING (TRUE);

CREATE POLICY "Club admins can create announcements"
    ON announcements FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM clubs WHERE clubs.id = announcements.club_id AND clubs.admin_id = auth.uid()
    ));

-- NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
    ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
    ON notifications FOR UPDATE USING (user_id = auth.uid());

-- EVENT COMMENTS
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
    ON event_comments FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can comment"
    ON event_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON event_comments FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- ENABLE REALTIME for key tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
