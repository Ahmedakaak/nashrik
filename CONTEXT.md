# Nashrik — Migration Context

> Last updated: 2026-04-30

## Current State: Phase 7 Complete — Supabase Migration Done

The platform has been fully migrated from local mock data (`mockData.js`) to a live **Supabase** backend. The mock data file has been **deleted**. All pages now consume real data through the API service layer.

---

## What Was Done

### API Service Layer (`src/lib/api/`)
A modular service layer was built covering all business domains:

| File | Purpose |
|------|---------|
| `clubs.js` | CRUD for clubs, `getClubByAdminId()` for admin pages |
| `events.js` | CRUD for events, `getEventsByClub()`, `getAllEvents()` |
| `registrations.js` | Register/cancel, `getMyRegistrations()`, `getEventAttendees()`, `markAttended()` |
| `memberships.js` | Join/leave clubs, `getClubMembers()`, `updateMemberStatus()` |
| `announcements.js` | CRUD for announcements with author profile join |
| `notifications.js` | Fetch/mark-read notifications |
| `comments.js` | Event discussion comments |
| `admin.js` | Platform stats, user management, pending clubs, users by role |
| `storage.js` | Image upload to Supabase Storage buckets |

### Pages Rewired (18 total)

**Student (7 pages):**
- `DashboardPage` — stats, upcoming events, announcements from Supabase
- `EventsPage` — event listing with filters, cover images from storage
- `EventDetailsPage` — event detail + register/cancel via API
- `ClubsPage` — club grid with membership status badges
- `ClubProfilePage` — club detail, join/leave, events tab
- `MyRegistrationsPage` — user's registrations with QR token display
- `MyClubsPage` — user's club memberships from `getMyMemberships()`

**Club Admin (6 pages):**
- `DashboardPage` — uses `getClubByAdminId(user.id)` to find admin's club
- `EventManagementPage` — create/edit/delete/publish events via API
- `MemberManagementPage` — approve/reject/remove members via API
- `AnnouncementsPage` — create/edit/delete announcements via API
- `QRScannerPage` — attendee list from `getEventAttendees()`, `markAttended()` API
- `AnalyticsPage` — charts computed from real event/member data

**System Admin (5 pages):**
- `AdminDashboardPage` — platform stats from `getPlatformStats()`, users by role pie chart
- `UserManagementPage` — list/filter users, change roles, toggle status via API
- `ClubApprovalPage` — approve/reject pending clubs, delete clubs via API
- `AdminEventManagementPage` — feature/publish/cancel events across all clubs
- `ReportsPage` — attendance/engagement/club activity reports + PDF export from real data

### Key Patterns
- **Auth**: All pages use `useAuth()` from `AuthContext` to get `user.id`
- **Club Admin**: Pages call `getClubByAdminId(user.id)` to resolve the admin's club dynamically (no hardcoded `ADMIN_CLUB_ID`)
- **Member data**: Club members are fetched with profile joins (`profile:profiles(...)`)
- **Loading**: All async pages use `<PageLoader />` from `components/common/LoadingSpinner`
- **Toasts**: Mutations show success/error feedback via `react-hot-toast`
- **Constants**: `categoryColors`, `categoryIcons`, `CLUB_CATEGORIES` live in `src/lib/constants.js`

---

## What Remains

### Must Do
1. ✅ **Wire `NotificationsPage`** (`src/pages/shared/NotificationsPage.jsx`) — connect to `src/lib/api/notifications.js`
2. ✅ **Wire `EventDiscussion` component** — connect to `src/lib/api/comments.js`
3. ✅ **Clean up dev login** — remove any dev/mock login shortcuts from `LoginPage` and `AuthContext`

### Nice to Have
4. ✅ **Create `supabase/seed.sql`** — created sample data for fresh deployments
5. ✅ **Code splitting** — implemented `React.lazy` and `Suspense` in `App.jsx`
6. ✅ **Real QR scanning** — integrated `html5-qrcode` and `qrcode` for live scanning
7. ✅ **Real-time features** — Implemented for Notifications, Event Discussions, and Registration counts
8. ✅ **End-to-end testing** — RLS policies validated (57/61 passed), browser E2E smoke tests for all 3 roles passed. Script: `tests/e2e-rls-tests.mjs`

---

## File Structure Reference

```
src/
├── lib/
│   ├── api/           # ← All Supabase queries live here
│   │   ├── clubs.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── memberships.js
│   │   ├── announcements.js
│   │   ├── notifications.js
│   │   ├── comments.js
│   │   ├── admin.js
│   │   └── storage.js
│   ├── constants.js   # Category colors/icons, roles, statuses
│   └── supabase.js    # Supabase client init
├── contexts/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   ├── student/       # 7 pages — all wired ✅
│   ├── club-admin/    # 6 pages — all wired ✅
│   ├── admin/         # 5 pages — all wired ✅
│   ├── shared/        # NotificationsPage — wired ✅
│   └── auth/          # Login/Register — dev login cleaned ✅
└── components/
    ├── common/        # LoadingSpinner, ErrorBoundary
    ├── layout/        # Navbar, Sidebar, Footer
    └── events/        # EventDiscussion — wired ✅
```

## Build Status
- **Last build**: ✅ Passes (`npm run build`, exit code 0)
- **mockData.js**: ❌ Deleted — zero mock imports remain
