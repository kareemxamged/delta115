# Project History - Detailed Technical Log

**Project Name:** Exam Management System  
**Framework:** React 18 + TypeScript  
**Build Tool:** Vite  
**Backend:** Supabase (Auth + Postgres)  
**Styling:** Vanilla CSS Modules + global variables (Glassmorphism)

---

## Detailed Implementation Log

### 1. Authentication Module
The authentication system was the primary focus of the initial development phases.

#### A. Login Flow (`src/pages/Login.tsx`)
*   **Logic:** Uses `authService.signIn()` interacting with `supabase.auth.signInWithPassword`.
*   **Safety Handling:** Implemented a **10-second safety timeout** using `Promise.race()` to prevent the UI from checking indefinitely if the network or Supabase client hangs.
*   **Role Redirection:** After successful login, the system fetches the user profile (`src/services/auth.ts`) to determine the role (`admin`, `teacher`, `student`) and redirects via `react-router-dom`.
*   **UI Components:**
    *   **Password Toggle:** Custom SVG icon to show/hide password.
    *   **Google Auth:** Integrated `supabase.auth.signInWithOAuth`.

#### B. Registration Flow (`src/pages/Register.tsx`)
*   **Architecture:** Split into a parent component managing state and child components for each step.
*   **Steps:**
    1.  **Account Info:** Email, Password (with strength meter), Name.
    2.  **Role Selection:** Choice between Student and Teacher.
    3.  **Metadata:** Dynamic fields based on role (e.g., "Student ID" for students, "Department" for teachers).
*   **Database:** Writes extra user data to a separate public `profiles` table via a Supabase Trigger or direct insert (handled in `authService.signUp`).

