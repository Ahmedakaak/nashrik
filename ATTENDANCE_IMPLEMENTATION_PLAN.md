# Attendance System Implementation Plan

## Goal

Create a reliable event attendance system for Nashrik where students receive secure event-specific QR codes, club admins scan or manually verify attendance at events, and system admins can report on participation across clubs and events.

## Current Baseline

The app already has the core foundation:

- `event_registrations` table with `attended`, `attended_at`, and `qr_token`.
- Student registration flow in `src/lib/api/registrations.js`.
- QR display in `src/pages/student/MyRegistrationsPage.jsx`.
- Club admin QR scanner in `src/pages/club-admin/QRScannerPage.jsx`.
- Attendance-related counts in dashboards and reports.
- Supabase Auth, role-based routing, and RLS policies.

The implementation should therefore improve and complete the existing attendance flow instead of creating a separate attendance module from scratch.

## Required Capabilities

### Student

- Register for an event and receive a unique QR code for that registration.
- View upcoming, past, and attended events.
- Show the QR code at the event check-in desk.
- See attendance status after check-in.
- Prevent reuse of cancelled registrations or invalid QR tokens.

### Club Admin

- Select an event owned by their club.
- Scan a student QR code.
- Manually search by student ID as a fallback.
- Mark a student as attended.
- See already-attended, registered, cancelled, and invalid states clearly.
- View attendance progress for the selected event.
- Export or review attendee lists after the event.

### System Admin

- View attendance rates across events, clubs, and time periods.
- Identify high/low participation events.
- Export reports to PDF or CSV.
- Audit who checked in attendees if needed.

## Data Model Work

### Keep

Use `event_registrations` as the source of truth for registration and attendance:

- `id`
- `event_id`
- `user_id`
- `status`
- `attended`
- `qr_token`
- `registered_at`
- `attended_at`

### Add Or Harden

Add these fields if stronger auditing is required:

- `checked_in_by UUID REFERENCES profiles(id)` to record the club admin who marked attendance.
- `check_in_method TEXT CHECK (check_in_method IN ('qr', 'manual'))` to distinguish QR scans from manual entry.
- `cancelled_at TIMESTAMPTZ` if cancelled registrations remain as records instead of being deleted.

Add or confirm indexes:

- `event_registrations(event_id)`
- `event_registrations(user_id)`
- `event_registrations(qr_token)`
- Unique constraint on `(event_id, user_id)`.

## Security And RLS

The current RLS policy allows users to update their own registration, which is risky if it lets students mark themselves attended. Tighten this so:

- Students can create their own registration.
- Students can cancel their own registration, but cannot set `attended`, `attended_at`, `checked_in_by`, or `check_in_method`.
- Club admins can view registrations for events owned by their club.
- Club admins can mark attendance only for events owned by their club.
- System admins can read attendance data for reports.

Preferred approach:

- Add a Supabase RPC function such as `mark_registration_attended(registration_id, method)` with security checks inside the database.
- Call that RPC from `src/lib/api/registrations.js` instead of updating `event_registrations` directly from the client.

## API Layer Work

Update `src/lib/api/registrations.js` with attendance-specific functions:

- `getEventAttendees(eventId)` returns registration, profile, and attendance status.
- `markAttended(registrationId, method)` uses the secure RPC function.
- `findRegistrationByQrToken(eventId, qrToken)` validates the token belongs to the selected event.
- `markManualAttendance(eventId, studentId)` handles manual lookup and check-in.
- `getAttendanceSummary(eventId)` returns totals for registered, attended, absent, cancelled, and attendance rate.

Keep all Supabase query details inside the API layer so pages stay focused on UI behavior.

## UI Implementation Work

### Student Registration Page

Improve `src/pages/student/MyRegistrationsPage.jsx`:

- Only show QR codes for confirmed upcoming registrations.
- Show a clear attended badge for checked-in events.
- Show cancelled or unavailable states if retained in the database.
- Localize all hardcoded English strings in `src/locales/en.json` and `src/locales/ar.json`.

### Club Admin Scanner

Improve `src/pages/club-admin/QRScannerPage.jsx`:

- Validate scans against the selected event before marking attendance.
- Send check-in method as `qr` or `manual`.
- Show the scan result with student name, student ID, and status.
- Add an explicit retry flow after a scan.
- Disable check-in for cancelled, waitlisted, or already-attended records.
- Add empty state when the club has no events.

### Reports And Analytics

Improve:

- `src/pages/club-admin/AnalyticsPage.jsx`
- `src/pages/admin/ReportsPage.jsx`

Needed metrics:

- Registered count.
- Attended count.
- Absent count.
- Attendance rate.
- Attendance trend by month.
- Top events by attendance.
- Low attendance events requiring follow-up.

## Database Migration Steps

Create a new migration file, for example:

`supabase/migration_attendance_hardening.sql`

Include:

1. Optional audit columns.
2. QR token index.
3. Secure attendance RPC function.
4. Revised RLS policies for student cancellation and club-admin check-in.
5. Admin reporting read policies if missing.

## Testing Plan

### Unit Tests

Add focused tests for attendance helpers if logic is extracted into utilities:

- QR token validation.
- Attendance summary calculation.
- Event status and registration status rules.

### RLS Tests

Extend `tests/e2e-rls-tests.mjs`:

- Student can register for an event.
- Student cannot mark themselves attended.
- Club admin can mark attendance for their own club event.
- Club admin cannot mark attendance for another club event.
- System admin can read attendance report data.

### Browser Smoke Tests

Verify:

- Student registers and sees QR code.
- Club admin scans that QR and marks attendance.
- Duplicate scan shows already-attended state.
- Manual student ID check-in works.
- Attendance count updates after check-in.
- Reports show attended count and rate.

## Implementation Order

1. Harden database schema and RLS.
2. Update `src/lib/api/registrations.js` to use secure attendance functions.
3. Update club-admin scanner behavior.
4. Update student QR/status display.
5. Update analytics and reports to use real attended counts.
6. Add/extend RLS and smoke tests.
7. Run `npm run build` and `npm test`.

## Acceptance Criteria

- A student cannot mark themselves attended from the client.
- A club admin can only check in students for events owned by their club.
- QR codes are unique per registration and only valid for the selected event.
- Duplicate scans do not change data and show a clear warning.
- Manual check-in works by student ID.
- Attendance status appears correctly for students and club admins.
- Reports distinguish registered count from actual attended count.
- Build and tests pass.

