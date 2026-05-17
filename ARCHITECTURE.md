# Project Architecture - Nashrik

Nashrik is a campus activities platform designed to manage and discover student-led events and clubs. This document breaks down the project structure and architectural decisions.

## 🛠 Tech Stack
- **Frontend**: React (Vite-powered)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS & Vanilla CSS (Modern CSS variables, Utility-first approach)
- **Localisation**: i18next (English & Arabic support)
- **State Management**: React Context API (Auth, Theme)

---

## 📂 Project Structure

### `/src` - Source Code Root
The heart of the application, containing all logic and UI components.

- **`/pages`**: Top-level route components. Organized by user role and function:
    - **`/auth`**: Login, Registration, and Password Reset.
    - **`/admin`**: System-level administration (e.g., Club approvals).
    - **`/club-admin`**: Tools for club leaders (Event creation, Member management).
    - **`/student`**: User-specific views (My events, Profile).
    - **`/shared`**: Pages accessible to all logged-in users (Settings, Notifications).
    - `LandingPage.jsx`: Public-facing home page.
    - `NotFoundPage.jsx`: 404 error page.

- **`/components`**: Reusable UI elements, categorized by purpose:
    - **`/layout`**: Structural components like `Navbar`, `Sidebar`, and `Footer`.
    - **`/ui`**: Atomic components (Buttons, Inputs, Modals, Cards).
    - **`/events`**: Event-specific components (EventList, EventFilter).
    - **`/common`**: Utility components like `LoadingSpinner` or `ErrorBoundary`.

- **`/contexts`**: Global state management providers.
    - `AuthContext.jsx`: Handles user authentication state, session persistent, and role-based access.
    - `ThemeContext.jsx`: Manages Light/Dark mode and CSS variable injection.

- **`/lib`**: External service configurations and utilities.
    - `supabase.js`: Supabase client initialization.
    - `i18n.js`: Internationalization setup.
    - `utils.js`: Helper functions (formatters, validators).
    - `constants.js`: System-wide constants (Roles, API endpoints).
    - `mockData.js`: Placeholder data for development and testing.

- **`/locales`**: Language translation files.
    - `en.json`: English strings.
    - `ar.json`: Arabic strings (RTL support).

- `App.jsx`: Main routing logic and context provider wrappers.
- `main.jsx`: Entry point for React, handles i18n initialization.
- `index.css`: Global styles, themes, and design system tokens.

---

### `/supabase`
Contains database-related infrastructure code.
- `schema.sql`: Snapshot of the table structures, triggers, and RLS policies.
- `storage.sql`: Storage bucket configurations and policies.
- `fix_trigger.sql`: Specific SQL fixes (e.g., for user insertion triggers).

### Root Config Files
- `package.json`: Project dependencies and scripts.
- `vite.config.js`: Vite build and development configuration.
- `.env`: Environment variables (Supabase URL, API Keys).

---

## 🔄 Core Flows

### 1. Authentication Flow
1. `AuthContext` checks for an existing session on mount.
2. `LoginPage` uses Supabase Auth to sign in.
3. Upon success, `AuthContext` updates, and `App.jsx` redirects the user based on their **role** (Admin, Club Admin, or Student).

### 2. Localization Flow
1. `i18n.js` detects the user's preferred language (persisted in localStorage).
2. All strings in components are wrapped in `t()` function.
3. CSS uses `dir="rtl"` dynamically when Arabic is selected to flip the layout.

### 3. Theme Flow
1. `ThemeContext` applies either `.light-mode` or `.dark-mode` class to the body.
2. `index.css` defines color variables for both modes, ensuring a seamless visual transition.

### 4. Club Application Approval Flow
1. A club admin submits a new club application from `/club-admin/apply`.
2. The application is stored in the `clubs` table with `status = 'pending'`.
3. While the application is pending, the club admin dashboard shows an **Application Pending** state and blocks club-management tools such as event creation, member management, announcements, analytics, and QR scanning.
4. A system admin reviews pending applications from `/admin/clubs`.
5. If the system admin approves the application:
    - The club status changes to `approved`.
    - The club admin dashboard becomes active.
    - The club admin can manage events, members, announcements, analytics, and attendance scanning.
6. If the system admin denies the application:
    - The club status changes to `rejected`.
    - The club admin dashboard shows a clear **Application Rejected** state.
    - The rejected club is not shown as an active club to students.
    - Club-management tools remain blocked because the club is not active.
    - The UI explains that the application was rejected and provides an **Edit and Resubmit** action.
    - Resubmission updates the existing club record, changes `status` back to `pending`, and sends it through the same admin review flow again.
