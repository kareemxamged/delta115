# Logic Breakdown: `ExamDetails.tsx`

## The "How" and "Why"
The `ExamDetails.tsx` module acts as a strict informational gateway before a student enters an examination session. It focuses on presenting static meta-data while enforcing a visual start mechanism.

### 1. Route Parameter Extraction and Hydration
- **How**: Utilizes `useParams<{ id: string }>()` to strictly extract the ID from the URL string. Triggers a `useEffect` that calls `examService.getExamById(Number(id))`.
- **Why**: Standard dynamic routing pattern. This decouples the view from previous state, allowing users to send direct links or refresh the detail page directly without losing data.
- **Edge Cases Handled**:
  - Gated by `if (id)` before attempting fetch.
  - Graceful fallback: Traps fetch errors in a `catch` block and unconditionally routes the user back to the safe `/student/exams` directory via `navigate()`.

### 2. The Mock Countdown Timer
- **How**: Implements a `setInterval` hook calculating simple math against `new Date()` (specifically `23 - now.getHours()`, `59 - now.getMinutes()`, etc.).
- **Why**: Included purely as a visual UI prop for demonstration purposes. It gives the user a sense of urgency but is completely detached from absolute server time.
- **Edge Cases Handled**:
  - Cleanup phase: `clearInterval(timer)` is strictly returned in the `useEffect` unmount cycle to prevent catastrophic memory leaks or zombie loops navigating away.

### 3. The Start Modal Gating
- **How**: The "Start Exam Now" button sets a local boolean `showStartModal(true)`. This conditionally mounts an overlay `<div>` in the DOM containing warnings. Clicking Confirm runs `handleStartExam`.
- **Why**: Prevent accidental starts. Taking an exam is a destructive/high-stakes action that locks the session; this enforces explicit declarative consent from the user.

---

## 🔍 Review Report (Architectural Audit)
- **Critical Logic Disconnect**: The timer logic `(23 - now.getHours())` is entirely mock. It has absolutely no correlation with `exam.start_time`. In a production environment, this is a fatal flaw and must be connected to a synchronized server UTC time to prevent client-side clock tampering.
- **Structural Anomaly in Conditional Rendering**: The JSX logic block rendering the primary action button (`Right Actions Column`) is deeply convoluted and partially hardcoded. For example, if `submission_status === 'submitted'`, the button text says `Review Results` but navigates to `/student/exams/${exam.id}/result`. However, right below it, the logic branches identically.
- **Type Safety Gap**: `exam.status` (`upcoming`, `ongoing`, etc.) is used directly as an indexing signature for CSS modules via `styles['status_' + exam.status]`. If an unexpected string or uppercase variation arrives from the API, the CSS binding will fail silently.
- **Missing Loading State Edge Case**: Although `loading` is correctly set to false in the `finally` block, if `data` is `null` (e.g. exam not found), the component cleanly returns `null` (Line 51). This causes a blank white screen flash right before the `navigate('/student/exams')` fully processes.
