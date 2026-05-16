-- Allow users to permanently delete their own notifications.
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);
