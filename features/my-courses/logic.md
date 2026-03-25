# Logic Documentation: My Courses (`StudentCourses.tsx`)

## State Management
- `searchQuery` (string): Real-time string matched against course Name or Code.
- `filterSemester` / `filterDept` (string): Dropdown interceptors filtering by generic strings.
- `activeTab` ('current' | 'past' | 'all'): State mapped against `enrollment_status` (`enrolled` vs `completed`).
- `courses` (Array): Payload consumed via `courseService.getEnrolledCourses()`.

## Core Logic Hooks
1. **Synchronous Filtering**: A combined `.filter()` engine resolving `matchesSearch && matchesTab && matchesSemester && matchesDept` synchronously on each render.
2. **Stateful Routing**: Action buttons in the card footer use `navigate` with inline `state` payloads (e.g. `{ state: { activeTab: 'exams' } }`) to pre-select nested tabs inside the `StudentCourseDetails` component.

## UI/UX Engineering (Proposed Architecture)
1. **Vertical Footprint Optimization**: The primary Course Card DOM is migrating from a sprawling `auto-fit` flex sequence to a highly compact 2-column internal grid, preventing vertical scroll bloat.
2. **Visual Progress Feedback**: Injection of a native structural Progress Bar linked to course performance data to provide instant telemetry.
3. **Viewport Continuity**: The right-hand `<Sidebar>` uses CSS `position: sticky` and `top: 2rem` to anchor global metrics (GPA, Credits) inside the frame while the user scrolls multiple courses.
4. **Aesthetic Consistency**: 
   - Complete migration of raw inline SVG definitions to the central `lucide-react` library.
   - Injection of the repository standard `#8b5cf6 -> #6366f1` gradient styling onto the `+ Register New Course` button and active tabs to unify the ecosystem.
