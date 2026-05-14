-- ============================================
-- Nashark Notifications Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add Type to Announcements
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'club' CHECK (type IN ('club', 'event', 'reminder'));

-- 2. Trigger for automated club member notifications on new announcement
CREATE OR REPLACE FUNCTION notify_club_members_on_announcement()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, title_ar, message, message_ar)
    SELECT 
        cm.user_id, 
        NEW.type, 
        NEW.title, 
        NEW.title_ar, 
        NEW.content, 
        NEW.content_ar
    FROM club_memberships cm
    WHERE cm.club_id = NEW.club_id AND cm.status = 'approved' AND cm.user_id != auth.uid();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing if re-running
DROP TRIGGER IF EXISTS on_announcement_created ON announcements;

CREATE TRIGGER on_announcement_created
    AFTER INSERT ON announcements
    FOR EACH ROW EXECUTE FUNCTION notify_club_members_on_announcement();

-- 3. System Admin RPC for global alerts
CREATE OR REPLACE FUNCTION create_system_alert(p_title TEXT, p_title_ar TEXT, p_message TEXT, p_message_ar TEXT)
RETURNS void AS $$
BEGIN
    -- Security check: ensure caller is a system admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system_admin') THEN
        RAISE EXCEPTION 'Unauthorized: Only system admins can create global alerts';
    END IF;

    -- Insert a system notification for every active profile
    INSERT INTO notifications (user_id, type, title, title_ar, message, message_ar)
    SELECT 
        id, 
        'system', 
        p_title, 
        p_title_ar, 
        p_message, 
        p_message_ar
    FROM profiles
    WHERE id != auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
