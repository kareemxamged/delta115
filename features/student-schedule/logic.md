# Logic Breakdown: `StudentSchedule.tsx`

## The "How" and "Why"
This module operates exclusively as a **Temporal Render Engine**, mapping linear exam data onto a multi-dimensional chronological grid without external calendar libraries.

### 1. State Normalization
- **How**: It utilizes a standard fetch-on-mount pattern against `examService.getExams()` and anchors a pure, immutable array mapping to the `Exam[]` interface.
- **Why**: Centralizing the true data source prevents syncing mismatches across Month/Week/List views.

### 2. Native Chrono-Arithmetic
- **How**: Implements manual mathematics traversing JavaScript's mutable `Date` object:
  - `getDaysInMonth`: Leverages the zero-index day anomaly: `new Date(year, month + 1, 0).getDate()`.
  - `getFirstDayOfMonth`: Maps exact day-of-week indexing (0 = Sunday).
  - Mutative Navigation: Modifies the `currentDate` buffer by adding/subtracting Months (+1/-1) or Dates (+7/-7).
- **Why**: Eliminates the need for heavy external modules like `moment.js` or `date-fns`, prioritizing a lean client footprint.

### 3. Synchronous Date Iteration Rendering
- **How**: `renderMonthView` explicitly executes two distinct `for-loops`:
  1. Spacing iterator: Injects blank invisible flex cells sequentially up to the `firstDay` integer.
  2. Day iterator: Generates populated nodes mapping 1..to..`daysInMonth`.
- **Why**: Converts continuous linear time into a standard 7-column flex/grid wrapping format representing standard UI calendars.

### 4. Heuristic Status Engine
- **How**: Evaluates three constraints: the payload `submission_status`, payload `start_time`, and real-time execution `new Date()`. Maps logic waterfalls checking for Completion, then Historical Misses, then Current Day overlaps, defaulting to 'Upcoming'.
- **Why**: Provides automated zero-input visual telemetry alerting students to critical actions (e.g. failing to take a scheduled exam).

---

## 🔍 Review Report (Architectural Audit)
- **Critical Performance Leak $O(N \times M)$**: The function `renderDayCell` executes `exams.filter(isSameDate)` on every single grid cell. In a month grid, this loops 31 times. If there are 1,000 exams in history, this implies 31,000 synchronous `new Date(e.start_time)` instantiations and deep object comparisons *per render cycle*. **Fix:** The components should pre-index the payload exactly once during the `useEffect`: mapping `const IndexedExams: Record<string, Exam[]> = ...` utilizing `YYYY-MM-DD` string keys.
- **UX Routing Disconnect**: Clicking a specific exam cell on the calendar executes `navigate('/student/exams')`, taking the user back to the general library search rather than dropping them into the specific `/student/exam/${exam.id}` portal like the List view does.
- **UI Bug (Duplicate Icon Payload)**: The "Week" and "List" toggles currently mount identical inline SVG instances (`<Icons.List />`), creating a visual discrepancy where "Week" fails to provide context-aware iconography.
