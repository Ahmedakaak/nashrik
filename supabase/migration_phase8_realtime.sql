-- ============================================
-- Nashark Phase 8: Realtime Migrations
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable Realtime for Events table (to stream registration counts)
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Enable Realtime for Event Comments table (to stream new discussion comments)
ALTER PUBLICATION supabase_realtime ADD TABLE event_comments;