#### C. Password Recovery (`src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx`)
*   **Forgot Password:** Simple form to trigger `supabase.auth.resetPasswordForEmail`.
*   **Reset Password & Deep Linking:**
    *   **Session Guard:** The page rigorously checks for a valid auth session. It includes a **1.5s delay** (`useEffect`) to allow the Supabase client to parse the hash fragment (#access_token=...) from the URL.
    *   **Timeout Handling:** Similar to Login, the "Update Password" action has a timeout wrapper to handle network hangs gracefully.
    *   **UI States:**
        *   `Verifying...` (Sandglass spinner).
        *   `Invalid Link` (If token is expired/missing).
        *   `Success` (Professional card, no alerts).
        *   `Delayed` (If timeout occurs, informs user change likely happened).

### 2. Core Architecture & Routing

#### A. Services (`src/services/`)
*   `auth.ts`: Abstracted layer over Supabase Auth SDK. Centralizes `sigIn`, `signUp`, `signOut`, `getCurrentProfile` logic.
*   `supabase.ts`: Singleton instance of the Supabase client.

#### B. Routing (`src/App.tsx`, `src/components/PrivateRoute.tsx`)
*   **Logic:** Routes are wrapped in `<PrivateRoute>`.
*   **Guard:** Checks `user` object from `useAuth` hook.
    *   If `user` is null → Redirect to `/login`.
    *   If `user.role` !match allowed → Redirect to `/unauthorized`.
*   `RootRedirect`: Handles the `/` path to smartly send users to their dashboard or login based on session.

#### C. State Management
*   **Context API:** `AuthProvider` (`src/hooks/useAuth.tsx`) wraps the app.
*   **Persistence:** Relies on Supabase's built-in local storage persistence, synchronized via `onAuthStateChange`.

### 3. Design System (`src/index.css`)
*   **Theme:** Dark Mode by default.
*   **Variables:**
    *   `--bg-app`: `#0f172a` (Deep Slate)
    *   `--primary`: `#6366f1` (Indigo 500)
    *   `--glass-effect`: `blur(10px)` with semi-transparent backgrounds.
*   **Components:** Global classes like `.glass-card`, `.btn-primary` ensure consistency across all auth pages.

### 4. Bug Fixes & Refinements
*   **Fixed:** Login redirection loop where `Layout` renders before auth check.
*   **Fixed:** "Updating..." infinite hang in Password Reset (solved via Timeout + Session Check).
*   **Fixed:** Alignment issues in "Back to Login" buttons.
*   **Fixed:** Missing routes for `/forgot-password` in `App.tsx`.
*   **Fixed:** Auth Redirects: Authenticated users are now correctly redirected from `/login` and `/register` to their dashboards.
*   **Fixed:** Login/Register Flash: Prevented "flash of unauthenticated content" by checking loading state.
*   **Fixed:** Registration Error (500): Fixed a database trigger crash in `handle_new_user` by making role casting safe and robust.
*   **Fixed:** Admin Registration: Fixed a bug where Admin metadata (Employee ID, Department) was not being saved.

### 5. Student Module Enhancements (`src/pages/student/`)

#### A. Student Dashboard (`src/pages/StudentDashboard.tsx`)
*   **UI Overhaul:** Replaced basic layouts with a premium **Glassmorphism** design.
*   **Visuals:** Replaced all emoji icons with professional SVG icons.
*   **Features:**
    *   **Stats Grid:** Cards for Total Exams, Completed, Pending, and GPA.
    *   **Performance Chart:** Custom SVG-based line chart (dependency-free) to show trend.
    *   **Interactive Header:** Welcome message with time-based greeting.

#### B. Exams List Page (`src/pages/student/ExamsList.tsx`)
*   **Core Feature:** A dedicated library page for students to browse exams.
*   **Advanced Filtering:**
    *   **Search:** Real-time search by exam title.
    *   **Tabs:** Quick filters for All, Upcoming, Ongoing, Finished.
    *   **Dropdowns:** Secondary filters by Subject and Status.
*   **Grid Layout:** Displayed exams in a structured card grid with hover effects.
*   **Exam Cards:** Detailed cards showing:
    *   Subject Icon & Color coding.
    *   Tutor Name, Duration, Question Count.
    *   Action Buttons (Start, Details, Review).
*   **Pagination:** Implemented client-side pagination logic (6 items per page) with working Next/Prev controls.
*   **Quick View Modal:** A detailed overlay appearing when clicking "Details", showing extended exam metadata.

#### C. Student Profile (`src/pages/student/StudentProfile.tsx`)
*   **Design:** Implemented a new "Glassmorphism" layout with a dynamic header and pill-shaped tabs.
*   **Tabs:**
    *   **Info:** Editable personal details (Name, Major, ID) connected to Supabase `profiles` table.
    *   **Security:** UI for password and 2FA management.
    *   **Preferences:** Settings for language and theme.
    *   **Stats:** Visual badges and academic performance metrics.
*   **Routing:** Accessible via `/student/profile`.

#### D. Exam Engine (`src/pages/student/ExamEngine/`)
*   **Full-Screen Interface:** A dedicated, distraction-free layout for taking exams.
*   **Timer Logic:** Real-time countdown timer that auto-submits the exam when time runs out.
*   **Question Navigation:** Sidebar navigation to jump between questions, flag for review, and track progress.
*   **State Management:** Persists answers locally to prevent data loss on refresh.
*   **Auto-Submit:** Triggers automatic submission upon timer expiry or manual confirmation.

#### E. Exam Results (`src/pages/student/ExamResult/`)
*   **Performance Analysis:** Detailed breakdown of score, time taken, and accuracy.
*   **Charts:** Visual representation of performance using custom SVG charts.
*   **Review Mode:** Allows students to review their answers against the correct ones (if enabled).
*   **History:** `StudentResults.tsx` lists all past attempts with filtering capabilities.

#### F. Schedule & Calendar (`src/pages/student/StudentSchedule.tsx`)
*   **Calendar View:** Interactive monthly/weekly calendar showing upcoming exams.
*   **List View:** Alternative chronological list of scheduled events.
*   **Integration:** Fetches real exam dates from the database and maps them to the calendar interface.

#### G. Courses Module (`src/pages/student/StudentCourses.tsx`)
*   **Course Listing:** browse enrolled courses with progress bars and status indicators.
*   **Course Details:** Deep dive into specific courses (`/student/courses/:id`) featuring:
    *   **Tabbed Interface:** Exams, Grades, and Materials.
    *   **Quick Actions:** "Start Next Exam" shortcuts.
    *   **Teachers:** Display course instructors.
*   **Data integration:** Fully connected to `courses` and `enrollments` tables in Supabase.

