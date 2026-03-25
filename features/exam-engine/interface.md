# Interface: `ExamEngine.tsx`

## Exported Functions
- **`export default function ExamEngine()`**: The root page-level component mapping to `/student/exams/:id/take`. Requires no direct props.

## Internal State Management
Managed locally via `useState`:
- `[exam, setExam]`: Object strictly typing to `Exam | null`.
- `[submission, setSubmission]`: Object currently typed as `any | null` (Warning: Missing strict interface).
- `[isLoading, setIsLoading]`: Boolean `true` by default.
- `[error, setError]`: String boundary trap.
- `[isSidebarOpen, setIsSidebarOpen]`: Boolean UI toggle (`true` by default).
- `[showSummary, setShowSummary]`: Boolean Modal toggle.
- `[showConfirmSubmit, setShowConfirmSubmit]`: Boolean Modal toggle.

## Core Hook Interfacing (`useExamEngine`)
The component expects the hook to return exact contractual bindings:
- **Primitives**: `currentQuestionIndex`, `totalQuestions`, `timeLeft`, `isSaved`, `status`.
- **Objects**: `currentQuestion` (Question body), `answers` (Key-value map of submitted data), `flags` (Key-value boolean map).
- **Mutators**: `nextQuestion()`, `prevQuestion()`, `jumpToQuestion(index)`, `answerQuestion(id, val)`, `toggleFlag(id)`, `finishExam()`.

## API Interactions
- **`examService.getExamWithQuestions(id)`**: Fetches deep relational data.
- **`examService.startExam(id)`**: Executed POST sequence strictly tracking the moment the exam is opened.
