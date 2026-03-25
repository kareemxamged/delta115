# Dependencies: `ExamEngine.tsx`

## External Imports (NPM Modules)
- `react`: Specifically using `{ useState, useEffect }`. Essential for component rendering cycles and promise resolution tracking.
- `react-router-dom`: Specifically using `{ useParams, useNavigate }`. Extracts routing ID and strictly powers the `replace: true` navigation exit logic.

## Hook Sub-Dependencies
- `./hooks/useExamEngine`: The isolated monolithic logic controller defining all timer countdowns, answer local-storage mapping, and index bounds checking.

## Presentational Sub-Dependencies (Components)
- `./components/ExamHeader`: Triggers global layout for title and centralized timer.
- `./components/ExamSidebar`: Injects the right-hand (or hidden) grid table for fast navigation and flag visualization.
- `./components/QuestionArea`: The active body rendering the content payload. Expected to accept a polymorphic `question` object.
- `./components/ExamFooter`: The bottom-pinned action bar containing 'Next', 'Prev', and 'Flag' bindings.
- `./components/SummaryModal`: A full-screen Z-indexed grid mirroring the Sidebar for final review payload execution.
- `./components/ConfirmSubmitModal`: A full-screen Z-indexed card strictly enforcing submission warnings natively.
- `../../../components/LoadingSpinner`: The global UI blocking tool preventing interaction during network fetch `<LoadingSpinner fullScreen />`.

## Services & Types
- `../../../services/examService`: The data fetching protocol (`examService.getExamWithQuestions`, `examService.startExam`).
- `./types`: Imports the strict `Exam` definition schema explicitly expected by the prop drilling sequences.
