-- Allow club admins to update and delete announcements for clubs they administer.

DROP POLICY IF EXISTS "Club admins can update their announcements" ON announcements;
DROP POLICY IF EXISTS "Club admins can delete their announcements" ON announcements;

CREATE POLICY "Club admins can update their announcements"
    ON announcements FOR UPDATE USING (EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.id = announcements.club_id
          AND clubs.admin_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.id = announcements.club_id
          AND clubs.admin_id = auth.uid()
    ));

CREATE POLICY "Club admins can delete their announcements"
    ON announcements FOR DELETE USING (EXISTS (
        SELECT 1 FROM clubs
        WHERE clubs.id = announcements.club_id
          AND clubs.admin_id = auth.uid()
    ));
