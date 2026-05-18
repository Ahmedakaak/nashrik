-- Allow rejected club membership requests to be submitted again without
-- violating the unique (club_id, user_id) membership constraint.

CREATE OR REPLACE FUNCTION public.request_club_membership(p_club_id UUID)
RETURNS club_memberships
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_membership club_memberships%ROWTYPE;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM clubs
        WHERE id = p_club_id
          AND status = 'approved'
    ) THEN
        RAISE EXCEPTION 'Club is not available for membership requests';
    END IF;

    INSERT INTO club_memberships (club_id, user_id, status, joined_at)
    VALUES (p_club_id, auth.uid(), 'pending', NOW())
    ON CONFLICT (club_id, user_id) DO UPDATE
    SET status = CASE
            WHEN club_memberships.status = 'rejected' THEN 'pending'
            ELSE club_memberships.status
        END,
        joined_at = CASE
            WHEN club_memberships.status = 'rejected' THEN NOW()
            ELSE club_memberships.joined_at
        END
    RETURNING * INTO v_membership;

    RETURN v_membership;
END;
$$;

REVOKE ALL ON FUNCTION public.request_club_membership(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_club_membership(UUID) TO authenticated;
