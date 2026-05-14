-- ============================================
-- Attendance hardening
-- ============================================

ALTER TABLE event_registrations
    ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS check_in_method TEXT CHECK (check_in_method IN ('qr', 'manual'));

CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON event_registrations(qr_token);

DROP POLICY IF EXISTS "Users can cancel their registration" ON event_registrations;
DROP POLICY IF EXISTS "System admins can view all registrations" ON event_registrations;

CREATE POLICY "System admins can view all registrations"
    ON event_registrations FOR SELECT USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin'
    ));

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
