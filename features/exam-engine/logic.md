# Logic Breakdown: `ExamEngine.tsx`

## The "How" and "Why"
The `ExamEngine.tsx` file acts as the **View Orchestrator** for the actual examination process. Rather than managing the complex state of an active exam (timers, answer mapping, submission callbacks), it delegates all heavy lifting to a custom hook (`useExamEngine`) and acts exclusively as a traffic controller between the hook and the Presentational Components.

### 1. Pre-flight Initialization
- **How**: On mount, the component extracts the `id` from the parameters and immediately fires two consecutive async calls inside a `useEffect`: `examService.getExamWithQuestions(id)` and `examService.startExam(id)`.
- **Why**: The first call fetches the raw scaffolding (questions, limits, topics). The second call strictly communicates with the backend to secure an active session / submission token, logging the exact start time.

### 2. State Delegation via Custom Hook
- **How**: It passes the resolved `exam` and `submission` data directly into `useExamEngine()`, instantly destructuring 14 unique variables and mutators (e.g., `nextQuestion`, `currentQuestionIndex`, `timeLeft`).
- **Why**: Segregation of Concerns (SoC). The engine logic is highly complex; separating it into a hook allows the `.tsx` file to remain purely responsible for layout and conditional rendering, preventing an unreadable 1000-line monolithic file.

### 3. Hardened Routing Ejection
- **How**: A dedicated `useEffect` watches the `status` string from the hook. If `status === 'finished'`, it forcefully calls `navigate(..., { replace: true })`.
- **Why**: The `{ replace: true }` parameter is a critical security and UX feature. It wipes the `/take` endpoint from the browser's history stack, preventing the student from pressing the "Back" button to re-enter a submitted exam session.

### 4. Component Injection
- **How**: Passes the destructured mutating functions down to specific components (e.g., `onNext={nextQuestion}` to `ExamFooter`; `onChange={answerQuestion}` to `QuestionArea`).
- **Why**: Strictly enforces top-down data flow. The child components remain "dumb" and only trigger the orchestrator's commands.

---

## 🔍 Review Report (Architectural Audit)
- **Bottleneck in API Initialization**: The `initExam` sequential fetching (`await getExamWithQuestions` followed by `await startExam`) is an architectural bottleneck. They are independent calls that should be executed concurrently via `await Promise.all()` to halve the initial loading screen time.
- **Bug in Mobile Responsiveness**: The logic checking `window.innerWidth < 1024` to collapse the sidebar is trapped in an empty dependency array `[]` (Line 70). It exclusively runs *once* upon mount. If a user rotates their tablet from Landscape to Portrait mid-exam, the sidebar will not collapse, potentially breaking the layout. An event listener for global `resize` is required.
- **State Inconsistency on Error**: Inside the initialization `catch` block, `setError` is called, but `setIsLoading(false)` executes in the `finally` block. If `getExamWithQuestions` succeeds but `startExam` fails, the `exam` state is populated but the screen completely hard-locks into the "Failed to Load" error boundary rendering without offering to salvage the loaded question data or retry just the start sequence.
