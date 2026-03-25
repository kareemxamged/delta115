# Logic Breakdown: `ExamsList.tsx`

## The "How" and "Why"
The `ExamsList.tsx` file serves as the main dashboard for a student to view their available, upcoming, ongoing, and finished exams. It fetches data asynchronously on mount, tracks local state for complex multi-factor filtering, and handles client-side pagination.

### 1. Data Fetching & Initialization
- **How**: On mount, a `useEffect` triggers `examService.getExams()`. It utilizes a `try/catch/finally` block to set the `exams` state and toggles the `loading` state to `false` when finished.
- **Why**: Standard React pattern for data fetching. It ensures the UI knows exactly when the network request ends (via `finally`) to remove loading spinners.

### 2. Multi-Level Filtering (The Core Logic)
- **How**: The `filteredExams` array is derived using `useMemo()`. It watches 4 state variables: `activeTab`, `searchTerm`, `subjectFilter`, and `statusFilter`. 
  - Filtering order:
    1. Checks if `activeTab` matches the exam `status`.
    2. Checks if `searchTerm` occurs within the exam `title` (case-insensitive).
    3. Checks if `subjectFilter` matches the exam `subject`.
    4. Checks if `statusFilter` matches the exam `status` again.
- **Why**: Using `useMemo` avoids recalculating all filters on every render if the base `exams` array or filter states haven't changed.
- **Edge Cases Handled**:
  - Empty search terms are ignored cleanly.
  - "All" values for dropdowns bypass the strict equality check.
  - Ensures changes automatically reset the pagination logic.

### 3. Client-Side Pagination
- **How**: Calculates `totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE)`. `paginatedExams` is a direct slice of the `filteredExams` array.
- **Why**: Performance optimization. Fetching all exams at once and storing them in client memory, then surfacing only 6 items per page prevents layout thrashing.
- **Edge Cases Handled**:
  - `handlePageChange` enforces boundary conditions (`newPage >= 1 && newPage <= totalPages`).
  - Automatically resets to `Page 1` if a user modifies any filter (via a `useMemo` hook watching `filteredExams`).
  - Calls `window.scrollTo` to jump users back to the top when navigating pages.

### 4. Dynamic Icon generation
- **How**: `getSubjectIcon(subject)` uses substring matching string logic (`includes`) against the subject string. 
- **Why**: Avoids needing specific icon URL fields per exam object. Uses robust inline SVGs, returning varying icons for 'math/calculus', 'physics/biology', 'english', 'computer/react', and 'history/geo'.

---

## 🔍 Review Note (Architectural Audit)
- **Bug/Edge Case**: In the `cardActions` JSX, there is a malformed SVG inside a `button` tag (commented as "Resume Button if started"). However, there are parsing anomalies with nested SVGs directly inside the `button` element depending on the styling block (`styles.primaryBtn`).
- **Optimization 1 - Redundant Filter Logic**: The `statusFilter` (Dropdown) and `activeTab` (Tabs) both filter by the exact same `exam.status` property. This creates a logical trap: If a user clicks the "Upcoming" tab, then selects "Finished" in the dropdown, the result set is guaranteed to be 0 (`status === 'upcoming' && status === 'finished'`). These states should be combined or synchronized.
- **Optimization 2 - useMemo Abuse**: The code uses a `useMemo` specifically to execute a side-effect (`setCurrentPage(1)`) whenever `filteredExams` changes. **This is a strong React anti-pattern.** `useMemo` should be functionally pure and not trigger state updates. It should be replaced with a `useEffect`.
- **Optimization 3 - Missing Loading State UI**: While `loading` state exists and is successfully managed, it's not being rendered in the JSX. Users see "No exams found matching your criteria" during the initial API fetch, which causes UI jitter.
