# Logic Breakdown: `StudentProfile.tsx`

## The "How" and "Why"
This module operates as a **State-Synchronized Settings Hub**, allowing users to mutate demographic data natively back to the central Supabase database cluster.

### 1. Dual-Layer Auth/Profile Synchronization
- **How**: The core `handleSave` function executes two distinct asynchronous promises. First, it hits `supabase.from('profiles').update(...)`. Immediately afterward, it executes `supabase.auth.updateUser({ data: ... })`.
- **Why**: Supabase maintains two parallel streams of truth. Authentication metadata (living inside the secure JWT context) and Public Table data (accessible via standard Postgres queries). Syncing both guarantees that global hooks like `useAuth()` update simultaneously alongside deep-level database relations without requiring a force-logout.

### 2. Dual State Footprint (Master vs Editable)
- **How**: Instantiates two states on fetch completion: `profileData` mirroring the exact DB payload, and `formData` parsing payload elements into a normalized structure (e.g., converting `data.level` to a literal String for the `<select>` dropdown compatibility). 
- **Why**: Separates the strict database response format from the highly elastic UI-driven input format, allowing users to abandon edits gracefully without mutating the main application read-only state.

### 3. Mutual Exclusivity Rendering 
- **How**: Leverages a union-typed `activeTab` to unconditionally block the rendering of inactive DOM trees (e.g., `activeTab === 'info' && (<div ... />)`).
- **Why**: Boosts DOM performance. Since the user can only see one tab at a time, entirely unmounting the hidden panels saves massive memory overhead and reduces React reconciliation cycles.

---

## 🔍 Review Report (Architectural Audit)
- **Massive Mock UI Dead Zones**: Only the `info` tab is functional. The `security` tab (Update Password, Enable 2FA), the `preferences` tab (Language, Dark Mode), and the `stats` tab (GPA, Achievements) are 100% hardcoded HTML/CSS shells. Buttons within them lack `onClick` handlers, rendering them as non-interactive phantom UI.
- **Architectural Divergence (CSS Modules vs Inline)**: Unlike previous sibling elements (e.g. `StudentCourses`, `StudentResults`) which leaned predominantly on global utility classes and inline JSON maps, this file implements `import styles from './StudentProfile.module.css'`. This indicates a fragmented design system lacking unified stylistic standards across the React tree.
- **Missing Abstract Service Layer**: Rather than implementing `profileService.updateProfile()`, this component bypasses abstraction and executes raw, direct `supabase.from()` calls within its body. This violates the established Service Repository pattern visible across `examService` and `courseService`.
