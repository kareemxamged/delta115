# Logic Breakdown: `StudentCourses.tsx`

## The "How" and "Why"
This module functions as the high-level **Curriculum Gateway**, managing active and historical learning tracks by filtering payload parameters before routing to deep-dive specific pathways.

### 1. Synchronous Multi-Axis Filter Pipeline
- **How**: Defines a mutative `filteredCourses` constant directly inside the render loop rather than via `useEffect/useState` pairs. It sequentially chains four distinct validation steps:
  1. `matchesSearch`: Tests text against `.name` OR `.code`.
  2. `matchesTab`: Validates literal union flags `'current'` vs `'past'` against DB enum `enrollment_status`.
  3. `matchesSemester` & `matchesDept`: Validates literal string mappings.
- **Why**: Since `filteredCourses` is purely derived state from existing memory footprints (`searchQuery`, `filterDept`, `courses`), recalculating it inline mathematically avoids complex Redux/Context payload syncing patterns and React batching limits.

### 2. State-Injected Deep Linking
- **How**: Overloads the traditional `react-router-dom` navigation hook by passing secondary memory objects:
  - `navigate('/student/courses/123', { state: { activeTab: 'exams' } })`
- **Why**: Allows the global gateway to bypass the default "Course overview" screen mapping and instantly drop the user into directly applicable sub-interfaces (like 'Materials' or 'Grades') from the highest level grid, removing unnecessary clicks.

### 3. Asymmetric Grid Deployment
- **How**: Encapsulates iterative `.map()` loops directly into a constrained CSS string `display: 'grid', gridTemplateColumns: '1fr 300px'`. Resulting in a main dynamic list paired with a permanently pinned static sidebar.
- **Why**: Guarantees visual uniformity preventing massive DOM layouts from collapsing when filter states return 0 array elements.

---

## 🔍 Review Report (Architectural Audit)
- **Dead Layout Data (Mock Toxicity)**: A critical architectural flaw. The "Sidebar Stats" block rendering `GPA: 3.45` and `Credits: 87`, alongside the `Students: --` counter inside the main layout, are fully hardcoded strings rather than states mapped to an API fetch layer. If pushed to production without modification, real students will see fake static numbers.
- **Iconography System Split**: The component imports heavy SVG payloads through `lucide-react` (e.g., `Loader2`, `FileText`), but also maintains a manual `const Icons = {...}` SVG dictionary inline. This breaks DRY methodology and needlessly increases CSS paint-times and overall JS bundle size.
- **Dormant Filtering Logic Map (Dropdowns)**: The dropdown `<select>` options for `filterSemester` ("Fall 2024") and `filterDept` ("Computer Science") are strongly typed as hardcoded strings. This completely destroys dynamic scaling if a new semester or department is added to the backend engine. They must be mapped dynamically via `Array.from(new Set(...))` similarly to how `StudentResults` managed its subjects.
